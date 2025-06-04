// auth.js
const express = require('express');
const router = express.Router();
const db = require('./db'); // Mantenemos la referencia a db.js

// Credenciales del agente (no de la base de datos)
const AGENT_USER = {
    username: "agente",
    password: "finrisk2024",
    id: 1
};

// Ruta de login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Verificar credenciales del agente
    if (username === AGENT_USER.username && password === AGENT_USER.password) {
        // Si las credenciales son correctas, establecer la sesión
        req.session.userId = AGENT_USER.id;
        req.session.username = AGENT_USER.username;
        
        // Verificar que podemos conectar con la base de datos
        try {
            // Hacer una consulta de prueba
            await db.executeQuery('SELECT 1 FROM DUAL');
            
            res.json({ 
                success: true,
                user: {
                    id: AGENT_USER.id,
                    username: AGENT_USER.username
                }
            });
        } catch (error) {
            console.error('Error de conexión a la base de datos:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error interno del servidor' 
            });
        }
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Usuario o contraseña incorrectos' 
        });
    }
});

// Mantener las demás rutas (logout, check-session, etc.)
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
        } else {
            res.json({ success: true, message: 'Sesión cerrada correctamente' });
        }
    });
});

router.get('/check-session', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ 
            loggedIn: true, 
            userId: req.session.userId,
            username: req.session.username
        });
    } else {
        res.json({ loggedIn: false });
    }
});

module.exports = router;