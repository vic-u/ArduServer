const User = require('../models/user')
const DBSensor = require('../models/db').DBSensor
const MAC = '26FD52AD4E94'
const TITLE = '180 участок'
const TEMP_DEFAULT = '25'
const DELTA_DEFAULT = '2'

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
        //console.log('entries ' + JSON.stringify(e))
        const dt = "'" + e.timestamp + "'"
        dateTs[j] = dt.toString()
        values[j] = e.room_value
        j++
    }
    return {label: `${name} ${mac}`, labels: dateTs, data: values}
}
exports.form = (req, res, next) => {
    if (!req.session.authorized) {
        res.error('Sorry, invalid credentials!')
        res.redirect('/')
    } else {
        User.getByMail(req.session.username, (err, user) => {
                if (err) return next(err)
                if (user) {
                    DBSensor.getLastCommand2(MAC, (err, entries) => {  //получаем данные по командам
                        if (err) return next(err)
                        let heaterTurn = 'OFF'
                        let hollTurn = 'OFF'
                        let waterTurn = 'OFF'
                        let irrTurn = 'OFF'
                        let temp = TEMP_DEFAULT
                        let delta = DELTA_DEFAULT
                        if (entries !== undefined) {
                            if (entries.turn_heater === 'ON') heaterTurn = 'ON'
                            if (entries.turn_holl === 'ON') hollTurn =  'ON'
                            if (entries.turn_water === 'ON') waterTurn =  'ON'
                            if (entries.turn_irr === 'ON') irrTurn =  'ON'
                            temp = entries.temp
                            delta = entries.delta
                        }
                        DBSensor.getSensorDataByMacAndDate2(MAC, 'y', (err, entries) => { //получаем данные по сенсору
                            if (err) return next(err)
                            if (entries === undefined) entries = []

                            res.render('entries2', {
                                title: TITLE,
                                heaterTurn: (heaterTurn === 'ON'),
                                hollTurn: (hollTurn === 'ON'),
                                waterTurn: (waterTurn === 'ON'),
                                irrTurn: (irrTurn === 'ON'),
                                temp: temp,
                                delta: delta,
                                entries: entries,
                                authorized: req.session.authorized,
                            });
                        });
                    })
                }
            }
        )
        }
    }
