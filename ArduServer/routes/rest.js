const DBSensor = require('../models/db').DBSensor;
const DBUser = require('../models/db').DBUser;
const User = require('../models/user');
//rest, который вызывает сенсор, чтобы передать текущие данные и забрать текущие команды
exports.entry = (req, res) => {
    const data = req.params.dt;
    console.log('Fetching:', data);
    if (data.toString() === '') return;

    //const arr = data.toString().replace(/\s+/g, '').toUpperCase().split("=");
    const arr = data.toString().replace(/\s+/g, '').split("=");
    if (arr.length !== 7) return;
    DBUser.findmac(arr[1], (err, data) => {
        if (data === undefined) return next();
    
    //if (arr[1] !== MAC_ADDRESS) return; //найти в базе такой мак

        DBSensor.getSensorData({ mac: arr[1] }, (err, snsdt) => {
            if (err) {
                console.log('getSensorData Err: ' + err);
                return err;
            }
            r = snsdt;
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
        
        DBSensor.setCommand({ mac: arr[1], name: arr[2], turn: arr[4], temp: arr[5], delta: arr[6] }, function (err, data) {
            
            if (err) return next(err);
              
            DBSensor.getLastCommand(arr[1], (err, data) => {
                if (err) return err;
                r = (data !== undefined && data.turn === 'ON') ? 'ON' : 'OFF';
                r = `=${arr[1]}=${arr[2]}==${r}=${data.temp}=${data.delta}`;
                //res.write(r);
                res.send(r, 200);
                //res.end();
                });
        });

    });
   
};
//rest. который вызывается при изменении настроек в клиенте для температуры и дельты 
exports.sensor = (req, res, next) => {
    if (req.session.authorized !== true) return;
    //const data = req.body.user;
    //User.authenticate(data.mail, data.pass, (err, user) => {
    //    if (err) return next(err);
    //    if (user) {
    //        req.session.authorized = true;
    //        req.session.username = data.mail;

    //        console.log('user is here!');
    //        req.session.uid = user.id;
    //        res.redirect('/entries');
    //    }
    //    else {
    //        res.error('Sorry, invalid credentials!');
    //        res.redirect('back');
    //    }
    //});
    User.getByMail(req.session.username, (err, user) => {
        console.log('toggle switch');
        //const data = req.body.sensor;
        var turn = 'ON';
        if (req.body.turn === 'false') turn = 'OFF';//off sensor
        DBSensor.setCommand({ mac: user.mac, name: 'o1s1', turn: turn, temp: req.body.temp, delta: req.body.delta }, function (err, data) {
            if (err) return next(err);
        });
    });
    console.log('sensor is here!' + req.body.turn + "  " +  req.body.temp + " " + req.body.delta);
};