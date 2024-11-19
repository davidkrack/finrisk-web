import plotly.graph_objects as go
import json

def create_pension_graph(pension_amount):
    # Datos de ejemplo - esto se reemplazaría con datos reales
    years = list(range(2024, 2044))
    accumulated = [pension_amount * (1.03 ** i) for i in range(len(years))]
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=years,
        y=accumulated,
        mode='lines+markers',
        name='Pensión Acumulada',
        line=dict(color='#007bff', width=3),
        marker=dict(size=8)
    ))
    
    fig.update_layout(
        title='Proyección de Pensión Acumulada',
        xaxis_title='Año',
        yaxis_title='Monto Acumulado ($)',
        template='plotly_white',
        hovermode='x unified',
        font=dict(family="Arial, sans-serif")
    )
    
    return fig.to_json()

if __name__ == "__main__":
    from flask import Flask, jsonify
    
    app = Flask(__name__)
    
    @app.route('/generate-graph/<float:pension>')
    def generate_graph(pension):
        graph_json = create_pension_graph(pension)
        return jsonify(graph_json)
    
    app.run(port=5000)