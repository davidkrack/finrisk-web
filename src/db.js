const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'gffcandia2',
    password: 'FR31416$', // Cambia esto por tu contraseña de MySQL
    database: 'orclpdb'
});

connection.connect(error => {
    if (error) {
        console.error('Error al conectar a la base de datos:', error);
    } else {
        console.log('Conectado a la base de datos MySQL');
    }
});

module.exports = connection;

