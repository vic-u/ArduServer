let myLineChart = undefined
filterChart = (dType) => $.get('/filter/' + dType, (data) => drawChart(data))
filterChart2 = (dType) => $.get('/filter2/' + dType, (data) => drawChart(data))

function drawChart(dataset) {
    const ctxL = document.getElementById('lineChart').getContext('2d')
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
