const {DBSensor} = require("../models/db")
const PARAMS_COUNT = 7
const PARAMS_COUNT_2 = 11
const MAC = '26FD52AD4E93'
const MAC_2 = '26FD52AD4E94'
// Ресты, которые вызывает ардуино, чтобы передать свои данные и получить команды с фронта приложения
entry = (req, res, next) => {
    const data = req.params.dt
    //=26FD52AD4E93=o1s1=24.22==25=2 //arr2 - sensor id
    const arr = data.toString().replace(/\s+/g, '').split("=")
    if (arr.length !== PARAMS_COUNT) return next('wrong arguments')
    if (arr[1] !== MAC) return next('wrong MAC ADDRESS')
    DBSensor.setNewDataForLastHour({//выставит данные по температуре, только если их не было в течении последнего часа
            mac: MAC,
            name: arr[2],
            value: arr[3]
        },
        (err) => {
            if (err) return next(err)
            //console.log('Fetching:2')
            //если команда была дана через модем, то ее тоже выставим
            DBSensor.setCommand({
                mac: MAC,
                name: arr[2],
                turn: arr[4],
                temp: arr[5],
                delta: arr[6]
            }, (err) => {
                if (err) return next(err)
                //  console.log('Fetching:3')
                DBSensor.getLastCommand(MAC, (err, data) => {
                    if (err) return next(err)
                    const turn = (data !== undefined && data.turn === 'ON') ? 'ON' : 'OFF'
                    const result = `=${MAC}=${arr[2]}==${turn}=${data.temp}=${data.delta}`
                    res.status(200).send(result)
                })
            })
        })
}
//rest, который вызывает сенсор, чтобы передать текущие данные и забрать текущие команды
entry2 = (req, res, next) => {
    const data = req.params.dt;
    console.log('Fetching2:', data)
    //=26FD52AD4E94=o2s1=17.80=20.47======
    const arr = data.toString().replace(/\s+/g, '').split("=")
    if (arr.length !== PARAMS_COUNT_2) return next('wrong argument')
    if (arr[1] !== MAC_2) return next('wrong MAC ADDRESS')
    DBSensor.setNewDataForLastHour2({
        mac: MAC_2,
        name: arr[2],
        boxValue: arr[3],
        roomValue: arr[4]
    }, (err) => {
        if (err) return next(err)
        DBSensor.setCommand2({
            mac: arr[1],
            name: arr[2],
            heaterTurn: arr[5],
            hollTurn: arr[6],
            waterTurn: arr[7],
            irrTurn: arr[8],
            temp: arr[9],
            delta: arr[10]
        }, (err) => {
            if (err) return next(err)
            DBSensor.getLastCommand2(arr[1], (err, data) => {
                if (err) return next(err)
                heaterResp = (data !== undefined && data.turn_heater === 'ON') ? 'ON' : 'OFF'
                hollResp = (data !== undefined && data.turn_holl === 'ON') ? 'ON' : 'OFF'
                waterResp = (data !== undefined && data.turn_water === 'ON') ? 'ON' : 'OFF'
                irrResp = (data !== undefined && data.turn_irr === 'ON') ? 'ON' : 'OFF'
                const result = `=${arr[1]}=${arr[2]}===${heaterResp}=${hollResp}=${waterResp}=${irrResp}=${data.temp}=${data.delta}`
                res.status(200).send(result)
            })
        })
    })
}

module.exports = {entry, entry2}
