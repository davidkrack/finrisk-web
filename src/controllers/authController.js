const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

// Controlador para manejar el login
const login = (req, res) => {
    const { username, password } = req.body;

    // Busca al usuario en la base de datos por nombre de usuario
    userModel.getUserByUsername(username, (error, user) => {
        if (error) {
            console.error('Error en la consulta de la base de datos:', error);
            return res.status(500).send('Error en el servidor');
        }

        // Si el usuario no se encuentra
        if (!user) {
            return res.status(401).send('Usuario no encontrado');
        }

        // Compara la contraseña proporcionada con la almacenada
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).send('Error en el servidor');
            }

            // Si la contraseña no coincide
            if (!isMatch) {
                return res.status(401).send('Contraseña incorrecta');
            }

            // Establece la sesión del usuario
            req.session.user = user;
            return res.send('Login exitoso');
        });
    });
};

const logout = (req, res) => {
    // Verificamos si la sesión existe
    if (!req.session) {
        return res.status(400).send('No hay sesión activa');
    }

    // Destruir la sesión
    req.session.destroy(err => {
        if (err) {
            console.error('Error al destruir la sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }

        // Limpiar la cookie de sesión
        res.clearCookie('connect.sid'); // Asegúrate de que 'connect.sid' es el nombre correcto para la cookie de sesión
        
        // Redirigir al login después de cerrar la sesión
        return res.redirect('/');
    });
};


module.exports = { login, logout };

