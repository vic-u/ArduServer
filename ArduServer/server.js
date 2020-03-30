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

var app = express(); //создаем express web server
app.set('views', path.join(__dirname, 'views')); //создаем алиас views для нашего каталога views
app.set('view engine', 'pug'); //будем отображать в pug

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

//app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

app.use(express.static(path.join(__dirname, 'public'))); //используем каталог статических ресурсов

app.use('/js/jquery.js', express.static('node_modules/jquery/dist/jquery.js')); //подключаем jquery

app.use('/css/bootstrap.css', express.static('node_modules/bootstrap/dist/css/bootstrap.css')); // подключаем bootstrap
app.use('/js/bootstrap.js', express.static('node_modules/bootstrap/dist/js/bootstrap.js'));

app.use('/css/bootstrap-toggle.min.css', express.static('node_modules/bootstrap-toggle/css/bootstrap-toggle.min.css')); // подключаем переключатель bs
app.use('/js/bootstrap-toggle.min.js', express.static('node_modules/bootstrap-toggle/js/bootstrap-toggle.min.js'));

app.use('/css/bootstrap-slider.min.css', express.static('node_modules/bootstrap-slider/dist/css/bootstrap-slider.min.css')); // подключаем ползунок bs
app.use('/js/bootstrap-slider.min.js', express.static('node_modules/bootstrap-slider/dist/bootstrap-slider.min.js'));

app.use('/css/mdb.min.css', express.static('node_modules/mdbootstrap/css/mdb.min.css'));
app.use('/css/style.css', express.static('node_modules/mdbootstrap/css/style.css'));
app.use('/js/mdb.js', express.static('node_modules/mdbootstrap/js/mdb.js'));
//app.use('/js/bootstrap-toggle.min.js', express.static('node_modules/bootstrap-toggle/js/bootstrap-toggle.min.js'));


app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

app.use(messages); // обработчик событий в цепочке обработчиков 

app.get('/', login.form); // при начальном открытии отображаем форму логина

app.get('/register', register.form); // припереходе к ссылке регистрации отображаем форму регистрации
app.post('/register', register.submit); // при выполнении формы регистрации обрабатываем форму

app.get('/login', login.form); // при переходе по ссылке логина отображаем форму логина
app.post('/login', login.submit); // при выполнении формы логина обрабатываем форму логина

app.get('/entries', entries.form); // возвращаем форму с графиком и список записей 
app.post('/entries', entries.submit); 

app.post('/sensor', rest.sensor); //вызываем данный рест при переключение на форме - обновляем форму и сохраняем в бд, чтобы оттуда считал модем arduino
app.get('/entry/:dt', rest.entry); // приходит с датчика по модему при очередном опросе сервера с модема arduino

app.set('port', process.env.PORT || 3000); //выставляем порт сервера
//app.set('port', process.env.PORT || 1337);
var httpserver = app.listen(app.get('port'), function () { // запускаем express сервер в работу и выводим статус на консоль
    console.log('Express server listening on port ' + httpserver.address().port);
});