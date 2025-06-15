const User = require('../models/user')
const DBSensor = require('../models/db').DBSensor
const TITLE = '169 участок'
const TEMP_DEFAULT = '25'
const DELTA_DEFAULT = '2'

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
                    let temp = TEMP_DEFAULT;
                    let delta = DELTA_DEFAULT;
                    if (entries !== undefined) {
                        if (entries.turn === 'ON') turn = 'ON'
                        temp = entries.temp
                        delta = entries.delta
                    }
                    //получаем данные по сенсору
                    DBSensor.getSensorDataByMacAndDate(mac, 'y', (err, entries) => {
                        if (err) return next(err)
                        if (entries === undefined) entries = []

                        res.render('entries', {
                            title: TITLE,
                            turn: (turn === 'ON'),
                            temp: temp,
                            delta: delta,
                            entries: entries,
                            authorized: req.session.authorized,
                        })
                    })
                })
            }
        })
    }
}
