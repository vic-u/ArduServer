var myLineChart = undefined;
$(document).on('click', '#o1s1', function (event) {
    console.log("toggle click");
    $.post("/sensor", { turn: $('#o1s1').is(':checked'), temp: $('#o1s1t').val(), delta: $('#o1s1d').val() });
});
$(document).on('input change', '#o1s1t', function (event) {
    console.log('temp click');
    $('#o1s1tl').text('Temp (0-30): ' + $('#o1s1t').val());
    $.post("/sensor", { turn: $('#o1s1').is(':checked'), temp: $('#o1s1t').val(), delta: $('#o1s1d').val() });
});
$(document).on('input change', '#o1s1d', function (event) {
    console.log('delta click');
    $('#o1s1dl').text('Delta (1-5): ' + $('#o1s1d').val());
    $.post("/sensor", { turn: $('#o1s1').is(':checked'), temp: $('#o1s1t').val(), delta: $('#o1s1d').val() });
});
function filterChart(dtype) {
    console.log("click");
    result = $.get("/filter/" + dtype, function (data) {
        console.log("1");
        console.log(data);
        drawChart(data);
    });

}
function drawChart(dataset) {
    console.log(dataset);
    console.log(dataset.labels);
    console.log(dataset.data);
    console.log(dataset.label);
    var ctxL = document.getElementById("lineChart").getContext('2d');
    console.log(ctxL);
    if (myLineChart !== undefined) myLineChart.destroy();
    myLineChart = new Chart(ctxL, {
        type: 'line',
        data: {
            //labels: ['2019.0.23.9', '2019.0.23.9', '2019.0.24.11', '2019.0.24.11'],
            labels: dataset.labels,
            datasets: [{
                label: dataset.label,
                data: dataset.data,
                backgroundColor: [
                    'rgba(105, 0, 132, .2)',
                ],
                borderColor: [
                    'rgba(200, 99, 132, .7)',
                ],
                borderWidth: 2
            }
            ]
        },
        options: {
            responsive: true
        }
    });
}