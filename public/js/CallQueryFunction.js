// CallQueryFunction.js
const Params = [];
let Name_Qry, Name_Qry1;
let url_root, Lim_param;
var url_func, end_url, strjson_url;
let Respuesta, JsonRespuesta, jsobject, jsobjectValor;
var url_encode;

var Json_in = {
    "Nombre_qry": Name_Qry,
    "Parametros": [],
    "Valor_Parametros": []
};

function Call_Query(Name_Qry1, Params, url_root, Lim_param, ServFunc) {
    Json_in.Nombre_qry = Name_Qry1;
    for (let i = 0; i <= Lim_param; ++i) {
        Json_in.Parametros[i] = Params[i][0];
        Json_in.Valor_Parametros[i] = Params[i][1];
    }

    url_func = url_root + ServFunc + '/';
    strjson_url = JSON.stringify(Json_in);
    url_encode = encodeURIComponent(strjson_url);
    end_url = url_func + url_encode;

    const url = new URL(end_url);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'text';

        xhr.onload = function() {
            if (xhr.status === 200) {
                const Respuesta = xhr.response;
                try {
                    const JsonRespuesta = JSON.parse(Respuesta);
                    const jsobject = JSON.parse(JsonRespuesta.result[0]);
                    const jsobjectValor = JSON.parse(jsobject[0]);
                    let linea1 = '';
                    for (i = 0; i <= 10; ++i) {
                        linea1 = linea1 + jsobjectValor[i] + ' ';
                    }
                    resolve(linea1);
                } catch (e) {
                    reject('Error al procesar la respuesta: ' + e.message);
                }
            } else {
                reject('Error en la solicitud: ' + xhr.status);
            }
        };

        xhr.onerror = function() {
            reject('Error en la conexión al servidor.');
        };

        xhr.send();
    });
}
