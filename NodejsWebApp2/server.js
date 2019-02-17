const net = require('net');
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

const db = require('./models/db');
const DBSensor = require('./models/db').DBSensor;
const DBUser = require('./models/db').DBUser;
const MAC_ADDRESS = '26FD52AD4E93';




const server = net.createServer(function (sock) {
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function (data) {
        console.log('DATA ' + sock.remoteAddress + ': ' + sock.remotePort + ':' + data);
        t = data.toString();
        if (data.toString() === '') return;
        // Write the data back to the socket, the client will receive it as data from the server
        //sock.write('You said "' + data + '"');
        const arr = data.toString().replace(/\s+/g, '').toUpperCase().split("#");
        if (arr.length !== 5) return;
        DBUser.findmac(arr[1], (err, data) => {
            if (data === undefined) return;
        });
        //if (arr[1] !== MAC_ADDRESS) return; //найти в базе такой мак
        
        DBSensor.getSensorData({ mac: arr[1]}, (err, snsdt)=> {
            if (err) {
                console.log('getSensorData Err: ' + err);
                return err;
            }
            res = snsdt;
            if (snsdt !== undefined) return; // запись про текущий день и час уже есть
            DBSensor.setNewData({ mac: arr[1], name: arr[2], value: arr[3] }, function (err, id) {
                if (err) {
                    console.log('setNewData Err: ' + err);
                    return err;
                }
                test = this;
                // obj.id = snsdt.id; 
            });
        });
        DBSensor.getLastCommand(arr[1], (err, data) => {
            if (err) return;
            res = (data !== undefined && data.value === 'ON') ? 'ON' : 'OFF';
            res = `#${arr[1]}#${arr[2]}#${res}`;
            sock.write(res);

        });

     });

        // Add a 'close' event handler to this instance of socket
        sock.on('close', function (data) {
            console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        });
});
    server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});
server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

server.listen(1337, '127.0.0.1');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/js/jquery.min.js', express.static('node_modules/jquery/dist/jquery.min.js'));
app.use('/css/bootstrap.css', express.static('node_modules/bootstrap/dist/css/bootstrap.css'));
app.use('/js/bootstrap.min.js', express.static('node_modules/bootstrap/dist/js/bootstrap.min.js'));

app.use('/css/bootstrap-toggle.min.css', express.static('node_modules/bootstrap-toggle/css/bootstrap-toggle.min.css'));
app.use('/js/bootstrap-toggle.min.js', express.static('node_modules/bootstrap-toggle/js/bootstrap-toggle.min.js'));

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


app.set('port', process.env.PORT || 3000);
var httpserver = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + httpserver.address().port);
});

//console.log('Server listening on ' + HOST + ':' + PORT);
/*
And connect with a tcp client from the command line using netcat, the *nix 
utility for reading and writing across tcp/udp network connections.  I've only 
used it for debugging myself.
$ netcat 127.0.0.1 1337
You should see:
> Echo server
*/

/* Or use this example tcp client written in node.js.  (Originated with 
example code from 
http://www.hacksparrow.com/tcp-socket-programming-in-node-js.html.) */

//var net = require('net');

var client = new net.Socket();
client.connect(1337, '127.0.0.1', function () {
    
    //#" MAC_ADDRESS "\n #T1# 26.05\n #Z1# 1 \n ##
    temp = Math.random() * 28;
    sign = (Math.random() > 0.5) ? (temp * -1) : temp;
    sign = sign.toFixed(2);
    const message = Buffer.from(`#${MAC_ADDRESS}#T1#${sign}#`);
    console.log('Connected');
    client.write(message);
});

client.on('data', function (data) {
    console.log('Received: ' + data);
    client.destroy(); // kill client after server's response
});

//client.on('close', function () {
//    console.log('Connection closed');
//});