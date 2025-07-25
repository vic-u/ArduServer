const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('snsrdt.sqllite')
const Sensors = require('../common').Sensors
const snstbl = 'sensorsdata'
const snstbl2 = 'sensorsdata2'
const cmdtbl = 'commanddata'
const cmdtbl2 = 'commanddata2'
const usrtbl = 'userdata'

db.serialize(() => {
    let sql = `CREATE TABLE IF NOT EXISTS ${snstbl}
    (
        id
        integer
        primary
        key,
        mac
        text,
        name
        text,
        value
        text,
        timestamp
        DATETIME
        DEFAULT (
        datetime
               (
        'now',
        'localtime'
               )))`
    db.run(sql, err => {
        if (err) console.log('db.serialize err: ' + err);
    });
    sql = `CREATE TABLE IF NOT EXISTS ${snstbl2}
    (
        id
        integer
        primary
        key,
        mac
        text,
        name
        text,
        box_value
        text,
        room_value
        text,
        timestamp
        DATETIME
        DEFAULT (
        datetime
           (
        'now',
        'localtime'
           )))`;
    db.run(sql, err => {
        if (err) console.log('db.serialize err: ' + err);
    });
    //db.run(`DROP TABLE IF EXISTS ${cmdtbl}`, err => {
    //    if (err) console.log('db.serialize err: ' + err);
    //});
    sql = `CREATE TABLE IF NOT EXISTS ${cmdtbl}
           (
               id
               integer
               primary
               key,
               mac,
               name,
               turn,
               temp,
               delta,
               timestamp
               DATETIME
               DEFAULT
               CURRENT_TIMESTAMP
           )`;
    db.run(sql, err => {
        if (err) console.log('db.serialize err: ' + err);
    });
    sql = `CREATE TABLE IF NOT EXISTS ${cmdtbl2}
           (
               id
               integer
               primary
               key,
               mac,
               name,
               turn_heater,
               turn_holl,
               turn_water,
               turn_irr,
               temp,
               delta,
               timestamp
               DATETIME
               DEFAULT
               CURRENT_TIMESTAMP
           )`;
    db.run(sql, err => {
        if (err) console.log('db.serialize err: ' + err);
    });

    sql = `CREATE TABLE IF NOT EXISTS ${usrtbl}
           (
               id
               integer
               primary
               key,
               mail,
               phone,
               mac,
               pass,
               salt,
               unid
               TEXT
           )`;
    db.run(sql, err => {
        if (err) console.log('db.serialize err: ' + err);
    });
    //db.run(`DELETE FROM ${usrtbl}`);
    //db.run(`DELETE FROM ${snstbl}`);
    //db.run(`DELETE FROM ${cmdtbl}`);
    //db.run(`DELETE FROM ${snstbl} WHERE value<0`);
});

class DBSensor {
    static getSensorDataForLastHour(data, cb) {
        const date = new Date();
        const y = date.getFullYear();
        let m = date.getMonth() + 1;
        let d = date.getDate();
        let h = date.getHours();

        d = (d < 10) ? '0' + d : d;
        m = (m < 10) ? '0' + m : m;
        h = (h < 10) ? '0' + h : h;

        const dt = y + '-' + m + '-' + d + '-' + h;

        db.get(`SELECT * FROM ${snstbl} WHERE strftime('%Y-%m-%d-%H', timestamp) = ? AND mac = ?`, dt, data.mac, cb);
    }

    static getSensorDataForLastHour2(data, cb) {
        const date = new Date()
        const y = date.getFullYear()
        let m = date.getMonth() + 1
        let d = date.getDate()
        let h = date.getHours()

        d = (d < 10) ? '0' + d : d;
        m = (m < 10) ? '0' + m : m;
        h = (h < 10) ? '0' + h : h;

        const dt = y + '-' + m + '-' + d + '-' + h;

        db.get(`SELECT * FROM ${snstbl2} WHERE strftime('%Y-%m-%d-%H', timestamp) = ? AND mac = ?`, dt, data.mac, cb);
    }

