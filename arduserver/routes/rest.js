const DBSensor = require('../models/db').DBSensor
const DBUser = require('../models/db').DBUser
const User = require('../models/user')
const MAC2 = '26FD52AD4E94'
//rest, который вызывает сенсор, чтобы передать текущие данные и забрать текущие команды
exports.entry = (req, res, next) => {
    const data = req.params.dt
    console.log('Fetching:', data)
    if (data.toString() === '') return next()

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
//rest, который вызывает сенсор, чтобы передать текущие данные и забрать текущие команды
exports.entry2 = (req, res, next) => {
    const data = req.params.dt;
    console.log('Fetching:', data)
    if (data === undefined) return next('undefined data')
    if (data.toString() === '') return next('undefined string')
    const arr = data.toString().replace(/\s+/g, '').split("=")
    if (arr.length !== 11) return next('wrong argument')
    if (arr[1] !== MAC2) return next('wrong MAC ADDRESS')
    DBSensor.getSensorData2({ mac: arr[1] }, (err, snsdt) => {
        if (err) console.log('getSensorData2 Err: ' + err)
        if (snsdt === undefined) {  // запись про текущий день и час уже есть
            console.log('try to set new sensor data')
            DBSensor.setNewData2({ mac: arr[1], name: arr[2], boxValue: arr[3], roomValue: arr[4] }, (err, id) => {
                if (err) console.log('setNewData2 Err: ' + err)
            })
        } else {
            console.log('already get data' + JSON.stringify(snsdt))
        }
        DBSensor.setCommand2({ mac: arr[1], name: arr[2], heaterTurn: arr[5], hollTurn: arr[6], waterTurn: arr[7], irrTurn: arr[8], temp: arr[9], delta: arr[10] }, function (err, data) {
            if (err) console.log('setCommand2 Err: ' + err)
            DBSensor.getLastCommand2(arr[1], (err, data) => {
                if (err) res.status(500).send('no data')
                heaterResp = (data !== undefined && data.turn_heater === 'ON') ? 'ON' : 'OFF'
                hollResp = (data !== undefined && data.turn_holl === 'ON') ? 'ON' : 'OFF'
                waterResp = (data !== undefined && data.turn_water === 'ON') ? 'ON' : 'OFF'
                irrResp = (data !== undefined && data.turn_irr === 'ON') ? 'ON' : 'OFF'
                const result = `=${arr[1]}=${arr[2]}===${heaterResp}=${hollResp}=${waterResp}=${irrResp}=${data.temp}=${data.delta}`
                res.status(200).send(result)
            })
        })
    })
}
//rest. который вызывается при изменении настроек в клиенте для температуры и дельты 
exports.sensor = (req, res, next) => {
    if (req.session.authorized !== true) return;
    User.getByMail(req.session.username, (err, user) => {
        console.log('toggle switch')
        var turn = 'ON'
        if (req.body.turn === 'false') turn = 'OFF'//off sensor
        DBSensor.setCommand({ mac: user.mac, name: 'o1s1', turn: turn, temp: req.body.temp, delta: req.body.delta }, (err, data) =>{
            if (err) return next(err);
        })
    })
    console.log('sensor is here!' + req.body.turn + "  " + req.body.temp + " " + req.body.delta)
};
//rest. который вызывается при изменении настроек в клиенте для температуры и дельты 
exports.sensor2 = (req, res, next) => {
    if (req.session.authorized !== true) return next(err)
    User.getByMail(req.session.username, (err, user) => {
        if (err) return next(err)
        console.log('toggle switch')
        console.log(req.body)
        DBSensor.setCommand2({
            mac: MAC2,
            name: 'o2s1',
            heaterTurn: req.body.heaterTurn === 'false' ? 'OFF' : 'ON',
            hollTurn: req.body.hollTurn === 'false' ? 'OFF' : 'ON',
            waterTurn: req.body.waterTurn === 'false' ? 'OFF' : 'ON',
            irrTurn: req.body.irrTurn === 'false' ? 'OFF' : 'ON',
            temp: req.body.temp,
            delta: req.body.delta
        }, (err, data) => {
            if (err) return next(err)
        })
    })
    console.log('sensor is here!' + req.body.temp + ' ' + req.body.delta)
    res.status(200).send()
}
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
                res.send({ label: lbl, labels: arr, data: arr2 });
            };
        });
    });
};
exports.filter2 = (req, res, next) => {

    if (req.session.authorized !== true) return next('not authorized')
    User.getByMail(req.session.username, (err, user) => {
        if (err) return next(err)
        const dtype = req.params.dtype
        console.log('filter2 set ' + dtype + ' ' + MAC2);
        DBSensor.getSensorDataByMacAndDate2(MAC2, dtype, (err, entries) => {
            const DATASET_EMPTY = { label: 'NO DATA', labels: [], data: [] }
            console.log(entries)
            if (entries === undefined) return res.status(200).json(DATASET_EMPTY)
            console.log(entries + ' after')
            const dateTs = []
            const values = []
            let j = 0
            let name
            let mac          
            for (let i = entries.length - 1; i >= 0; --i) {
                const e = entries[i]
                name = e.name
                mac = e.mac
                dateTs[j] = e.timestamp
                values[j] =  parseFloat(e.room_value)
                j++
            }
            res.status(200).json({ label: `${name} ${mac}`, labels: dateTs, data: values})
        })
    })
}