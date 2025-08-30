const {DBSensor} = require("../models/db");
const Sensors = require('../common').Sensors

const convert = (turn) => !turn || turn === 'false' ? 'OFF' : 'ON'

exports.setMobileData = (req, res, next) => {
    const {heaterTurn, waterTurn, temp, delta} = req.body
    console.log(`setMobileData ${heaterTurn} ${waterTurn} ${temp} ${delta}`)
    if (heaterTurn === undefined || waterTurn === undefined || !temp || !delta) return res.status(400).send('missing parameters')
    console.log(`mobile ${convert(heaterTurn)}`)
    DBSensor.setMobileCommand(
        {
            mac: Sensors.S2.mac, name: Sensors.S2.name,
            heaterTurn: convert(heaterTurn), waterTurn: convert(waterTurn), temp: temp, delta: delta
        },
        (err) => {
            if (err) return next(err)
            console.log(`sensor is here: ${heaterTurn}  ${waterTurn} ${temp} ${delta}`)
            res.status(200).send({...req.body, mac: Sensors.S2.mac, name: Sensors.S2.name, success: true})
        })

}
exports.getMobileData = (req, res, next) => {
    DBSensor.getLastCommand(Sensors.S2.mac, (err, {turn_heater, turn_holl, turn_water, turn_irr, temp, delta}) => {
        if (err) return next(err)
        console.log(`getMobileData ${turn_heater} ${turn_holl} ${turn_water}  ${turn_irr} ${temp} ${delta} `)
        if (!turn_heater || !turn_holl || !turn_water || !turn_irr || !temp || !delta)
            return res.status(200).send(
                {turn_heater: false, turn_holl: false, turn_water: false, turn_irr: false, temp: "25", delta: "2"})
        return res.status(200).send(
            {
                turn_heater: turn_heater === 'ON',
                turn_holl: turn_holl === 'ON',
                turn_water: turn_water === 'ON',
                turn_irr: turn_irr === 'ON',
                temp: temp,
                delta: delta,
                mac: Sensors.S2.mac,
                name: Sensors.S2.name
            })
    })
}
exports.getMobileSensorArray = (req, res, next) => {
    const dateFilterType = req.params.type
    DBSensor.getSensorDataByMacAndDate(Sensors.S2.mac, dateFilterType, (err, entries) => {
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
