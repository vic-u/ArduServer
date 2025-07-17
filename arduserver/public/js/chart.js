var myLineChart = undefined
// $(document).on('input change', '#o1s1d', function (event) {
//     console.log('delta click')
//     $('#o1s1dl').text('Delta (1-5): ' + $('#o1s1d').val())
//     $.post("/sensor", { turn: $('#o1s1').is(':checked'), temp: $('#o1s1t').val(), delta: $('#o1s1d').val() })
// })
filterChart = (dtype) => $.get('/filter/' + dtype, (data) => drawChart(data))
filterChart2 = (dtype) => $.get('/filter2/' + dtype, (data) => drawChart(data))

function drawChart(dataset) {
    const ctxL = document.getElementById('lineChart').getContext('2d')
    console.log(ctxL);
    //ctxL.canvas.height = 600;
    if (myLineChart !== undefined) myLineChart.destroy()
    myLineChart = new Chart(ctxL, {
        type: 'line',
        data: {
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
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false
            },
        }
    })
}
