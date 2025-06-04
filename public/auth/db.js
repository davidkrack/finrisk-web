const oracledb = require('oracledb');

async function initialize() {
    try {
        await oracledb.createPool({
            user: 'gffcandia2',
            password: 'FR31416$',
            connectString: 'localhost:1521/orclpdb',
            poolMin: 1,
            poolMax: 4,
            poolIncrement: 1
        });
        console.log('Conexión a Oracle establecida');
    } catch (error) {
        console.error('Error al conectar a Oracle:', error);
        throw error;
    }
}

async function closePoolAndExit() {
    try {
        await oracledb.getPool().close();
    } catch (error) {
        console.error('Error al cerrar el pool:', error);
    }
    process.exit(0);
}

async function executeQuery(query, params = []) {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
            query, 
            params,
            { 
                outFormat: oracledb.OUT_FORMAT_OBJECT,
                autoCommit: true
            }
        );
        return result.rows;
    } catch (error) {
        console.error('Error en la consulta:', error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error al cerrar la conexión:', error);
            }
        }
    }
}

async function verifyTableAccess() {
    const query = `
        SELECT COUNT(*) as count 
        FROM PRIV_HTML_SIMULACION_CLIENTE 
        WHERE ROWNUM = 1
    `;
    
    try {
        const result = await executeQuery(query);
        return result;
    } catch (error) {
        console.error('Error verificando acceso a la tabla:', error);
        throw error;
    }
}

module.exports = {
    initialize,
    closePoolAndExit,
    executeQuery,
    verifyTableAccess
};