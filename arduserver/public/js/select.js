selectToggler = () => $.post("/sensor", { turn: $('#o1s1').is(':checked'), temp: $('#o1s1t').val(), delta: $('#o1s1d').val()})
selectRange = (labelId, elemId, msg) => {
    $('#' + labelId).text(msg + $('#' + elemId).val())
    selectToggler()
}   
selectToggler2 = () => {
    console.log("select toggler")
    $.post("/sensor2",
        {
            heaterTurn: $('#o2s1heater').is(':checked'),
            hollTurn: $('#o2s1holl').is(':checked'),
            waterTurn: $('#o2s1water').is(':checked'),
            irrTurn: $('#o2s1irr').is(':checked'),
            temp: $('#o2s1t').val(),
            delta: $('#o2s1d').val()
        })
}
selectRange2 = (labelId, elemId, msg) => {
    $('#' + labelId).text(msg + $('#' + elemId).val())
    selectToggler2()
} 