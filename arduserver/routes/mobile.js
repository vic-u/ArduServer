const {DBSensor} = require("../models/db");
const Sensors = require('../common').Sensors
const convert = (turn) => !turn || turn === 'false' ? 'OFF' : 'ON'

exports.setMobileData = (req, res, next) => {

    const {turn, temp, delta} = req.body
    console.log(`setMobileData ${turn} ${temp} ${delta}`)
    if (turn === undefined || !temp || !delta) return res.status(400).send('missing parameters')
    DBSensor.setMobileCommand(
        {mac: Sensors.S1.mac, name: Sensors.S1.name, turn: convert(turn), temp: temp, delta: delta},
        (err) => {
            if (err) return next(err)
            console.log(`sensor is here: ${turn} ${temp} ${delta}`)
            res.status(200).send({...req.body, mac: Sensors.S1.mac, name: Sensors.S1.name, success: true})
        })

}
exports.getMobileData = (req, res, next) => {
    DBSensor.getLastCommand(Sensors.S1.mac, (err, {turn, temp, delta}) => {
        if (err) return next(err)
        console.log(`getMobileData ${turn} ${temp} ${delta} `)
        if (!turn || !temp || !delta) return res.status(200).send({turn: false, temp: "25", delta: "2"})
        return res.status(200).send({turn: turn === 'ON', temp: temp, delta: delta, mac: Sensors.S1.mac, name: Sensors.S1.name})
    })
}
exports.getMobileSensorArray = (req, res, next) => {
    const dateFilterType = req.params.type
    DBSensor.getSensorDataByMacAndDate(Sensors.S1.mac, dateFilterType, (err, entries) => {
        if (err) return next(err)
        const data = []
        let i = 1
        entries.forEach((entry) => {
            data.unshift({id: i, time: entry.fd, data: parseFloat(entry.value)})
            i++
        })
        res.status(200).send(data)
    })
}
