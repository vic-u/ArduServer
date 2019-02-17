const User = require('../models/user');
const DBSensor = require('../models/db').DBSensor;


exports.form = (req, res) => {
    if (!req.session.authorized) {
        res.error('Sorry, invalid credentials!');
        res.redirect('/');
    } else {
        User.getByMail(req.session.username, (err, user) => {
            if (err) return next(err);
            if (user) {
                const mac = user.mac;
                DBSensor.getLastCommand(mac, (err, entries) => {
                    if (err) return next(err);
                    var ss = 'OFF';
                    if (entries !== undefined && entries.value === 'ON') ss = 'ON';
                    DBSensor.getSensorDataByMAC(mac, (err, entries) => {
                        if (entries === undefined) entries = [];
                    
                        var arr = [];
                        var arr2 = [];
                        var labels = 'labels:[]';
                        var data = 'data: []';
                        var label = `label: 'NO DATA'`;
                        for (i = 0; i < entries.length; ++i) {
                            var e = entries[i];
                            var dt = "'" + e.timestamp + "'";
                            arr[i] = dt.toString();
                            arr2[i] = e.value;
                            label = `label: '${e.name} ${e.mac}'`;
                        }
                        labels = 'labels:' + '[' + arr.toString() + ']';
                        data = 'data:' + '[' + arr2.toString() + ']';
                        if (err) return next(err);
                        if (entries) {

                            res.render('entries', {
                                title: 'Sensor data', check: (ss === 'ON') ? 'checked' : '', entries: entries, authorized: req.session.authorized,
                                dataset: `{ ${label}, ${labels}, ${data} }`
                                //dataset: `{ label: 'TEST'}`
                                //dataset: `{ label: 'TEST', ${labels} }`
                            });
                        //return;
                        }
                    });
                });
            }
        });
        //res.render('entries', { title: 'Sensor data', entries:[] });
    }
    
};
exports.submit = (req, res, next) => {
    User.getByMail(req.session.username, (err, user) => {
        console.log('toggle switch');
        const data = req.body.sensor;
        var value = 'ON';
        if (data === undefined) value = 'OFF';//off sensor
        DBSensor.setCommand({ mac: user.mac, name: 'T1', value: value }, function (err, data) {
            if (err) return next(err);
        });
    });
    res.redirect('/entries');
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
};