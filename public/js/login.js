document.addEventListener('DOMContentLoaded', function() {
    // Función para mostrar mensajes al usuario
    function showMessage(message, isError = false) {
        alert(message); // Por ahora usamos alert, podemos cambiarlo por algo más elegante después
    }

    // Función para validar el formulario
    function validateForm(username, password) {
        if (!username || !password) {
            showMessage('Por favor complete todos los campos', true);
            return false;
        }
        return true;
    }

    // Manejar el envío del formulario
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                    // Cambiamos la redirección para usar la ruta de React
                    window.location.href = '/dashboard'; // Esta ruta la definiremos en app.js
                } else {
                    alert(data.message || 'Credenciales inválidas');
                }
            } catch (error) {
                console.error('Error en el login:', error);
                alert('Error al intentar iniciar sesión');
            }
        });
    }

    // Función para verificar si el usuario está autenticado
    async function checkAuth() {
        try {
            const response = await fetch('/auth/check-session');
            const data = await response.json();

            if (!data.loggedIn) {
                window.location.href = '/login';
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            window.location.href = '/login';
            return false;
        }
    }

    // Función para cerrar sesión
    async function logout() {
        try {
            const response = await fetch('/auth/logout');
            const data = await response.json();

            if (data.success) {
                sessionStorage.removeItem('user');
                window.location.href = '/login';
            } else {
                showMessage('Error al cerrar sesión', true);
            }
        } catch (error) {
            console.error('Error en logout:', error);
            showMessage('Error al cerrar sesión', true);
        }
    }

    // Si existe un botón de logout en la página, agregar el event listener
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    // Verificar autenticación si no estamos en la página de login
    if (!window.location.pathname.includes('login')) {
        checkAuth();
    }

    // Exportar funciones para uso global si es necesario
    window.checkAuth = checkAuth;
    window.logout = logout;
});