    // static getSensorDataByMAC(mac, cb) {
    //     db.all(`SELECT id, mac, name, value,  strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl} WHERE mac = ? ORDER BY timestamp DESC`, mac, cb);
    // }

    // static getSensorDataByMAC2(mac, cb) {
    //     db.all(`SELECT id, mac, name, box_value,  room_value, strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl2} WHERE mac = ? ORDER BY timestamp DESC`, mac, cb);
    // }

    // static getSensorDataByMAC2ForYear(mac, cb) {
    //     db.all(`SELECT id, mac, name, box_value,  room_value, strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl2} WHERE timestamp >= date('now','-12 months') ORDER BY timestamp DESC`, mac, cb);
    // }

    static dateOffset(offset) {
        return offset === 'd' ? "-1 day" : offset === 'w' ? "-7 day" : offset === 'm' ? "-1 month" : offset === 'y' ? "-1 year" : ""
    }
    static sensorTableNameFromName(name) {
        return name === Sensors.S2.mac ? Sensors.S2.valueTable : Sensors.S1.valueTable
    }
    static sensorValuesColumnNameFromName(name) {
        return name === Sensors.S2.mac ? Sensors.S2.valueColumn : Sensors.S1.valueColumn
    }
    static getSensorDataByMacAndDate(mac, dType, cb) {
        const selectPart = "SELECT id, mac, name, " + this.sensorValuesColumnNameFromName(mac) +
            " as value,  strftime('%m-%d-%H', timestamp) as fd  FROM " + this.sensorTableNameFromName(mac)
        const wherePart = `WHERE mac = ? AND timestamp >= date('now','${DBSensor.dateOffset(dType)}')`
        const querySensorValue = `${selectPart} ${wherePart} ORDER BY timestamp DESC`
        db.all(querySensorValue, mac, cb);
    }

    /***получаем данные с датчика и сохраняем, если за текущий час еще не было данных**/
    static setNewDataForLastHour(data, cb) {
        this.getSensorDataForLastHour({mac: data.mac}, (err, lastData) => {
            if (err) return cb(err)
            //console.log('Fetching:2.1')
            if (lastData !== undefined) return cb()//не пишем данные за текущий час
            //console.log('Fetching:2.2')
            const sql = `INSERT INTO ${snstbl}(mac, name, value)
                         VALUES (?, ?, ?)`
            db.run(sql, data.mac, data.name, data.value, cb);
        })
    }

    static setNewDataForLastHour2(data, cb) {
        this.getSensorDataForLastHour2({mac: data.mac}, (err, lastData) => {
            if (err) return cb(err)
            console.log('Fetching2: 1')
            if (lastData !== undefined) return cb()
            console.log('Fetching2: 2')
            const sql = `INSERT INTO ${snstbl2}(mac, name, box_value, room_value)
                         VALUES (?, ?, ?, ?)`
            db.run(sql, data.mac, data.name, data.boxValue, data.roomValue, cb);
        })
    }

    static getLastCommand(mac, cb) {
        db.get(`SELECT * FROM ${cmdtbl} WHERE mac = ? ORDER BY id DESC LIMIT 1;`, mac, cb);
    }

    static getLastCommand2(mac, cb) {
        db.get(`SELECT * FROM ${cmdtbl2} WHERE mac = ? ORDER BY id DESC LIMIT 1;`, mac, cb);
    }

