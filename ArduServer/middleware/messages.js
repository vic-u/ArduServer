const express = require('express');
//возвращаем функцию, которая формируем сообщение
function message(req) {
    return (msg, type) => {
        type = type || 'info'; // если type пустой, то по умолчанию info
        let sess = req.session; // получаем сессию браузера, куда скинем сообщение
        sess.messages = sess.messages || []; // получаем массив переменных сессии, или создаем этот массив
        sess.messages.push({ type: type, string: msg }); //заносим  в массив сообщений класс с сообщением
    };
}
//res.error = msg => this.message(msg, 'error');
//будет использован в цепочке обработчиков при каждом событии
module.exports = (req, res, next) => {
    res.message = message(req); // выставляем в переменную функцию, которая формирует сообщение
    res.error = (msg) => { // вешаем обработчик на res.error c параметром msg
        return res.message(msg, 'error');
    };
    // при каждом проходе обработчика, проверяем массис, он мог быть заполнен res.error и тогда мы его перенесем в local для отображения на форме 
    res.locals.messages = req.session.messages || []; //сохраняем массив сообщений из получаем объект сообщений из сессии 
    res.locals.removeMessages = () => { // обработчик, который вызовется в messages.pug после отображения ошибки и очистит список
        req.session.messages = []; //освобождаем массив сообщений, чтобы он всегда был пуст
    };
    next(); // переводим express к обработке след действия, чтобы он не завис
};