const User = require('../models/user')
const DBSensor = require('../models/db').DBSensor


exports.form = (req, res, next) => {
    //console.log('test2!')
    if (!req.session.authorized) {
        res.error('Sorry, invalid credentials!')
        res.redirect('/')
    } else {
        User.getByMail(req.session.username, (err, user) => {
            if (err) return next(err)
            if (user) {
                const mac = user.mac;
                DBSensor.getLastCommand(mac, (err, entries) => {
                    if (err) return next(err)
                    let turn = 'OFF';
                    let temp = '25';
                    let delta = '2';
                    if (entries !== undefined) {
                        if (entries.turn === 'ON') turn = 'ON'
                        temp = entries.temp
                        delta = entries.delta
                    }
                    //получаем данные по сенсору
                    DBSensor.getSensorDataByMAC(mac, (err, entries) => {
                        if (entries === undefined) entries = []
                        const arr = []
                        const arr2 = []
                        let label = `label: 'NO DATA'`;
                        let j = 0;
                        for (let i = entries.length - 1; i >=0 ; --i) {
                            const e = entries[i];
                            const dt = "'" + e.timestamp + "'";
                            arr[j] = dt.toString()
                            arr2[j] = e.value
                            label = `label: '${e.name} ${e.mac}'`
                            j++
                        }
                        let labels = 'labels:' + '[' + arr.toString() + ']'
                        data = 'data:' + '[' + arr2.toString() + ']'
                        if (err) return next(err)
                        if (entries) {
                            res.render('entries', {
                                title: '169 участок', turn: (turn === 'ON'), temp: temp, delta: delta, entries: entries, authorized: req.session.authorized,
                                dataset: `{ ${label}, ${labels}, ${data} }`
                            })
                        }
                    })
                })
            }
        })
    }
}
