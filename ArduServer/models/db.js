const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('snsrdt.sqllite');
const snstbl = 'sensorsdata';
const cmdtbl = 'commanddata';
const usrtbl = 'userdata';

db.serialize(() => {
    //var sql = `CREATE TABLE IF NOT EXISTS ${snstbl} (id integer primary key, macaddress, sensorname, sensorvalue, year, month, day, hour)`;
    //db.run(`DROP TABLE IF EXISTS ${snstbl}`, err => {
    //    if (err) console.log('db.serialize err: ' + err);
    //});
    //sql = `CREATE TABLE IF NOT EXISTS ${snstbl} (id integer primary key, mac, name, value, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`;
    sql = `CREATE TABLE IF NOT EXISTS ${snstbl} (id integer primary key, mac text, name text, value text, timestamp DATETIME DEFAULT (datetime('now', 'localtime')))`;
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
    sql = `CREATE TABLE IF NOT EXISTS ${usrtbl} (id integer primary key, mail, phone, mac, pass, salt, unid  TEXT)`;
    db.run(sql, err => {
        if (err) console.log('db.serialize err: ' + err);
    });
    //db.run(`DELETE FROM ${usrtbl}`);
    //db.run(`DELETE FROM ${snstbl} WHERE value<0`);
    //db.run(`DELETE FROM ${cmdtbl}`);
});

class DBSensor {
    //static getSensorData(sarr, cb) {
    //    const obj = {};
    //    const cd = new Date();
    //    obj.ma = sarr[1];
    //    obj.dt = sarr[2];
    //    obj.vl = sarr[3];
    //    obj.cd = {};
    //    obj.cd.y = cd.getFullYear();
    //    obj.cd.m = cd.getMonth();
    //    obj.cd.d = cd.getDate();
    //    obj.cd.h = cd.getHours();
    //    db.get(`SELECT * FROM ${snstbl} WHERE year = ? AND month = ? AND day = ? AND hour = ?`, [obj.cd.y, obj.cd.m, obj.cd.d, obj.cd.h], cb);
    //}
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
    static getSensorDataByMAC(mac, cb) {
        db.all(`SELECT id, mac, name, value,  strftime('%Y-%m-%d-%H', timestamp) as timestamp  FROM ${snstbl} WHERE mac = ? ORDER BY timestamp DESC`, mac, cb);
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
    //static setNewData(sarr, cb) {
    //    const obj = {};
    //    const cd = new Date();
    //    obj.ma = sarr[1];
    //    obj.dt = sarr[2];
    //    obj.vl = sarr[3];
    //    obj.cd = {};
    //    obj.cd.y = cd.getFullYear();
    //    obj.cd.m = cd.getMonth();
    //    obj.cd.d = cd.getDate();
    //    obj.cd.h = cd.getHours();
    //    const sql = `INSERT INTO ${snstbl}(macaddress, sensorname, sensorvalue, year, month, day, hour) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    //    db.run(sql, [obj.ma, obj.dt, obj.vl, obj.cd.y, obj.cd.m, obj.cd.d, obj.cd.h], cb);
    //}
    static setNewData(data, cb) {
        const sql = `INSERT INTO ${snstbl}(mac, name, value) VALUES (?, ?, ?)`;
        db.run(sql, data.mac, data.name, data.value, cb);
    }
    static getLastCommand(mac, cb) {
        db.get(`SELECT * FROM ${cmdtbl} WHERE mac = ? ORDER BY id DESC LIMIT 1;`, mac, cb);
    }
    static setCommand(data, cb) {
        if (data.turn === '') {
            return cb();
            
        }
        const sql = `INSERT INTO ${cmdtbl}( mac, name, turn, temp, delta) VALUES (?,?,?,?,?)`;
        db.run(sql, data.mac, data.name, data.turn, data.temp, data.delta, cb);
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

