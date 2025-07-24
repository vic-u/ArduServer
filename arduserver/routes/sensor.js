const DBSensor = require('../models/db').DBSensor
const User = require('../models/user')
//const MAC = '26FD52AD4E93'
const MAC2 = '26FD52AD4E94'

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
            console.log('sensor is here: ' + req.body.turn + "  " + req.body.temp + " " + req.body.delta)
            res.status(200).send()
            return next()
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
