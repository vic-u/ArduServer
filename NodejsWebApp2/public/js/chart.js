//line
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