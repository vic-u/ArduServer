const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('snsrdt.sqllite');
const snstbl = 'sensorsdata';
const snstbl2 = 'sensorsdata2';
const cmdtbl = 'commanddata';
const cmdtbl2 = 'commanddata2';
const usrtbl = 'userdata';

db.serialize(() => {
    //var sql = `CREATE TABLE IF NOT EXISTS ${snstbl} (id integer primary key, macaddress, sensorname, sensorvalue, year, month, day, hour)`;
    //db.run(`DROP TABLE IF EXISTS ${snstbl2}`, err => {
    //    if (err) console.log('db.serialize err: ' + err);
    //});
    //sql = `CREATE TABLE IF NOT EXISTS ${snstbl} (id integer primary key, mac, name, value, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`;
    sql = `CREATE TABLE IF NOT EXISTS ${snstbl} (id integer primary key, mac text, name text, value text, timestamp DATETIME DEFAULT (datetime('now', 'localtime')))`;
    db.run(sql, err => {
        if (err) console.log('db.serialize err: ' + err);
    });
    sql = `CREATE TABLE IF NOT EXISTS ${snstbl2} (id integer primary key, mac text, name text, box_value text, room_value text, timestamp DATETIME DEFAULT (datetime('now', 'localtime')))`;
    db.run(sql, err => {
        if (err) console.log('db.serialize err: ' + err);
    });
    //db.run(`DROP TABLE IF EXISTS ${cmdtbl}`, err => {
    //    if (err) console.log('db.serialize err: ' + err);
    //});
    sql = `CREATE TABLE IF NOT EXISTS ${cmdtbl} (id integer primary key, mac, name, turn, temp, delta, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`;
    db.run(sql, err => {
        if(err) console.log('db.serialize err: ' + err);
    });
    sql = `CREATE TABLE IF NOT EXISTS ${cmdtbl2} (id integer primary key, mac, name, turn_heater, turn_holl, turn_water, turn_irr, temp, delta, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`;
    db.run(sql, err => {
        if (err) console.log('db.serialize err: ' + err);
    });

    sql = `CREATE TABLE IF NOT EXISTS ${usrtbl} (id integer primary key, mail, phone, mac, pass, salt, unid  TEXT)`;
    db.run(sql, err => {
        if (err) console.log('db.serialize err: ' + err);
    });
    //db.run(`DELETE FROM ${usrtbl}`);
    //db.run(`DELETE FROM ${snstbl}`);
    //db.run(`DELETE FROM ${cmdtbl}`);
    //db.run(`DELETE FROM ${snstbl} WHERE value<0`);
});

class DBSensor {
    static getSensorData(data, cb) {
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();
        var h = date.getHours();

        d = (d < 10) ? '0' + d : d;
        m = (m < 10) ? '0' + m : m;
        h = (h < 10) ? '0' + h : h;

        var dt = y + '-' + m + '-' + d + '-' + h;

        db.get(`SELECT * FROM ${snstbl} WHERE strftime('%Y-%m-%d-%H', timestamp) = ? AND mac = ?`, dt, data.mac, cb);
    }
    static getSensorData2(data, cb) {
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();
        var h = date.getHours();

        d = (d < 10) ? '0' + d : d;
        m = (m < 10) ? '0' + m : m;
        h = (h < 10) ? '0' + h : h;

        var dt = y + '-' + m + '-' + d + '-' + h;

        db.get(`SELECT * FROM ${snstbl2} WHERE strftime('%Y-%m-%d-%H', timestamp) = ? AND mac = ?`, dt, data.mac, cb);
    }
    static getSensorDataByMAC(mac, cb) {
        db.all(`SELECT id, mac, name, value,  strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl} WHERE mac = ? ORDER BY timestamp DESC`, mac, cb);
    }
    static getSensorDataByMAC2(mac, cb) {
        db.all(`SELECT id, mac, name, box_value,  room_value, strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl2} WHERE mac = ? ORDER BY timestamp DESC`, mac, cb);
    }
    static getSensorDataByMAC2ForYear(mac, cb) {
        db.all(`SELECT id, mac, name, box_value,  room_value, strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl2} WHERE timestamp >= date('now','-12 months') ORDER BY timestamp DESC`, mac, cb);
    }

    static getSensorDataByMacAndDate(mac, dtype, cb) {
        if (dtype === "d") {
            db.all(`SELECT id, mac, name, value,  strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl} WHERE mac = ? AND timestamp >= date('now','-1 day') ORDER BY timestamp DESC`, mac, cb);
        }
        if (dtype === "w") {
            db.all(`SELECT id, mac, name, value,  strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl} WHERE mac = ? AND timestamp >= date('now','-7 day') ORDER BY timestamp DESC`, mac, cb);
        }
        if (dtype === "m") {
            db.all(`SELECT id, mac, name, value,  strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl} WHERE mac = ? AND timestamp >= date('now','-1 month') ORDER BY timestamp DESC`, mac, cb);
        }
        if (dtype === "y") {
            db.all(`SELECT id, mac, name, value,  strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl} WHERE mac = ? AND timestamp >= date('now','-1 year') ORDER BY timestamp DESC`, mac, cb);
        }
    }
    static getSensorDataByMacAndDate2(mac, dtype, cb) {
        if (dtype === "d") {
            db.all(`SELECT id, mac, name, box_value,  room_value,  strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl2} WHERE mac = ? AND timestamp >= date('now','-1 day') ORDER BY timestamp DESC`, mac, cb);
        }
        if (dtype === "w") {
            db.all(`SELECT id, mac, name, box_value,  room_value,  strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl2} WHERE mac = ? AND timestamp >= date('now','-7 day') ORDER BY timestamp DESC`, mac, cb);
        }
        if (dtype === "m") {
            db.all(`SELECT id, mac, name, box_value,  room_value,  strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl2} WHERE mac = ? AND timestamp >= date('now','-1 month') ORDER BY timestamp DESC`, mac, cb);
        }
        if (dtype === "y") {
            db.all(`SELECT id, mac, name, box_value,  room_value,  strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl2} WHERE mac = ? AND timestamp >= date('now','-1 year') ORDER BY timestamp DESC`, mac, cb);
        }
    }

