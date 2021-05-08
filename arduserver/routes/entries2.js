const User = require('../models/user')
const DBSensor = require('../models/db').DBSensor
const MAC = '26FD52AD4E94'

errorHandler = (msg, res) => {
    res.error(msg);
    res.redirect('/');
}
/**
 * заполняем данные для графика
 **/
fillDataset = (entries) => {
    const dateTs = []
    const values = []
    let j = 0
    let name
    let mac
    for (let i = entries.length - 1; i >= 0; --i) {
        const e = entries[i]
        name = e.name
        mac = e.mac
        console.log('entries ' + JSON.stringify(e))
        const dt = "'" + e.timestamp + "'"
        dateTs[j] = dt.toString()
        values[j] = e.room_value
        j++
    }
    return { label: `${name} ${mac}`, labels: dateTs, data: values}
}
exports.form = (req, res) => {
    const TITLE = '180 участок'
    const TEMP_DEFAULT = '25'
    const DELTA_DEFAULT = '2'
    const DATASET_EMPTY = { label: 'NO DATA', labels: [], data: [] }
    if (!req.session.authorized) errorHandler('Sorry, invalid credentials!', res) //неавторизон, необслужен
    console.log('test33!');
    User.getByMail(req.session.username, (err, user) => {
        console.log('test34!' + MAC);
        if (err || !user) return err
        console.log('test3!' + MAC);

        DBSensor.getLastCommand2(MAC, (err, entries) => {  //получаем данные по командам
            const isCommandEntries = entries !== undefined
            console.log('test4!' + MAC)
            console.log(JSON.stringify(entries))
            const heaterTurn = (isCommandEntries && entries.turn_heater === 'ON') ? 'ON' : 'OFF'
            const hollTurn = (isCommandEntries && entries.turn_holl === 'ON') ? 'ON' : 'OFF'
            const waterTurn = (isCommandEntries && entries.turn_water === 'ON') ? 'ON' : 'OFF'
            const irrTurn = (isCommandEntries && entries.turn_irr === 'ON') ? 'ON' : 'OFF'
            const temp = (isCommandEntries) ? entries.temp : TEMP_DEFAULT
            const delta = (isCommandEntries) ? entries.delta : DELTA_DEFAULT 
            
            DBSensor.getSensorDataByMAC2(MAC, (err, entries) => { //получаем данные по сенсору
                console.log('test5!')
                console.log(entries)
                const dataset = (entries === undefined) ? DATASET_EMPTY : fillDataset(entries)
                console.log('test7!');
                console.log('object ' + JSON.stringify({
                    title: 'Sensor data',
                    heaterTurn: (heaterTurn === 'ON') ? 'checked' : '',
                    hollTurn: (hollTurn === 'ON') ? 'checked' : '',
                    waterTurn: (waterTurn === 'ON') ? 'checked' : '',
                    irrTurn: (irrTurn === 'ON') ? 'checked' : '',
                    temp: temp, delta: delta, entries: entries, authorized: req.session.authorized,
                    dataset: JSON.stringify(dataset)                           
                }));
                res.render('entries2', {
                    title: TITLE,
                    heaterTurn: (heaterTurn === 'ON') ? true : false,
                    hollTurn: (hollTurn === 'ON') ? true : false,
                    waterTurn: (waterTurn === 'ON') ? true : false,
                    irrTurn: (irrTurn === 'ON') ? true : false,
                    temp: temp, delta: delta, entries: entries === undefined ? [] : entries, authorized: req.session.authorized,
                    dataset: JSON.stringify(dataset)
                });
             });
        })
     })
}
/*exports.submit = (req, res, next) => {
    User.getByMail(req.session.username, (err, user) => {
        if (err || !user) errorHandler('Sorry, user not found!', res)

        console.log('toggle switch')
        console.log(req.body);
        const data = req.body.sensor;

        var value = 'ON';
        if (data === undefined) value = 'OFF';//off sensor
        *//*DBSensor.setCommand({ mac: MAC, name: 'T1', value: value }, function (err, data) {
            if (err) return next(err);
        });*//*
    });
    res.redirect('/entries2');
    //else

    //const data = req.body.entry;
    //const user = res.locals.uid;
    //const username = user ? user.name : null;
    //const entry = new Entry({
    //    username: username,
    //    title: data.title,
    //    body: data.body
    //});
    //entry.save(err => {
    //    if (err) return next(err);
    //    if (req.remoteUser) {
    //        res.json({ message: 'Entry added.' });
    //    } else {
    //        res.redirect('/');
    //    }
    //});
};*/