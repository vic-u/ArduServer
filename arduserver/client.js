﻿const net = require('net');
const MAC_ADDRESS = '26FD52AD4E93';
var client = new net.Socket();
client.connect(3000, '194.87.144.141', function () {
//client.connect(1337, 'localhost', function () {
//client.connect(3000, 'localhost', function () {

    //#" MAC_ADDRESS "\n #T1# 26.05\n #Z1# 1 \n ##
    temp = Math.random() * 28;
    sign = Math.random() > 0.5 ? temp * -1 : temp;
    sign = sign.toFixed(2);
    //const message = Buffer.from(`=${MAC_ADDRESS}=o1s1=${sign}=ON=23=3`);
    const message = Buffer.from(`=${MAC_ADDRESS}=o1s1=${sign}==23=3`);
    console.log(""+ message);	
    console.log('Connected');
    //client.write('GET /entry/test HTTP/1.1' );// + message); 
    client.write(`GET /entry/${message} HTTP/1.1\r\n`);
    client.write('Host:ardu.damasarent.com\r\n');
    client.write('User-Agent:ARDU\r\n');
    client.write('Accept:text/html\r\n');
    client.write('Connection:keep-alive\r\n');
    client.write('\r\n');
});

client.on('data', function (data) {
    console.log('Received: ' + data);
    client.destroy(); // kill client after server's response
});

//client.on('close', function () {
//    console.log('Connection closed');
//});// JavaScript source code