    static setNewData(data, cb) {
        const sql = `INSERT INTO ${snstbl}(mac, name, value) VALUES (?, ?, ?)`;
        db.run(sql, data.mac, data.name, data.value, cb);
    }
    static setNewData2(data, cb) {
        const sql = `INSERT INTO ${snstbl2}(mac, name, box_value, room_value) VALUES (?, ?, ?, ?)`;
        db.run(sql, data.mac, data.name, data.boxValue, data.roomValue, cb);
    }
    static getLastCommand(mac, cb) {
        db.get(`SELECT * FROM ${cmdtbl} WHERE mac = ? ORDER BY id DESC LIMIT 1;`, mac, cb);
    }
    static getLastCommand2(mac, cb) {
        db.get(`SELECT * FROM ${cmdtbl2} WHERE mac = ? ORDER BY id DESC LIMIT 1;`, mac, cb);
    }
    static setCommand(data, cb) {
        if (data.turn === '') {
            return cb();
        }
        const sql = `INSERT INTO ${cmdtbl}( mac, name, turn, temp, delta) VALUES (?,?,?,?,?)`;
        db.run(sql, data.mac, data.name, data.turn, data.temp, data.delta, cb);
    }
    static setCommand2(data, cb) {
        console.log('set command 2')
        this.getLastCommand2(data.mac, (err, entry) => {
            console.log(JSON.stringify(entry))
            console.log(JSON.stringify(data))
            //просто команда с модема
            if (data.heaterTurn === '' && data.hollTurn === '' && data.waterTurn === '' && data.irrTurn === '' && data.temp === '' && data.delta === '') return cb()

            if (data.heaterTurn === '' && data.hollTurn === '' && data.waterTurn === '' && data.irrTurn === '' && data.temp === '' && data.delta !== '') {
                const sql = `INSERT INTO ${cmdtbl2}( mac, name, turn_heater, turn_holl, turn_water, turn_irr, temp, delta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
                db.run(sql, data.mac, data.name, entry.turn_heater, entry.turn_holl, entry.turn_water, entry.turn_irr, data.temp, data.delta, cb)
            } else if (data.heaterTurn === '' && data.hollTurn === '' && data.waterTurn === '' && data.irrTurn === '' && data.temp !== '' && data.delta === '') {
                const sql = `INSERT INTO ${cmdtbl2}( mac, name, turn_heater, turn_holl, turn_water, turn_irr, temp, delta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
                db.run(sql, data.mac, data.name, entry.turn_heater, entry.turn_holl, entry.turn_water, entry.turn_irr, data.temp, data.delta, cb)
            } else if (data.heaterTurn === '' && data.hollTurn === '' && data.waterTurn === '' && data.irrTurn === '' && data.temp !== '' && data.delta !== '') {
                const sql = `INSERT INTO ${cmdtbl2}( mac, name, turn_heater, turn_holl, turn_water, turn_irr, temp, delta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
                db.run(sql, data.mac, data.name, entry.turn_heater, entry.turn_holl, entry.turn_water, entry.turn_irr, data.temp, data.delta, cb)
            } else {
                //пришла команда
                console.log('get modem command')
                if (data.heaterTurn === '') data.heaterTurn = 'OFF' // с модема приходит обычная команда, тогда часть пустое, но температуру и дельту могли переключить
                if (data.hollTurn === '') data.hollTurn = 'OFF'
                if (data.waterTurn === '') data.waterTurn = 'OFF'
                if (data.irrTurn === '') data.irrTurn = 'OFF'  //пришла просто команда без изменений, пустая и температуры равны последним установленным
                console.log(JSON.stringify(data))
                if (entry !== undefined && //команда приходит, но совпадает
                    entry.turn_heater === data.heaterTurn &&
                    entry.turn_holl === data.hollTurn &&
                    entry.turn_water === data.waterTurn &&
                    entry.turn_irr === data.irrTurn &&
                    entry.temp === data.temp &&
                    entry.delta === data.delta) return cb()
                console.log('insert new command')
                const sql = `INSERT INTO ${cmdtbl2}( mac, name, turn_heater, turn_holl, turn_water, turn_irr, temp, delta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
                db.run(sql, data.mac, data.name, data.heaterTurn, data.hollTurn, data.waterTurn, data.irrTurn, data.temp, data.delta, cb)
            }
        })
    }
}
class DBUser {
    static create(data, cb) {
        const sql = `INSERT INTO ${usrtbl}(mail, phone, pass, salt, mac) VALUES (?,?,?,?,?)`;
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

