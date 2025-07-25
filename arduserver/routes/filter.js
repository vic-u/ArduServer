const DBSensor = require('../models/db').DBSensor
const User = require('../models/user')
//const MAC = '26FD52AD4E93'
const MAC2 = '26FD52AD4E94'
//Rest, который вызывается при изменении настроек в клиенте для температуры и дельты
exports.filter = (req, res, next) => {
    if (req.session.authorized !== true) return
    User.getByMail(req.session.username, (err, user) => {
        if (err) return next(err)
        const dateFilterType = req.params.dtype
        const mac = user.mac
        console.log('filter set' + dateFilterType + " " + mac);
        DBSensor.getSensorDataByMacAndDate(mac, dateFilterType, (err, entries) => {
            if (entries === undefined) entries = [];

            const labels = [];
            const data = [];
            let lbl = 'NO DATA';
            let j = 0;
            for (let i = entries.length - 1; i >= 0; --i) {
                const e = entries[i];
                labels[j] = e.fd;
                data[j] = parseFloat(e.value);
                lbl = `${e.name} ${e.mac}`;
                j++;
            }
            if (err) return next(err);
            if (entries) {
                res.send({label: lbl, labels: labels, data: data});
            }
        });
    });
};
exports.filter2 = (req, res, next) => {

    if (req.session.authorized !== true) return next('not authorized')
    User.getByMail(req.session.username, (err) => {
        if (err) return next(err)
        const dateFilterType = req.params.dtype
        console.log('filter2 set ' + dateFilterType + ' ' + MAC2);
        DBSensor.getSensorDataByMacAndDate2(MAC2, dateFilterType, (err, entries) => {
            const DATASET_EMPTY = {label: 'NO DATA', labels: [], data: []}
            if (entries === undefined) return res.status(200).json(DATASET_EMPTY)
            const labels = []
            const values = []
            let j = 0
            let name
            let mac
            for (let i = entries.length - 1; i >= 0; --i) {
                const e = entries[i]
                name = e.name
                mac = e.mac
                labels[j] = e.fd
                values[j] = parseFloat(e.room_value)
                j++
            }
            res.status(200).json({label: `${name} ${mac}`, labels: labels, data: values})
        })
    })
}
