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
function drawchart(dataset) {
    var ctxL = document.getElementById("lineChart").getContext('2d');
    var myLineChart = new Chart(ctxL, {
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
            //},
            //{
            //    label: "My Second dataset",
            //    data: [28, 48, 40, 19, 86, 27, 90],
            //    backgroundColor: [
            //        'rgba(0, 137, 132, .2)',
            //    ],
            //    borderColor: [
            //        'rgba(0, 10, 130, .7)',
            //    ],
            //    borderWidth: 2
            //}
            ]
        },
        options: {
            responsive: true
        }
    });
}