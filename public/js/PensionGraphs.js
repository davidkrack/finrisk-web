// PensionGraphs.js
class PensionGraphs {
    constructor() {
        this.graphsContainer = document.getElementById('graphs-container');
        this.setupTabListeners();
    }

    setupTabListeners() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button));
        });
    }

    switchTab(selectedButton) {
        // Remover active de todos los botones y contenidos
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Activar el tab seleccionado
        selectedButton.classList.add('active');
        const tabId = selectedButton.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    }

    async generateGraphs(results) {
        try {
            // Preparar datos para las 4 opciones
            const graphData = {};
            for (let i = 0; i < 4; i++) {
                const baseIndex = i * 11;
                const temporality = parseInt(results[baseIndex + 7]);
                
                graphData[`option${i + 1}`] = {
                    pension_amount: parseFloat(results[baseIndex + 2]),
                    temporality: temporality === 1320 ? 'Vitalicio' : temporality.toString(),
                    currency: results[baseIndex + 10]
                };
            }

            // Llamar al backend para generar los gráficos
            const response = await fetch('http://localhost:5000/generate-graphs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(graphData)
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const graphs = await response.json();
            this.renderGraphs(graphs);
            this.graphsContainer.style.display = 'block';
        } catch (error) {
            console.error('Error al generar los gráficos:', error);
            alert('Error al generar los gráficos: ' + error.message);
        }
    }

    renderGraphs(graphs) {
        Object.entries(graphs).forEach(([option, graphData]) => {
            const index = option.slice(-1);
            const graphContainer = document.getElementById(`graph-${index}`);
            
            if (graphContainer) {
                const parsedData = JSON.parse(graphData);
                Plotly.newPlot(
                    `graph-${index}`,
                    parsedData.data,
                    parsedData.layout
                );
            }
        });
    }
}

// Exportar la clase
window.PensionGraphs = PensionGraphs;