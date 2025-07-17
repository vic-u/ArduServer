const DBSensor = require('../models/db').DBSensor
const User = require('../models/user')
//const MAC = '26FD52AD4E93'
const MAC2 = '26FD52AD4E94'

//rest, который вызывает сенсор, чтобы передать текущие данные и забрать текущие команды
// exports.entry = (req, res, next) => {
//     const data = req.params.dt
//     //=26FD52AD4E93=o1s1=24.22==25=2 //arr2 - sensor id
//     const arr = data.toString().replace(/\s+/g, '').split("=")
//     if (arr.length !== 7) return next('wrong arguments')
//     if (arr[1] !== MAC) return next('wrong MAC ADDRESS')
//     DBSensor.setNewDataForLastHour({//выставит данные по температуре, только если их не было в течении последнего часа
//             mac: MAC,
//             name: arr[2],
//             value: arr[3]
//         },
//         (err) => {
//             if (err) return next(err)
//             //console.log('Fetching:2')
//             //если команда была дана через модем, то ее тоже выставим
//             DBSensor.setCommand({
//                 mac: MAC,
//                 name: arr[2],
//                 turn: arr[4],
//                 temp: arr[5],
//                 delta: arr[6]
//             }, (err) => {
//                 if (err) return next(err)
//                 //  console.log('Fetching:3')
//                 DBSensor.getLastCommand(MAC, (err, data) => {
//                     if (err) return next(err)
//                     const turn = (data !== undefined && data.turn === 'ON') ? 'ON' : 'OFF'
//                     const result = `=${MAC}=${arr[2]}==${turn}=${data.temp}=${data.delta}`
//                     res.status(200).send(result)
//                 })
//             })
//         })
// }
// //rest, который вызывает сенсор, чтобы передать текущие данные и забрать текущие команды
// exports.entry2 = (req, res, next) => {
//     const data = req.params.dt;
//     console.log('Fetching2:', data)
//     //=26FD52AD4E94=o2s1=17.80=20.47======
//     const arr = data.toString().replace(/\s+/g, '').split("=")
//     if (arr.length !== 11) return next('wrong argument')
//     if (arr[1] !== MAC2) return next('wrong MAC ADDRESS')
//     DBSensor.setNewDataForLastHour2({
//         mac: arr[1],
//         name: arr[2],
//         boxValue: arr[3],
//         roomValue: arr[4]
//     }, (err) => {
//         if (err) return next(err)
//         DBSensor.setCommand2({
//             mac: arr[1],
//             name: arr[2],
//             heaterTurn: arr[5],
//             hollTurn: arr[6],
//             waterTurn: arr[7],
//             irrTurn: arr[8],
//             temp: arr[9],
//             delta: arr[10]
//         }, (err, data) =>{
//             if (err) return next(err)
//             DBSensor.getLastCommand2(arr[1], (err, data) => {
//                 if (err) return next(err)
//                 heaterResp = (data !== undefined && data.turn_heater === 'ON') ? 'ON' : 'OFF'
//                 hollResp = (data !== undefined && data.turn_holl === 'ON') ? 'ON' : 'OFF'
//                 waterResp = (data !== undefined && data.turn_water === 'ON') ? 'ON' : 'OFF'
//                 irrResp = (data !== undefined && data.turn_irr === 'ON') ? 'ON' : 'OFF'
//                 const result = `=${arr[1]}=${arr[2]}===${heaterResp}=${hollResp}=${waterResp}=${irrResp}=${data.temp}=${data.delta}`
//                 res.status(200).send(result)
//             })
//         })
//     })
// }
//Rest, который вызывается при изменении настроек в клиенте для температуры и дельты
exports.sensor = (req, res, next) => {
    console.log('sensor')
    if (req.session.authorized !== true) return next('not authorized')
    User.getByMail(req.session.username, (err, user) => {
        console.log('toggle switch')
        const turn = req.body.turn === 'false' ? 'OFF' : 'ON'//off sensor
        DBSensor.setCommand({
            mac: user.mac,
            name: 'o1s1',
            turn: turn,
            temp: req.body.temp,
            delta: req.body.delta
        }, (err) => {
            if (err) return next(err);
            console.log('sensor is here!' + req.body.turn + "  " + req.body.temp + " " + req.body.delta)
            next()
        })
    })
}
//Rest, который вызывается при изменении настроек в клиенте для температуры и дельты
exports.sensor2 = (req, res, next) => {
    if (req.session.authorized !== true) return res.status(403).send('not authorized')
    User.getByMail(req.session.username, (err) => {
        if (err) return next(err)
        console.log('toggle switch')
       // console.log(req.body)
        DBSensor.setCommand2({
            mac: MAC2,
            name: 'o2s1',
            heaterTurn: req.body.heaterTurn === 'false' ? 'OFF' : 'ON',
            hollTurn: req.body.hollTurn === 'false' ? 'OFF' : 'ON',
            waterTurn: req.body.waterTurn === 'false' ? 'OFF' : 'ON',
            irrTurn: req.body.irrTurn === 'false' ? 'OFF' : 'ON',
            temp: req.body.temp,
            delta: req.body.delta
        }, (err) => {
            if (err) return next(err)
            console.log('sensor is here!' + req.body.temp + ' ' + req.body.delta)
            res.status(200).send()
        })
    })

}
//Rest, который вызывается при изменении настроек в клиенте для температуры и дельты
exports.filter = (req, res, next) => {
    if (req.session.authorized !== true) return;
    User.getByMail(req.session.username, (err, user) => {
        if (err) return next(err);
        const dtype = req.params.dtype;
        const mac = user.mac;
        console.log('filter set' + dtype + " " + mac);
        DBSensor.getSensorDataByMacAndDate(mac, dtype, (err, entries) => {
            if (entries === undefined) entries = [];

            const arr = [];
            const arr2 = [];
            let lbl = 'NO DATA';
            let j = 0;
            for (let i = entries.length - 1; i >= 0; --i) {
                const e = entries[i];
                //const dt = "'" + e.timestamp + "'";
                //arr[j] = dt.toString();
                arr[j] = e.timestamp;
                arr2[j] = parseFloat(e.value);
                lbl = `${e.name} ${e.mac}`;
                j++;
            }
            if (err) return next(err);
            if (entries) {
                res.send({label: lbl, labels: arr, data: arr2});
            }
        });
    });
};
exports.filter2 = (req, res, next) => {

    if (req.session.authorized !== true) return next('not authorized')
    User.getByMail(req.session.username, (err) => {
        if (err) return next(err)
        const dtype = req.params.dtype
        console.log('filter2 set ' + dtype + ' ' + MAC2);
        DBSensor.getSensorDataByMacAndDate2(MAC2, dtype, (err, entries) => {
            const DATASET_EMPTY = {label: 'NO DATA', labels: [], data: []}
            if (entries === undefined) return res.status(200).json(DATASET_EMPTY)
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
                values[j] = parseFloat(e.room_value)
                j++
            }
            res.status(200).json({label: `${name} ${mac}`, labels: dateTs, data: values})
        })
    })
}
