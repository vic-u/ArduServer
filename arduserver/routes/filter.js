const DBSensor = require('../models/db').DBSensor
const User = require('../models/user')
const Sensors = require('../common').Sensors

filterBase = (mac, req, res, next) => {
    if (req.session.authorized !== true) return next(new Error('Not authorized'))
    User.getByMail(req.session.username, (err) => {
        if (err) return next(err)
        const dateFilterType = req.params.dtype
        console.log('filter set' + dateFilterType + " " + mac)
        DBSensor.getSensorDataByMacAndDate(mac, dateFilterType, (err, entries) => {
            if (err) return next(err)
            if (!entries) entries = []
            const label = entries.length === 0 ? 'NO DATA' : `${entries[0].name} ${entries[0].mac}`
            const labels = []
            const data = []
            entries.forEach((entry) => {
                labels.unshift(entry.fd)
                data.unshift(parseFloat(entry.value))
            })
            // res.status(200).json({label: `${name} ${mac}`, labels: labels, data: values})
            res.send({label: label, labels: labels, data: data})
        })
    })

}
//Rest, который вызывается при изменении настроек в клиенте для температуры и дельты
exports.filter = (req, res, next) => {
    filterBase(Sensors.S1.mac, req, res, next)
}
exports.filter2 = (req, res, next) => {
    filterBase(Sensors.S2.mac, req, res, next)
}
