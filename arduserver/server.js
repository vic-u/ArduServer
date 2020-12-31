//const net = require('net');
const express = require('express');
const path = require('path');
const debug = require('debug');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const messages = require('./middleware/messages');
const register = require('./routes/register');
const login = require('./routes/login');
const entries = require('./routes/entries');
const rest = require('./routes/rest');

const db = require('./models/db');
const DBSensor = require('./models/db').DBSensor;
const DBUser = require('./models/db').DBUser;
const MAC_ADDRESS = '26FD52AD4E93';

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/js/jquery.js', express.static('node_modules/jquery/dist/jquery.js'));
app.use('/css/bootstrap.css', express.static('node_modules/bootstrap/dist/css/bootstrap.css'));
app.use('/js/bootstrap.js', express.static('node_modules/bootstrap/dist/js/bootstrap.js'));

//app.use('/css/bootstrap-toggle.min.css', express.static('node_modules/bootstrap-toggle/css/bootstrap-toggle.min.css'));
//app.use('/js/bootstrap-toggle.min.js', express.static('node_modules/bootstrap-toggle/js/bootstrap-toggle.min.js'));

//app.use('/css/bootstrap-slider.min.css', express.static('node_modules/bootstrap-slider/dist/css/bootstrap-slider.min.css'));
//app.use('/js/bootstrap-slider.min.js', express.static('node_modules/bootstrap-slider/dist/bootstrap-slider.min.js'));

app.use('/css/mdb.min.css', express.static('node_modules/mdbootstrap/css/mdb.min.css'));
app.use('/css/style.css', express.static('node_modules/mdbootstrap/css/style.css'));
app.use('/js/mdb.js', express.static('node_modules/mdbootstrap/js/mdb.js'));
//app.use('/js/bootstrap-toggle.min.js', express.static('node_modules/bootstrap-toggle/js/bootstrap-toggle.min.js'));


app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(messages);
app.get('/', login.form);

app.get('/register', register.form);
app.post('/register', register.submit);

app.get('/login', login.form);
app.post('/login', login.submit);

app.get('/entries', entries.form);
app.post('/entries', entries.submit);

app.post('/sensor', rest.sensor); //переключение на форме
app.get('/entry/:dt', rest.entry); // приходит с датчика по модему
app.get('/filter/:dtype', rest.filter);
app.get('/entries2', entries.form);


app.set('port', process.env.PORT || 3000);
//app.set('port', process.env.PORT || 1337);
var httpserver = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + httpserver.address().port);
});