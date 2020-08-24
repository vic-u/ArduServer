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
//rest. который вызывается при изменении настроек в клиенте для температуры и дельты 
exports.filter = (req, res, next) => {
    if (req.session.authorized !== true) return;
    User.getByMail(req.session.username, (err, user) => {
        if (err) return next(err);
        const dtype = req.params.dtype;
        const mac = user.mac;
        console.log('filter set' + dtype + " " + mac);
        DBSensor.getSensorDataByMacAndDate(mac, dtype, (err, entries) => {
            if (entries === undefined) entries = [];

            var arr = [];
            var arr2 = [];
            var labels = 'labels:[]';
            var data = 'data: []';
            var lbl = 'NO DATA';
            var j = 0;
            for (i = entries.length - 1; i >= 0; --i) {
                var e = entries[i];
                var dt = "'" + e.timestamp + "'";
                //arr[j] = dt.toString();
                arr[j] = e.timestamp;
                arr2[j] = parseFloat(e.value);
                lbl = `${e.name} ${e.mac}`;
                j++;
            }
            labels = 'labels:' + '[' + arr.toString() + ']';
            data = 'data:' + '[' + arr2.toString() + ']';
            if (err) return next(err);
            if (entries) {
                //res.send({ ${label}, ${labels}, ${data} });
                res.send({label:  lbl ,  labels:arr, data:arr2});
            };
        });
    });
};

