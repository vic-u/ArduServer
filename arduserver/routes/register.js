const User = require('../models/user');
exports.form = (req, res) => {
    res.render('register', { title: 'Register' });
};
exports.submit = (req, res, next) => {
    const data = req.body.user
    if (data.pass !== data.pass2) {
        res.error('Passwords are not equal!')
        res.redirect('back')
        return next()
    }
    User.getByMail(data.mail, (err, user) => {
        if (err) return next(err)
        if (user) {
            res.error('User already taken!')
            res.redirect('back')
        } else {
            user = new User({ mail: data.mail, phone: data.phone, mac: data.mac, pass: data.pass })
            user.save(err => {
                if (err) return next(err)
                req.session.uid = user.id
                res.redirect('/')
            })
        }
    })
}