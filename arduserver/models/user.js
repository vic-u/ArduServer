const bcrypt = require('bcryptjs');
const db = require('../models/db');
const DBUser = require('../models/db').DBUser;

class User {
    constructor(obj) {
        for (let key in obj) {
            this[key] = obj[key];
        }
    }
    hashPassword(cb) {
        //this.salt = bcrypt.genSaltSync(10);
        //this.pass = bcrypt.hashSync(this.pass, this.salt);

        bcrypt.genSalt(12, (err, salt) => {
            if (err) return cb(err);
            this.salt = salt;
            bcrypt.hash(this.pass, salt, (err, hash) => {
                if (err) return cb(err);
                this.pass = hash;
                cb();
            });
        });
    }
    save(cb) {
        if (this.id) {
            //this.update(cb);
        } else {
            var obj = this;
            this.hashPassword((err) => {
                if (err) return cb(err);
                DBUser.create(this, function (err, user) {
                    if (err) return cb(err);
                    const id = this.lastID;
                    obj.id = this.lastID;
                    cb(err);
                });
            });
            
        }
    }
    /**
    * находит пользователя в базе
    * @param {any} mail
    * @param {any} cb
    */
    static getByMail(mail, cb) {
        DBUser.findmail(mail, cb);
    }
    static authenticate(mail, pass, cb) {
        User.getByMail(mail, (err, user) => {
            if (err) return cb(err);
            if (!user || !user.id) return cb();
            bcrypt.hash(pass, user.salt, (err, hash) => {
                if (err) return cb(err);
                if (hash === user.pass) return cb(null, user);
                cb();
            });
        });
    }
}
module.exports = User;