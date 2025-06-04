const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('../public/auth/db');
const authRoutes = require('../public/auth/auth');
const app = express();

// En auth.js o donde esté la consulta original
const query = `
    SELECT * FROM COT_USUARIOS 
    WHERE USERNAME = :username 
    AND PASSWORD = :password
`;

// Y para la tabla de simulación:
const simulationQuery = `
    SELECT * FROM GFFCANDIA2.PRIV_HTML_SIMULACION_CLIENTE
`;

// O alternativamente:
const altSimulationQuery = `
    SELECT * FROM "GFFCANDIA2"."PRIV_HTML_SIMULACION_CLIENTE"
`;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: '6d66e52c1f00758541befbd0583ef670088e30a0612caa39428f62648e29f14a7c66bf72b04581132abbea0a6901275e19c8124f2144400955aefc4aad5600de',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 60000
    }
}));

app.use(express.static(path.join(__dirname, '../public')));
app.use('/auth', authRoutes);

// Middleware de autenticación
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Rutas públicas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/home.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// En app.js
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html')); // Página que cargará tu app React
});

app.get('/cotizador', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/cotizador.html'));
});

// Rutas protegidas
app.get('/pension/calculo-pension', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pension.html'));
});

app.get('/control-panel', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/panel.html'));
});

app.get('/web-quote', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/web-quote.html'));
});

app.get('/commercial-quote', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/commercial-quote.html'));
});


app.get('/api/dashboard-data', isAuthenticated, async (req, res) => {
    try {
        const query = `
            SELECT * FROM PRIV_HTML_SIMULACION_CLIENTE 
            ORDER BY FECHA_CALCULO DESC
        `;
        const results = await db.executeQuery(query);
        res.json(results);
    } catch (error) {
        console.error('Error al obtener datos del dashboard:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// API para obtener datos de clientes
app.get('/api/client-data', isAuthenticated, async (req, res) => {
    try {
        const query = `
        SELECT 
            ID_USUARIO,
            ID_SIMULACION,
            PRIMA_TOT,
            PERIODO_RENTA,
            GARANTIZADO,
            MONTO_SEGURO_VIDA,
            MONTO_DEVOLUCION,
            MONEDA_PAGO_PENSION,
            SEXO,
            FECHA_NACIMIENTO,
            NOMBRE,
            EMAIL,
            TELEFONO,
            RENTA_OUT,
            GASTO_SEPELIO,
            MONTO_RECIBIDO_TOT,
            FECHA_CALCULO,
            DESEA_SER_CONTACTADO
        FROM PRIV_HTML_SIMULACION_CLIENTE
        ORDER BY FECHA_CALCULO DESC`;
        const results = await db.executeQuery(query);
        res.json(results);
    } catch (error) {
        console.error('Error al obtener datos de clientes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/test-db', async (req, res) => {
    try {
        const tables = await db.verifyTableAccess();
        res.json({
            success: true,
            message: 'Conexión exitosa',
            tables: tables
        });
    } catch (error) {
        console.error('Error en test:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Ocurrió un error en el servidor'
    });
});

// Iniciar servidor
async function startServer() {
    try {
        await db.initialize();
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    try {
        console.log('Cerrando conexiones...');
        await db.closePoolAndExit();
        process.exit(0);
    } catch (error) {
        console.error('Error al cerrar el servidor:', error);
        process.exit(1);
    }
});

startServer();

module.exports = app;