    static setCommand(data, cb) {
        if (data.turn === '') {
            //console.log('Command: 1')
            return cb();
        }
        //console.log('Command: 2')
        const sql = `INSERT INTO ${cmdtbl}(mac, name, turn, temp, delta)
                     VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, data.mac, data.name, data.turn, data.temp, data.delta, cb);
    }

    static setCommand2(data, cb) {
        //console.log('set command 2')
        this.getLastCommand2(data.mac, (err, entry) => {
            // console.log(JSON.stringify(entry))
            // console.log(JSON.stringify(data))
            //просто команда с модема
            if (data.heaterTurn === '' && data.hollTurn === '' && data.waterTurn === '' && data.irrTurn === '' && data.temp === '' && data.delta === '') return cb()

            if (data.heaterTurn === '' && data.hollTurn === '' && data.waterTurn === '' && data.irrTurn === '' && data.temp === '' && data.delta !== '') {
                const sql = `INSERT INTO ${cmdtbl2}(mac, name, turn_heater, turn_holl, turn_water, turn_irr, temp, delta)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
                db.run(sql, data.mac, data.name, entry.turn_heater, entry.turn_holl, entry.turn_water, entry.turn_irr, entry.temp, data.delta, cb)
            } else if (data.heaterTurn === '' && data.hollTurn === '' && data.waterTurn === '' && data.irrTurn === '' && data.temp !== '' && data.delta === '') {
                const sql = `INSERT INTO ${cmdtbl2}(mac, name, turn_heater, turn_holl, turn_water, turn_irr, temp, delta)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
                db.run(sql, data.mac, data.name, entry.turn_heater, entry.turn_holl, entry.turn_water, entry.turn_irr, data.temp, entry.delta, cb)
            } else if (data.heaterTurn === '' && data.hollTurn === '' && data.waterTurn === '' && data.irrTurn === '' && data.temp !== '' && data.delta !== '') {
                const sql = `INSERT INTO ${cmdtbl2}(mac, name, turn_heater, turn_holl, turn_water, turn_irr, temp, delta)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
                db.run(sql, data.mac, data.name, entry.turn_heater, entry.turn_holl, entry.turn_water, entry.turn_irr, data.temp, data.delta, cb)
            } else {
                //пришла команда
                // console.log('get modem command')
                if (data.heaterTurn === '') data.heaterTurn = 'OFF' // с модема приходит обычная команда, тогда часть пустое, но температуру и дельту могли переключить
                if (data.hollTurn === '') data.hollTurn = 'OFF'
                if (data.waterTurn === '') data.waterTurn = 'OFF'
                if (data.irrTurn === '') data.irrTurn = 'OFF'  //пришла просто команда без изменений, пустая и температуры равны последним установленным
                //console.log(JSON.stringify(data))
                if (entry !== undefined && //команда приходит, но совпадает
                    entry.turn_heater === data.heaterTurn &&
                    entry.turn_holl === data.hollTurn &&
                    entry.turn_water === data.waterTurn &&
                    entry.turn_irr === data.irrTurn &&
                    entry.temp === data.temp &&
                    entry.delta === data.delta) return cb()
                //console.log('insert new command')
                const sql = `INSERT INTO ${cmdtbl2}(mac, name, turn_heater, turn_holl, turn_water, turn_irr, temp, delta)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
                db.run(sql, data.mac, data.name, data.heaterTurn, data.hollTurn, data.waterTurn, data.irrTurn, data.temp, data.delta, cb)
            }
        })
    }
}

class DBUser {
    static create(data, cb) {
        const sql = `INSERT INTO ${usrtbl}(mail, phone, pass, salt, mac)
                     VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, data.mail, data.phone, data.pass, data.salt, data.mac, cb);
    }

    static findmail(mail, cb) {
        if (!mail) return cb(new Error('Please provide an mail'));
        db.get(`SELECT * FROM ${usrtbl} WHERE mail=?`, mail, cb);

    }

    static findmac(mac, cb) {
        if (!mac) return cb(new Error('Please provide an mac'));
        db.get(`SELECT * FROM ${usrtbl} WHERE mac=?`, mac, cb);

    }
}

module.exports = db;
module.exports.DBSensor = DBSensor;
module.exports.DBUser = DBUser;

