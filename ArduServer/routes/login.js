const User = require('../models/user');
exports.form = (req, res) => {
    res.render('login', { title: 'Login', authorized: req.session.authorized});
};
exports.submit = (req, res, next) => {
    const data = req.body.user;
    User.authenticate(data.mail, data.pass, (err, user) => {
        if (err) return next(err);
        if (user) {
            req.session.authorized = true;
            req.session.username = data.mail;

            console.log('user is here!');
            req.session.uid = user.id;
            res.redirect('/entries');
        }
        else {
            res.error('Sorry, invalid credentials!');
            res.redirect('back');
        }
    });

};