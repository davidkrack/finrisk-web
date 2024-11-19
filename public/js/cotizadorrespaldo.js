// Función para capturar los datos del formulario y mostrarlos en la sección de resultados
function captureFormData() {
    // Obtener los valores del formulario
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const investedAmount = document.getElementById('invested_amount').value;
    const pensionStart = document.getElementById('pension-start').value;
    
    // Simular obtener la duración seleccionada (puede cambiarse según tu lógica)
    const incomeDuration = document.querySelector('input[name="income_duration"]:checked').nextElementSibling.innerText;

    // Asignar los valores a los campos no editables
    document.getElementById('result-name').innerText = name;
    document.getElementById('result-email').innerText = email;
    document.getElementById('result-phone').innerText = phone;
    document.getElementById('result-investment').innerText = investedAmount + ' CLP';
    document.getElementById('result-start').innerText = pensionStart;
    document.getElementById('result-duration').innerText = incomeDuration;
}

// Función para simular los cálculos y generar los resultados en la tabla
function simulateCalculation() {
    const results = [
        { pension: '500.000 CLP', rentPeriod: '10 años', description: 'Opción A' },
        { pension: '600.000 CLP', rentPeriod: '15 años', description: 'Opción B' },
        { pension: '700.000 CLP', rentPeriod: '20 años', description: 'Opción C' }
    ];

    // Obtener el cuerpo de la tabla de resultados
    const resultsBody = document.getElementById('results-body');
    resultsBody.innerHTML = '';  // Limpiar resultados previos

    // Iterar sobre los resultados y agregarlos a la tabla
    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.pension}</td>
            <td>${result.rentPeriod}</td>
            <td>${result.description}</td>
        `;
        resultsBody.appendChild(row);
    });
}

// Función para cambiar de la sección de ingreso a la sección de resultados
function showResultsSection() {
    document.querySelector('.container').style.display = 'none'; // Ocultar la sección de ingreso
    document.getElementById('results-container').style.display = 'block'; // Mostrar la sección de resultados

    // Resaltar el paso de resultados en la navegación
    document.getElementById('info-step').classList.remove('active');
    document.getElementById('results-step').classList.add('active');
}

// Evento para manejar el botón de calcular
document.getElementById('calculate-btn').addEventListener('click', function() {
    captureFormData(); // Capturar los datos del formulario
    simulateCalculation(); // Simular el cálculo y mostrar los resultados
    showResultsSection(); // Mostrar la sección de resultados
});
