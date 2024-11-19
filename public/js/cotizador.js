// Variables globales
let url_root = 'http://ec2-54-177-111-101.us-west-1.compute.amazonaws.com:8005/datasnap/rest/TServerMethods1/';
let ServFunc = 'Calculo_Grupo_Opcion_VPS';
let currentResults = null;
let loadedGraphs = {
    option1: false,
    option2: false,
    option3: false,
    option4: false
};

const FLASK_SERVER_URL = 'http://ec2-54-177-111-101.us-west-1.compute.amazonaws.com:5000';
// Función para capturar los datos del formulario
function captureFormData() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const investedAmount = document.getElementById('invested_amount').value;

    // Capturar valores de los radio buttons
    const incomeDuration = document.querySelector('input[name="income_duration"]:checked')?.value || 'single';
    const beneficiaryOption = document.querySelector('input[name="beneficiary_option"]:checked')?.value || 'no';
    const insuranceOption = document.querySelector('input[name="insurance_option"]:checked')?.value || 'no';
    const refundOption = document.querySelector('input[name="refund_option"]:checked')?.value || 'no';
    const currencyOption = document.querySelector('input[name="currency_option"]:checked')?.value || 'Soles';
    const birthDateInput = document.getElementById('birth_date').value;
    const birthDate = formatDate(new Date(birthDateInput));
    const gender = document.querySelector('input[name="gender"]:checked')?.value || 'male';

    // Establecer diferido en 0
    const diffMonths = 0;

    // Llenar Json_in
    Json_in = {
        Prima_Neta: investedAmount,
        Per_Diferido: "0",
        Seguro_Fallecimiento: beneficiaryOption === 'yes' ? 'Si' : 'No',
        Seguro_Devolucion: refundOption === 'yes' ? 'Si' : 'No',
        Seguro_Temporal: incomeDuration === 'single' ? 'No' : 'Si',
        Moneda_Seguro: currencyOption,
        Deseo_Contacto: "N",  // Cambiado de 'No' a 'N'
        Benef_Array: []
    };

    // Llenar Json_Ben
    Json_Ben = {
        Relacion: "TIT",
        Fecha_Nacimiento: birthDate,
        ID_Sexo: gender === 'male' ? 'SXM' : 'SXF',
        Porcent_Pago: "100",
        Salud: "SAN",
        Temporalidad_Pago: incomeDuration === 'single' ? '1320' : '240',
        Nombre: name,      // Nuevo campo agregado
        email: email,      // Nuevo campo agregado
        Telefono: phone    // Nuevo campo agregado
    };

    Json_in.Benef_Array = [Json_Ben];

    // Actualizar la sección de resultados
    document.getElementById('result-name').innerText = name;
    document.getElementById('result-email').innerText = email;
    document.getElementById('result-phone').innerText = phone;
    document.getElementById('result-investment').innerText = `${investedAmount} ${currencyOption}`;
    document.getElementById('result-duration').innerText = incomeDuration === 'single' ? 'Para toda la vida' : 'Por un período de tiempo';

    // Log para debugging
    console.log('Datos capturados y normalizados:', {
        formulario: {
            incomeDuration,
            beneficiaryOption,
            insuranceOption,
            refundOption,
            currencyOption,
            birthDate,
            gender,
            investedAmount,
            name,           // Agregado al log
            email,         // Agregado al log
            phone,         // Agregado al log
            deseoContacto: Json_in.Deseo_Contacto  // Agregado al log
        },
        Json_in,
        Json_Ben
    });

    return { Json_in, Json_Ben };
}

