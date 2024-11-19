
var Json_in = {
    Prima_Neta: 0,
    Per_Diferido: 0,
    Seguro_Fallecimiento: '',
    Seguro_Devolucion: '',
    Seguro_Temporal: '',
    Moneda_Seguro: '',
    Deseo_Contacto: 'N',  // Cambiado de 'No' a 'N'
    Benef_Array: []
};
 
var Json_Ben = {
    Relacion: '',
    Fecha_Nacimiento: '',
    ID_Sexo: '',
    Porcent_Pago: '',
    Temporalidad_Pago: '',
    Salud: '',
    Nombre: '',     // Nuevo campo agregado
    email: '',      // Nuevo campo agregado
    Telefono: ''    // Nuevo campo agregado
};
 
const Resultado_Func = [];
 
function Calculo_RRPP(Dat_Princ, Dat_Benef, url_root, ServFunc) {
    console.log('Datos recibidos en Calculo_RRPP:', JSON.stringify({ Dat_Princ, Dat_Benef, url_root, ServFunc }));

    if (!Dat_Princ || !Array.isArray(Dat_Princ) || Dat_Princ.length === 0) {
        throw new Error('Dat_Princ es inválido o está vacío');
    }

    if (!Dat_Benef || !Array.isArray(Dat_Benef) || Dat_Benef.length === 0) {
        throw new Error('Dat_Benef es inválido o está vacío');
    }

    console.log('Json_in antes de la asignación:', JSON.stringify(Json_in));
    console.log('Json_Ben antes de la asignación:', JSON.stringify(Json_Ben));

    Json_in.Prima_Neta = Dat_Princ[0] || 0;
    Json_in.Per_Diferido = Dat_Princ[1] || 0;
    Json_in.Seguro_Fallecimiento = Dat_Princ[2] || 'No';
    Json_in.Seguro_Devolucion = Dat_Princ[3] || 'No';
    Json_in.Seguro_Temporal = Dat_Princ[4] || 'No';
    Json_in.Moneda_Seguro = Dat_Princ[6] || 'Soles';
    Json_in.Deseo_Contacto = Dat_Princ[7] || 'No';  // Nuevo campo agregado

    if (Dat_Benef && Array.isArray(Dat_Benef) && Dat_Benef.length > 0 && Array.isArray(Dat_Benef[0])) {
        Json_Ben.Relacion = Dat_Benef[0][0] || '';
        Json_Ben.Fecha_Nacimiento = Dat_Benef[0][1] || '';
        Json_Ben.ID_Sexo = Dat_Benef[0][2] || '';
        Json_Ben.Porcent_Pago = Dat_Benef[0][3] || '1';
        Json_Ben.Salud = Dat_Benef[0][4] || 'SAN';
        Json_Ben.Temporalidad_Pago = Dat_Benef[0][5] || '0';
        Json_Ben.Nombre = Dat_Benef[0][6] || '';       // Nuevo campo agregado
        Json_Ben.email = Dat_Benef[0][7] || '';        // Nuevo campo agregado
        Json_Ben.Telefono = Dat_Benef[0][8] || '';     // Nuevo campo agregado
    } else {
        console.error('Dat_Benef no tiene la estructura esperada:', Dat_Benef);
        throw new Error('Datos de beneficiario inválidos');
    }

    Json_in.Benef_Array = [Json_Ben];

    console.log('Json_in después de la asignación:', JSON.stringify(Json_in));
    console.log('Json_Ben después de la asignación:', JSON.stringify(Json_Ben));

    const url_func = url_root + ServFunc + '/';
    const strjson_url = JSON.stringify(Json_in);
    const url_encode = encodeURIComponent(strjson_url);
    const end_url = url_func + url_encode;
    
    console.log('URL de la solicitud:', end_url);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', end_url, true);
        xhr.responseType = 'text';

        xhr.onload = function() {
            if (xhr.status === 200) {
                const Respuesta = xhr.response;
                try {
                    const JsonRespuesta = JSON.parse(Respuesta);
                    const jsobject = JSON.parse(JsonRespuesta.result);
        
                    // Opción 1
                    Resultado_Func[0] = jsobject.TIR1;
                    Resultado_Func[1] = jsobject.VAN1;
                    Resultado_Func[2] = jsobject.Renta1;
                    Resultado_Func[3] = jsobject.Tasa_Tecnica1;
                    Resultado_Func[4] = jsobject.Garantizado1;
                    Resultado_Func[5] = jsobject.Monto_Aseg_Fall1;
                    Resultado_Func[6] = jsobject.Monto_Aseg_Superv1;
                    Resultado_Func[7] = jsobject.Temporalidad1;
                    Resultado_Func[8] = jsobject.GastoSepelio1;
                    Resultado_Func[9] = jsobject.MontoPagadoTot1;
                    Resultado_Func[10] = jsobject.Moneda1;

                    // Opción 2
                    Resultado_Func[11] = jsobject.TIR2;
                    Resultado_Func[12] = jsobject.VAN2;
                    Resultado_Func[13] = jsobject.Renta2;
                    Resultado_Func[14] = jsobject.Tasa_Tecnica2;
                    Resultado_Func[15] = jsobject.Garantizado2;
                    Resultado_Func[16] = jsobject.Monto_Aseg_Fall2;
                    Resultado_Func[17] = jsobject.Monto_Aseg_Superv2;
                    Resultado_Func[18] = jsobject.Temporalidad2;
                    Resultado_Func[19] = jsobject.GastoSepelio2;
                    Resultado_Func[20] = jsobject.MontoPagadoTot2;
                    Resultado_Func[21] = jsobject.Moneda2;

                    // Opción 3
                    Resultado_Func[22] = jsobject.TIR3;
                    Resultado_Func[23] = jsobject.VAN3;
                    Resultado_Func[24] = jsobject.Renta3;
                    Resultado_Func[25] = jsobject.Tasa_Tecnica3;
                    Resultado_Func[26] = jsobject.Garantizado3;
                    Resultado_Func[27] = jsobject.Monto_Aseg_Fall3;
                    Resultado_Func[28] = jsobject.Monto_Aseg_Superv3;
                    Resultado_Func[29] = jsobject.Temporalidad3;
                    Resultado_Func[30] = jsobject.GastoSepelio3;
                    Resultado_Func[31] = jsobject.MontoPagadoTot3;
                    Resultado_Func[32] = jsobject.Moneda3;

                    // Opción 4
                    Resultado_Func[33] = jsobject.TIR4;
                    Resultado_Func[34] = jsobject.VAN4;
                    Resultado_Func[35] = jsobject.Renta4;
                    Resultado_Func[36] = jsobject.Tasa_Tecnica4;
                    Resultado_Func[37] = jsobject.Garantizado4;
                    Resultado_Func[38] = jsobject.Monto_Aseg_Fall4;
                    Resultado_Func[39] = jsobject.Monto_Aseg_Superv4;
                    Resultado_Func[40] = jsobject.Temporalidad4;
                    Resultado_Func[41] = jsobject.GastoSepelio4;
                    Resultado_Func[42] = jsobject.MontoPagadoTot4;
                    Resultado_Func[43] = jsobject.Moneda4;

                    Resultado_Func[44] = jsobject.ETX1;
        
                    console.log('Resultado_Func:', Resultado_Func);
                    resolve(Resultado_Func);
                } catch (e) {
                    console.error('Error al procesar la respuesta:', e);
                    reject('Error al procesar la respuesta: ' + e.message);
                }
            } else {
                console.error('Error en la solicitud HTTP:', xhr.status);
                reject('Error en la solicitud: ' + xhr.status);
            }
        };

        xhr.onerror = function() {
            console.error('Error en la conexión al servidor');
            reject('Error en la conexión al servidor.');
        };

        xhr.send();
    });
}

// Función para generar gráficos
async function generatePensionGraphs(results) {
    if (!results || !Array.isArray(results) || results.length === 0) {
        throw new Error('No hay datos disponibles para generar los gráficos');
    }

    const graphData = {};
    
    // Preparar datos para cada opción (4 opciones)
    for (let i = 0; i < 4; i++) {
        const baseIndex = i * 11;
        const pension = parseFloat(results[baseIndex + 2]);
        const temporality = parseInt(results[baseIndex + 7]);
        const currency = results[baseIndex + 10];

        if (isNaN(pension)) continue;

        try {
            // Cambiamos a /generate-graph y enviamos solo el monto de pensión
            const response = await fetch(`http://localhost:5000/generate-graph/${pension}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const graphResult = await response.json();
            graphData[`option${i + 1}`] = graphResult;
        } catch (error) {
            console.error(`Error al generar gráfico para opción ${i + 1}:`, error);
        }
    }

    return graphData;
}

// Asegurar que las funciones estén disponibles globalmente
window.Calculo_RRPP = Calculo_RRPP;
window.generatePensionGraphs = generatePensionGraphs;