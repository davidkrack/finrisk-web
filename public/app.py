from flask import Flask, jsonify, request
from flask_cors import CORS
import plotly.graph_objects as go
from datetime import datetime, timedelta
from math import log, pow
import traceback

app = Flask(__name__)
CORS(app)

def calculate_n_months(capital, pension, tasa_anual):
    # Equivalente a: LN(((C9-1)*C5/C10)+1)/LN(C9)
    tasa_mensual = pow(1 + tasa_anual/100, 1/12) - 1
    v = 1 / (1 + tasa_mensual)
    try:
        n_meses = log(((v - 1) * capital/pension) + 1) / log(v)
        return n_meses
    except:
        return 0

def calculate_rent_amount(edad_actual, edad_inicio, periodo_anios, pension):
    """
    edad_actual: edad en años
    edad_inicio: edad inicial (C13 en Excel)
    periodo_anios: periodo en años (D16 en Excel)
    pension: monto de la pensión (J6 en Excel)
    """
    if edad_actual <= edad_inicio + periodo_anios:
        return pension
    return 0

@app.route('/generate-graph', methods=['POST'])
def generate_graph():
    try:
        data = request.json
        print("Datos recibidos:", data)
        
        if not data:
            raise ValueError("No se recibieron datos")

        # Conversiones seguras a float/int
        try:
            pension = float(data.get('pension', 0))
            capital_inicial = float(data.get('capital', 0))
            mortalidad = float(data.get('mortalidad', 0))
            temporalidad = int(data.get('temporalidad', 1320))
        except (ValueError, TypeError) as e:
            raise ValueError(f"Error en conversión de números: {str(e)}")
            
        # Validaciones adicionales
        if pension <= 0:
            raise ValueError(f"Pensión inválida: {pension}")
        if capital_inicial <= 0:
            raise ValueError(f"Capital inicial inválido: {capital_inicial}")
        if mortalidad <= 0:
            raise ValueError(f"Mortalidad inválida: {mortalidad}")
        if temporalidad <= 0:
            raise ValueError(f"Temporalidad inválida: {temporalidad}")
        
        fecha_nacimiento = data.get('fecha_nacimiento', '')
        if not fecha_nacimiento:
            raise ValueError("Fecha de nacimiento es requerida")
            
        try:
            # Validar el formato de la fecha
            fecha_nac = datetime.strptime(fecha_nacimiento, '%d/%m/%Y')
        except ValueError as e:
            raise ValueError(f"Formato de fecha inválido: {fecha_nacimiento}. Debe ser DD/MM/YYYY")
            
        tasa_anual = 0.01  # Fija en 1%
        
        # Calcular período de pago
        n_meses = calculate_n_months(capital_inicial, pension, tasa_anual)
        pago_total = pension * n_meses
        
        # Calcular edad actual desde fecha de nacimiento
        edad_actual = datetime.now().year - fecha_nac.year - ((datetime.now().month, datetime.now().day) < (fecha_nac.month, fecha_nac.day))
        
        # Parámetros
        edad_inicial = edad_actual
        edad_final = 95
        edad_mortalidad = edad_inicial + mortalidad

        # Debug adicional
        print(f"Datos procesados:")
        print(f"- Pensión: {pension}")
        print(f"- Capital Inicial: {capital_inicial}")
        print(f"- Mortalidad: {mortalidad}")
        print(f"- Fecha Nacimiento: {fecha_nacimiento}")
        print(f"- Temporalidad: {temporalidad}")
        print(f"- Edad Actual: {edad_actual}")
        print(f"- Edad Mortalidad: {edad_mortalidad}")
        print(f"- N Meses: {n_meses}")
        print(f"- Pago Total: {pago_total}")

        # Calcular período
        periodo_retiro = calculate_n_months(capital_inicial, pension, tasa_anual)
        periodo_anios = round(n_meses / 12)  # Equivalente a D8 = C8/12
        periodo_renta = round(temporalidad / 12)  # Periodo en años para la renta

        edades = list(range(edad_inicial, edad_final + 1))
        retiro_mensual = []
        renta_mensual = []

        for edad in edades:
            # Retiro Mensual: SI(H7<=C13+D8;I6;0)
            if edad <= edad_inicial + periodo_anios:
                retiro_mensual.append(pension)
            else:
                retiro_mensual.append(0)

            # Renta Mensual: SI(H8<=C13+D16;J7;0)
            if temporalidad == 1320:  # Si es vitalicio
                renta_mensual.append(pension)
            else:
                if edad <= edad_inicial + periodo_renta:
                    renta_mensual.append(pension)
                else:
                    renta_mensual.append(0)

        fig = go.Figure()
        
        # Línea de Renta Mensual (más gruesa y debajo)
        fig.add_trace(go.Scatter(
            x=edades,
            y=renta_mensual,
            mode='lines',
            name='Renta Mensual',
            line=dict(color='#dc3912', width=4),
            hovertemplate='Edad: %{x} años<br>Renta: $%{y:,.2f}<extra></extra>'
        ))
        
        # Línea de Retiro Mensual (más delgada y arriba)
        fig.add_trace(go.Scatter(
            x=edades,
            y=retiro_mensual,
            mode='lines',
            name='Retiro Mensual',
            line=dict(color='#3366cc', width=2),
            hovertemplate='Edad: %{x} años<br>Retiro: $%{y:,.2f}<extra></extra>'
        ))      
        
        # Línea vertical de mortalidad esperada
        fig.add_trace(go.Scatter(
            x=[edad_mortalidad, edad_mortalidad],
            y=[0, pension * 1.1],
            mode='lines',
            name=f'Esperanza de vida: {edad_mortalidad:.1f} años',
            line=dict(
                color="black",
                width=2,
                dash="dot",
            ),
            hoverinfo='skip'
        ))

        # Agregar marcador en la línea de mortalidad
        fig.add_trace(go.Scatter(
            x=[edad_mortalidad],
            y=[pension * 1.1],
            mode='markers+text',
            name='Esperanza de Vida',
            marker=dict(
                symbol='triangle-down',
                size=12,
                color='black',
            ),
            text=[f'Esperanza de vida: {edad_mortalidad:.1f} años'],
            textposition='top center',
            showlegend=False,
            hoverinfo='skip'
        ))
        # Crear una sola anotación con toda la información
        info_annotation = dict(
            x=1.10,
            y=0.75,
            xref='paper',
            yref='paper',
            text=(
                '<b>Información del Análisis</b><br><br>' +
                '<b style="color: #dc3912;">Renta Mensual:</b><br>' +
                f'Capital Inicial: ${capital_inicial:,.2f}<br>' +
                f'Pago Total: {"Vitalicio" if temporalidad == 1320 else f"${pension * temporalidad:,.2f}"}<br>' +
                f'Esperanza de Vida: {edad_mortalidad:.1f} años<br><br>' +
                '<b style="color: #3366cc;">Retiro Mensual:</b><br>' +
                f'Capital Inicial: ${capital_inicial:,.2f}<br>' +
                f'Pago Total: ${pension * periodo_retiro:,.2f}<br>' +
                f'Periodo: {periodo_retiro/12:.1f} años'
            ),
            showarrow=False,
            bgcolor='rgba(255,255,255,0.9)',
            bordercolor='#666666',
            borderwidth=2,
            borderpad=6,
            font=dict(size=11, color='#333'),
            align='left',
            xanchor='left',
            yanchor='top',
            width=300
        )
        
        # Configuración del diseño
        fig.update_layout(
            title={
                'text': f'Proyección de Pensión{" Vitalicia" if temporalidad == 1320 else " Temporal"}',
                'font': {'size': 24, 'color': '#333'},
                'y': 0.95
            },
            plot_bgcolor='#fff5e6',
            paper_bgcolor='#fff5e6',
            font={'color': '#333'},
            
            xaxis={
                'title': 'Edad (años)',
                'gridcolor': '#ffe6cc',
                'showgrid': True,
                'zeroline': False,
                'titlefont': {'size': 18},
                'dtick': 5,
                'range': [edad_inicial, edad_final]
            },
            yaxis={
                'title': 'Renta Mensual ($)',
                'gridcolor': '#ffe6cc',
                'showgrid': True,
                'zeroline': False,
                'titlefont': {'size': 18},
                'tickformat': '$,.0f',
                'range': [0, pension * 1.1]
            },
            
            showlegend=True,
            legend={
                'bgcolor': 'rgba(255,255,255,0.9)',
                'bordercolor': '#ccc',
                'borderwidth': 1,
                'x': 1.18,
                'y': 0.98,
                'xanchor': 'left',
                'yanchor': 'top',
                'font': {'size': 11}
            },
            
            annotations=[info_annotation],
            margin=dict(t=80, l=70, r=320, b=50),
            height=630,
            width=1100,
            hovermode='x unified',
            autosize=False
        )
        
        return jsonify(fig.to_json())
    except Exception as e:
        print(f"Error generating graph: {str(e)}")
        print(f"Tipo de error: {type(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)