// Función para formatear la fecha
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Función para calcular la pensión
async function calculatePension() {
    try {
        const { Json_in, Json_Ben } = captureFormData();
        const Dat_Princ = [
            Json_in.Prima_Neta,
            Json_in.Per_Diferido,
            Json_in.Seguro_Fallecimiento,
            Json_in.Seguro_Devolucion,
            Json_in.Seguro_Temporal,
            '0',
            Json_in.Moneda_Seguro
        ];
        const Dat_Benef = [[
            Json_Ben.Relacion,
            Json_Ben.Fecha_Nacimiento,
            Json_Ben.ID_Sexo,
            Json_Ben.Porcent_Pago,
            Json_Ben.Salud,
            Json_Ben.Temporalidad_Pago
        ]];
        
        console.log('Enviando datos al servidor:', { Dat_Princ, Dat_Benef, url_root, ServFunc });
        
        const results = await Calculo_RRPP(Dat_Princ, Dat_Benef, url_root, ServFunc);
        console.log('Resultados recibidos:', results);
        return results;
    } catch (error) {
        console.error('Error en el cálculo:', error);
        throw error;
    }
}

// Función para mostrar los resultados
async function displayResults(results) {
    currentResults = results;
    if (!results || !Array.isArray(results) || results.length === 0) {
        console.error('No hay resultados para mostrar');
        return;
    }
 
    const resultsBody = document.getElementById('results-body');
    resultsBody.innerHTML = '';  // Limpiar resultados previos
 
    console.log('Datos a mostrar:', results);
 
    // Mostrar resultados en la tabla
    for (let i = 0; i < 4; i++) {
        const baseIndex = i * 11;
        
        if (baseIndex + 10 >= results.length) {
            console.error(`Datos incompletos para el grupo ${i + 1}`);
            continue;
        }
 
        const row = document.createElement('tr');
        const temporalidad = parseInt(results[baseIndex + 7]);
        let temporalidadText = temporalidad === 1320 ? 'Vitalicio' : `${temporalidad} meses`;
 
        row.innerHTML = `
            <td>${parseFloat(results[baseIndex + 2]).toFixed(2)}</td>
            <td>${results[baseIndex + 10]}</td>
            <td>${temporalidadText}</td>
            <td>${results[baseIndex + 4] || ''}</td>
            <td>${results[baseIndex + 5] || ''}</td>
            <td>${results[baseIndex + 6] || ''}</td>
            <td>${results[baseIndex + 8] || ''}</td>
            <td>${results[baseIndex + 9] || ''}</td>
        `;
        resultsBody.appendChild(row);
    }

    // Generar el primer gráfico automáticamente
    try {
        const graphContainer = document.getElementById('graphs-container');
        graphContainer.style.display = 'block';

        const investedAmount = document.getElementById('invested_amount').value;
        // Formatear la fecha correctamente
        const birthDateInput = document.getElementById('birth_date').value;
        const birthDate = formatDateForGraph(birthDateInput);
        const etx1 = parseFloat(results[44]) || 0;
        const firstPension = parseFloat(results[2]);
        const firstTemporality = parseInt(results[7]);

        console.log('Datos para el gráfico:', {
            pension: firstPension,
            capital: parseFloat(investedAmount),
            mortalidad: etx1,
            fecha_nacimiento: birthDate,
            temporalidad: firstTemporality
        });

        const response = await fetch(`${FLASK_SERVER_URL}/generate-graph`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pension: firstPension,
                capital: parseFloat(investedAmount),
                mortalidad: etx1,
                fecha_nacimiento: birthDate,
                temporalidad: firstTemporality
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        Plotly.newPlot('graph-1', 
            JSON.parse(data).data, 
            JSON.parse(data).layout,
            {
                displayModeBar: false
            }
        );
        loadedGraphs.option1 = true;

        // Configurar los event listeners para los tabs
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', async function() {
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
                
                if (!loadedGraphs[tabId]) {
                    const index = parseInt(tabId.replace('option', '')) - 1;
                    const baseIndex = index * 11;
                    
                    try {
                        const response = await fetch(`${FLASK_SERVER_URL}/generate-graph`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                pension: parseFloat(results[baseIndex + 2]),
                                capital: parseFloat(investedAmount),
                                mortalidad: etx1,
                                fecha_nacimiento: birthDate,
                                temporalidad: parseInt(results[baseIndex + 7])
                            })
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const data = await response.json();
                        Plotly.newPlot(`graph-${index + 1}`,
                            JSON.parse(data).data,
                            JSON.parse(data).layout,
                            {
                                displayModeBar: false
                            }
                        );
                        loadedGraphs[tabId] = true;
                    } catch (error) {
                        console.error(`Error al cargar gráfico ${index + 1}:`, error);
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error al generar los gráficos:', error);
        alert('Error al generar los gráficos: ' + error.message);
    }
}
function formatDateForGraph(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
// Función para mostrar la sección de resultados
function showResultsSection() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('results-container').style.display = 'block';
    document.getElementById('info-step').classList.remove('active');
    document.getElementById('results-step').classList.add('active');
}

// Función para actualizar los montos según la moneda seleccionada
function updateInvestmentAmounts() {
    const currencyRadio = document.querySelector('input[name="currency_option"]:checked');
    if (!currencyRadio) return;

    const currencyOption = currencyRadio.value;
    const investedAmount = document.getElementById('invested_amount');
    
    investedAmount.innerHTML = '<option value="">Seleccione un monto</option>';
    
    if (currencyOption === 'Soles') {
        for (let i = 100000; i <= 500000; i += 50000) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i.toLocaleString('es-PE');
            investedAmount.appendChild(option);
        }
    } else {
        // Montos en Dólares
        const option70k = document.createElement('option');
        option70k.value = 70000;
        option70k.textContent = '70,000';
        investedAmount.appendChild(option70k);

        for (let i = 100000; i <= 500000; i += 50000) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i.toLocaleString('es-PE');
            investedAmount.appendChild(option);
        }
    }
}
function switchTab(tabId) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Activar el tab seleccionado
    document.querySelector(`#${tabId}`).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}
