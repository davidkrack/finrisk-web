const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const loginRoutes = require('./routes/loginRoutes');
const authRoutes = require('./routes/authRoutes'); // Importa las rutas de autenticación

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: '6d66e52c1f00758541befbd0583ef670088e30a0612caa39428f62648e29f14a7c66bf72b04581132abbea0a6901275e19c8124f2144400955aefc4aad5600de',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Cambiar a 'true' si usas HTTPS
        httpOnly: true, // Asegura que las cookies solo sean accesibles por el servidor
        maxAge: 60000 // Ajusta la expiración de la cookie (en ms)
    }
}));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/auth', loginRoutes);

// Middleware para verificar si el usuario está autenticado
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        next(); // La sesión existe, permitir el acceso
    } else {
        res.redirect('/login'); // Si no hay sesión, redirigir al login
    }
}

// Ruta principal - Página Home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/home.html'));
});


// Ruta para la página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Usa las rutas de login
app.use('/auth', authRoutes); // Usa las rutas de autenticación

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

app.get('/cotizador', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/cotizador.html'));
});

// Inicia el servidor
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
