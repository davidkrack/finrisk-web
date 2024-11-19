const db = require('../db');
const bcrypt = require('bcrypt');

exports.loginUser = (req, res) => {
    const { username, password } = req.body;
    
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error en la consulta de la base de datos:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length > 0) {
            const user = results[0];

            bcrypt.compare(password, user.password, (err, match) => {
                if (err) {
                    console.error('Error al comparar las contraseñas:', err);
                    return res.status(500).send('Error en el servidor');
                }

                if (match) {
                    req.session.userId = user.id;
                    res.redirect('/pension/calculo-pension');
                } else {
                    res.send('Usuario o contraseña incorrectos');
                }
            });
        } else {
            res.send('Usuario o contraseña incorrectos');
        }
    });
};