function setupTabListeners(investedAmount, results) {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', async function() {
            const tabId = this.getAttribute('data-tab');
            const index = parseInt(tabId.replace('option', '')) - 1;
            const baseIndex = index * 11;
            
            if (!loadedGraphs[tabId]) {
                try {
                    const response = await fetch(`${FLASK_SERVER_URL}/generate-graph`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            pension: parseFloat(results[baseIndex + 2]),
                            capital: parseFloat(investedAmount),
                            mortalidad: parseFloat(results[44]) || 0
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    Plotly.newPlot(`graph-${index + 1}`,
                        JSON.parse(data).data,
                        JSON.parse(data).layout,
                        {
                            displayModeBar: false
                        }
                    );
                    loadedGraphs[tabId] = true;
                } catch (error) {
                    console.error(`Error al cargar gráfico ${index + 1}:`, error);
                }
            }

            // Cambiar la pestaña activa
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            this.classList.add('active');
        });
    });
}

function showCustomModal(message) {
    const modal = document.getElementById('custom-modal');
    const modalMessage = document.getElementById('modal-message');
    modalMessage.textContent = message;
    modal.style.display = 'block';

    // Cerrar modal con el botón de cerrar
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    // Cerrar modal con el botón de aceptar
    const acceptBtn = modal.querySelector('.modal-button');
    acceptBtn.onclick = function() {
        modal.style.display = 'none';
    }

    // Cerrar modal al hacer clic fuera
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}


// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar los montos
    updateInvestmentAmounts();
    
    // Event listeners para los radio buttons de moneda
    document.querySelectorAll('input[name="currency_option"]').forEach(radio => {
        radio.addEventListener('change', updateInvestmentAmounts);
    });

    // Event listeners para los tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', async function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
            
            // Si el gráfico no se ha cargado para este tab, cargarlo
            if (!loadedGraphs[tabId] && currentResults) {
                const index = parseInt(tabId.replace('option', '')) - 1;
                const baseIndex = index * 11;
                const pension = parseFloat(currentResults[baseIndex + 2]);
                const investedAmount = document.getElementById('invested_amount').value;
                const etx1 = parseFloat(currentResults[44]) || 0;

                try {
                    const response = await fetch(`${FLASK_SERVER_URL}/generate-graph`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            pension: pension,
                            capital: parseFloat(investedAmount),
                            mortalidad: etx1
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    Plotly.newPlot(`graph-${index + 1}`,
                        JSON.parse(data).data,
                        JSON.parse(data).layout,
                        {
                            displayModeBar: false
                        }
                    );
                    loadedGraphs[tabId] = true;
                } catch (error) {
                    console.error(`Error al cargar gráfico ${index + 1}:`, error);
                }
            }
        });
    });

    // Event listener para el botón de cálculo
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', async function(e) {
            const birthDateInput = document.getElementById('birth_date');
            const investedAmountInput = document.getElementById('invested_amount');
            const birthDate = new Date(birthDateInput.value);
            const minDate = new Date('1939-01-01');
            const maxDate = new Date('2000-12-31');

            if (!birthDateInput.value) {
                alert('Por favor, ingrese su fecha de nacimiento');
                birthDateInput.focus();
                return;
            }

            if (birthDate < minDate || birthDate > maxDate) {
                alert('La fecha de nacimiento debe estar entre 1939 y 2000');
                birthDateInput.focus();
                return;
            }

            if (!investedAmountInput.value) {
                alert('Por favor, seleccione un monto a invertir');
                investedAmountInput.focus();
                return;
            }

            try {
                document.getElementById('loading-spinner').style.display = 'flex';
                const results = await calculatePension();
                displayResults(results);
                showResultsSection();
            } catch (error) {
                console.error('Error:', error);
                alert(`Hubo un error al calcular la pensión: ${error}. Por favor, intente de nuevo.`);
            } finally {
                document.getElementById('loading-spinner').style.display = 'none';
            }
        });
    }

    // Event listener para el botón de recálculo
    const recalculateBtn = document.getElementById('recalculate-btn');
    if (recalculateBtn) {
        recalculateBtn.addEventListener('click', function() {
            location.reload();
        });
    }

    // Event listener para el botón de contacto
    const contactBtn = document.getElementById('contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', async function() {
            const name = document.getElementById('result-name').innerText;
            const email = document.getElementById('result-email').innerText;
            const phone = document.getElementById('result-phone').innerText;
    
            if (!name.trim() || !email.trim() || !phone.trim()) {
                showCustomModal('Por favor vuelva a calcular con sus datos de contacto');
                return;
            }
    
            try {
                const currentData = captureFormData();
                currentData.Json_in.Deseo_Contacto = "S";
    
                const results = await Calculo_RRPP(
                    [
                        currentData.Json_in.Prima_Neta,
                        currentData.Json_in.Per_Diferido,
                        currentData.Json_in.Seguro_Fallecimiento,
                        currentData.Json_in.Seguro_Devolucion,
                        currentData.Json_in.Seguro_Temporal,
                        0,
                        currentData.Json_in.Moneda_Seguro,
                        "S"
                    ],
                    [[
                        currentData.Json_Ben.Relacion,
                        currentData.Json_Ben.Fecha_Nacimiento,
                        currentData.Json_Ben.ID_Sexo,
                        currentData.Json_Ben.Porcent_Pago,
                        currentData.Json_Ben.Salud,
                        currentData.Json_Ben.Temporalidad_Pago,
                        currentData.Json_Ben.Nombre,
                        currentData.Json_Ben.email,
                        currentData.Json_Ben.Telefono
                    ]],
                    url_root,
                    ServFunc
                );
    
                showCustomModal('¡Gracias! Pronto un ejecutivo se pondrá en contacto con usted.');
            } catch (error) {
                console.error('Error al procesar la solicitud de contacto:', error);
                showCustomModal('Hubo un error al procesar su solicitud. Por favor intente nuevamente.');
            }
        });
    }
});