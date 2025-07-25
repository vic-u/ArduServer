const express = require('express')
const path = require('path')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const messages = require('./middleware/messages')
const register = require('./routes/register')
const login = require('./routes/login')
const entries = require('./routes/entries')
const entries2 = require('./routes/entries2')
const filter = require('./routes/filter')
const sensor = require('./routes/sensor')
const entry = require('./routes/entry')

const app = express();
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))
app.use('/js/jquery.js', express.static('node_modules/jquery/dist/jquery.js'))
app.use('/css/bootstrap.css', express.static('node_modules/bootstrap/dist/css/bootstrap.css'))
app.use('/js/bootstrap.js', express.static('node_modules/bootstrap/dist/js/bootstrap.js'))
app.use('/bootstrap/css/', express.static('node_modules/bootstrap/css/'))
app.use('/css/mdb.min.css', express.static('node_modules/mdbootstrap/css/mdb.min.css'))
app.use('/css/style.css', express.static('node_modules/mdbootstrap/css/style.css'))
app.use('/js/mdb.js', express.static('node_modules/mdbootstrap/js/mdb.js'))

app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }))
app.use(messages)
app.get('/', login.form)

app.get('/register', register.form)
app.post('/register', register.submit)

app.get('/login', login.form)
app.post('/login', login.submit)
app.get('/logout', login.logout)

app.get('/entries', entries.form)
app.get('/entries2', entries2.form)

app.post('/sensor', sensor.sensor) //переключение фильтра данных на форме
app.post('/sensor2', sensor.sensor2) //переключение фильтра данных на форме

app.get('/filter/:dtype', filter.filter)
app.get('/filter2/:dtype', filter.filter2)

app.get('/entry/:dt', entry.entry) // приходит с датчика по модему
app.get('/entry2/:dt', entry.entry2) // приходит с датчиков по модему

app.set('port', process.env.PORT || 3000);
let httpserver = app.listen(app.get('port'), () =>
    console.log('Express server listening on port ' + httpserver.address().port))
