document.addEventListener('DOMContentLoaded', function() {
    checkActiveSession();
});

window.addEventListener('roomsUpdated', function() {
    // Si hay un usuario logueado, actualizar su vista de salas
    if (currentUser && document.getElementById('user-panel').style.display === 'block') {
        loadUserRooms();
    }
});
// Escuchar cambios en localStorage (para navegadores sin soporte a BroadcastChannel)
window.addEventListener('storage', function(e) {
    if (e.key === 'users' || e.key === 'rooms' || e.key === 'lastUpdate') {
        if (document.getElementById('admin-panel').style.display === 'block') {
            updateRoomsList();
            updateUsersList();
        }
        if (document.getElementById('database-section').style.display === 'block') {
            updateDatabaseView();
        }
        if (document.getElementById('user-panel').style.display === 'block') {
            loadUserRooms();
        }
    }
});

// Inicializar BroadcastChannel para comunicación entre pestañas y navegadores
document.addEventListener('DOMContentLoaded', function() {
    if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('system_updates');
        bc.onmessage = function(event) {
            if (event.data.type === 'data_update') {
                if (document.getElementById('admin-panel').style.display === 'block') {
                    updateRoomsList();
                    updateUsersList();
                }
                if (document.getElementById('database-section').style.display === 'block') {
                    updateDatabaseView();
                }
                if (document.getElementById('user-panel').style.display === 'block') {
                    loadUserRooms();
                }
            }
        };
    }
    
    checkActiveSession();
});
// Inicialización de base de datos local usando localStorage
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}
if (!localStorage.getItem('rooms')) {
    localStorage.setItem('rooms', JSON.stringify([]));
}

// Definir el usuario administrador (puedes cambiar estas credenciales)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Variables para la eliminación
let elementToDeleteId = null;
let deleteType = null;
let currentUser = null;

function checkActiveSession() {
    // Primero comprobar si hay una sesión local en esta pestaña
    const userSession = sessionStorage.getItem('currentUserSession');
    
    if (userSession) {
        // Recuperar datos del usuario
        currentUser = JSON.parse(userSession);
        
        // Mostrar el panel de usuario
        document.getElementById('main-options').classList.add('hidden');
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('admin-login-form').classList.add('hidden');
        document.getElementById('user-panel').style.display = 'block';
        
        // Mostrar el nombre de usuario
        document.getElementById('username-display').textContent = currentUser.username;
        
        // Cargar las salas disponibles
        loadUserRooms();
        
        return;
    }
    
    // Verificar si hay una sesión de administrador activa
    const adminSession = sessionStorage.getItem('adminSession');
    
    if (adminSession === 'true') {
        // Mostrar el panel de administrador
        document.getElementById('main-options').classList.add('hidden');
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('admin-login-form').classList.add('hidden');
        document.getElementById('admin-panel').style.display = 'block';
        
        // Actualizar la lista de salas
        updateRoomsList();
        
        return;
    }
    
    // Si no hay sesiones activas, mostrar las opciones principales
    showMainOptions();
}
// Funciones para mostrar/ocultar formularios
function showMainOptions() {
    document.getElementById('main-options').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('admin-login-form').classList.add('hidden');
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('user-panel').style.display = 'none';
    document.getElementById('database-section').style.display = 'none';
}

function showLoginForm() {
    document.getElementById('main-options').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('admin-login-form').classList.add('hidden');
}

function showRegisterForm() {
    document.getElementById('main-options').classList.add('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('admin-login-form').classList.add('hidden');
}

function showAdminLoginForm() {
    document.getElementById('main-options').classList.add('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('admin-login-form').classList.remove('hidden');
}

function showDatabase() {
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('database-section').style.display = 'block';
    updateDatabaseView();
}

function closeDatabase() {
    document.getElementById('database-section').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
}

// Funciones para el panel de administrador
function showUsersList() {
    document.getElementById('users-list-section').classList.remove('hidden');
    document.getElementById('rooms-list-section').classList.add('hidden');
    
    // Actualizar la lista de usuarios
    updateUsersList();
}

function showRoomsList() {
    document.getElementById('users-list-section').classList.add('hidden');
    document.getElementById('rooms-list-section').classList.remove('hidden');
    
    // Actualizar la lista de salas
    updateRoomsList();
}

// Funciones para Modal
function openCreateRoomModal() {
    document.getElementById('create-room-modal').style.display = 'block';
}

function closeCreateRoomModal() {
    document.getElementById('create-room-modal').style.display = 'none';
    document.getElementById('room-name').value = '';
}

// Función para mostrar notificaciones
function showNotification(message, color = '#2ecc71') {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    notification.style.backgroundColor = color;
    notification.style.display = 'block';
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Funciones de registro e inicio de sesión
function registerUser() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const email = document.getElementById('register-email').value;
    
    if (!username || !password || !email) {
        showNotification('Por favor, completa todos los campos.', '#e74c3c');
        return;
    }
    
    // Obtener usuarios actuales
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Verificar si el usuario ya existe
    if (users.some(user => user.username === username)) {
        showNotification('Este nombre de usuario ya está en uso.', '#e74c3c');
        return;
    }
    
    // Agregar nuevo usuario
    const newUser = {
        id: users.length + 1,
        username: username,
        password: password,
        email: email
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Establecer el usuario actual
    currentUser = newUser;
    
    // Guardar sesión en sessionStorage (solo para esta pestaña)
    sessionStorage.setItem('currentUserSession', JSON.stringify(newUser));
    
    // Mostrar el panel de usuario
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('user-panel').style.display = 'block';
    
    // Mostrar el nombre de usuario
    document.getElementById('username-display').textContent = username;
    
    // Cargar las salas disponibles
    loadUserRooms();
    
    showNotification('Usuario registrado exitosamente. ¡Bienvenido!');
    document.getElementById('register-form').reset();
    
    // Dispara evento para sincronizar datos entre pestañas
    dispatchStorageUpdateEvent();
}

function loginUser() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showNotification('Por favor, completa todos los campos.', '#e74c3c');
        return;
    }
    
    // Obtener usuarios
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Verificar credenciales
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Guardar el usuario actual
        currentUser = user;
        
        // Guardar sesión en sessionStorage (solo para esta pestaña)
        sessionStorage.setItem('currentUserSession', JSON.stringify(user));
        
        // Mostrar el panel de usuario
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('user-panel').style.display = 'block';
        
        // Mostrar el nombre de usuario
        document.getElementById('username-display').textContent = username;
        
        // Cargar las salas disponibles
        loadUserRooms();
        
        showNotification(`Bienvenido, ${username}!`);
        document.getElementById('login-form').reset();
    } else {
        showNotification('Usuario o contraseña incorrectos.', '#e74c3c');
    }
}
function logoutUser() {
    // Limpiar el usuario actual
    currentUser = null;
    
    // Eliminar la sesión de sessionStorage
    sessionStorage.removeItem('currentUserSession');
    
    // Ocultar el panel de usuario
    document.getElementById('user-panel').style.display = 'none';
    
    // Mostrar opciones principales
    showMainOptions();
    
    showNotification('Has cerrado sesión exitosamente.');
}

function loadUserRooms() {
    // Obtener las salas desde localStorage
    const rooms = JSON.parse(localStorage.getItem('rooms'));
    const roomsGrid = document.getElementById('rooms-grid');
    
    // Limpiar el contenedor
    roomsGrid.innerHTML = '';
    
    if (rooms.length === 0) {
        roomsGrid.innerHTML = '<p class="no-rooms">No hay salas disponibles en este momento.</p>';
        return;
    }
    
    // Crear una tarjeta para cada sala
    rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        roomCard.innerHTML = `
            <h3>${room.name}</h3>
            <p>Sala #${room.id}</p>
            <button class="join-button" onclick="joinRoom(${room.id})">Unirse</button>
        `;
        roomsGrid.appendChild(roomCard);
    });
}
function joinRoom(roomId) {
    // Obtener la sala
    const rooms = JSON.parse(localStorage.getItem('rooms'));
    const room = rooms.find(r => r.id === roomId);
    
    if (room) {
        showNotification(`Te has unido a la sala: ${room.name}`);
        // Aquí podrías implementar la lógica para entrar a la sala
        // Por ahora, solo mostramos una notificación
    } else {
        showNotification('No se pudo encontrar la sala.', '#e74c3c');
    }
}

function loginAdmin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Guardar sesión de administrador en sessionStorage (solo para esta pestaña)
        sessionStorage.setItem('adminSession', 'true');
        
        document.getElementById('main-options').classList.add('hidden');
        document.getElementById('admin-login-form').classList.add('hidden');
        document.getElementById('admin-panel').style.display = 'block';
        
        // Actualizar la lista de salas
        updateRoomsList();
        showNotification('Bienvenido, Administrador!');
    } else {
        showNotification('Credenciales de administrador incorrectas.', '#e74c3c');
    }
}


function logoutAdmin() {
    // Eliminar la sesión de administrador
    sessionStorage.removeItem('adminSession');
    
    document.getElementById('admin-panel').style.display = 'none';
    showMainOptions();
    showNotification('Has cerrado sesión como administrador.');
}

// Funciones para gestionar salas
function createRoom() {
    const roomName = document.getElementById('room-name').value;
    
    if (!roomName) {
        showNotification('Por favor, ingresa un nombre para la sala.', '#e74c3c');
        return;
    }
    
    // Obtener salas actuales
    const rooms = JSON.parse(localStorage.getItem('rooms'));
    
    // Agregar nueva sala
    const newRoom = {
        id: rooms.length + 1,
        name: roomName
    };
    
    rooms.push(newRoom);
    localStorage.setItem('rooms', JSON.stringify(rooms));
    
    // Dispara un evento personalizado para notificar a los usuarios
    const event = new CustomEvent('roomsUpdated');
    window.dispatchEvent(event);
    
    showNotification('Sala creada exitosamente.');
    
    // Cerrar modal
    closeCreateRoomModal();
    
    // Mostrar la lista de salas actualizada
    showRoomsList();
    
    // Notificar a otras pestañas/navegadores
    dispatchStorageUpdateEvent();
}

function dispatchStorageUpdateEvent() {
    // Para navegadores modernos - usar BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('system_updates');
        bc.postMessage({ type: 'data_update' });
    } else {
        // Fallback para navegadores que no soportan BroadcastChannel
        localStorage.setItem('lastUpdate', Date.now().toString());
    }
}

// Funciones para actualizar listas
function updateUsersList() {
    const users = JSON.parse(localStorage.getItem('users'));
    const tableBody = document.getElementById('users-table-body');
    
    tableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><button class="delete-button" onclick="confirmDelete(${user.id}, 'user')">Eliminar</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function updateRoomsList() {
    const rooms = JSON.parse(localStorage.getItem('rooms'));
    const tableBody = document.getElementById('rooms-table-body');
    
    tableBody.innerHTML = '';
    
    rooms.forEach(room => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.id}</td>
            <td>${room.name}</td>
            <td>
                <button class="edit-button" onclick="openEditRoomModal(${room.id})">Editar</button>
                <button class="delete-button" onclick="confirmDelete(${room.id}, 'room')">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateDatabaseView() {
    const users = JSON.parse(localStorage.getItem('users'));
    const rooms = JSON.parse(localStorage.getItem('rooms'));
    
    const usersTableBody = document.getElementById('database-users').querySelector('tbody');
    const roomsTableBody = document.getElementById('database-rooms').querySelector('tbody');
    
    usersTableBody.innerHTML = '';
    roomsTableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.password}</td>
            <td><button class="delete-button" onclick="confirmDelete(${user.id}, 'user')">Eliminar</button></td>
        `;
        usersTableBody.appendChild(row);
    });
    
    rooms.forEach(room => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.id}</td>
            <td>${room.name}</td>
            <td>
                <button class="edit-button" onclick="openEditRoomModal(${room.id})">Editar</button>
                <button class="delete-button" onclick="confirmDelete(${room.id}, 'room')">Eliminar</button>
            </td>
        `;
        roomsTableBody.appendChild(row);
    });
}

// Funciones para eliminar elementos
function confirmDelete(id, type) {
    elementToDeleteId = id;
    deleteType = type;
    
    const message = type === 'user' 
        ? `¿Estás seguro de que quieres eliminar este usuario?` 
        : `¿Estás seguro de que quieres eliminar esta sala?`;
        
    document.getElementById('confirm-message').textContent = message;
    
    // Configurar botones
    document.getElementById('confirm-yes-btn').onclick = function() {
        deleteElement();
        closeConfirmModal();
    };
    
    document.getElementById('confirm-no-btn').onclick = closeConfirmModal;
    
    // Mostrar modal
    document.getElementById('confirm-modal').style.display = 'block';
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').style.display = 'none';
}

function deleteElement() {
    if (deleteType === 'user') {
        deleteUser(elementToDeleteId);
    } else if (deleteType === 'room') {
        deleteRoom(elementToDeleteId);
    }
    
    // Limpiar variables
    elementToDeleteId = null;
    deleteType = null;
}

function deleteUser(userId) {
    let users = JSON.parse(localStorage.getItem('users'));
    
    // Filtrar para eliminar el usuario
    users = users.filter(user => user.id !== userId);
    
    // Actualizar IDs si es necesario
    users = users.map((user, index) => {
        return {...user, id: index + 1};
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    showNotification('Usuario eliminado exitosamente.');
    
    // Actualizar vistas
    updateUsersList();
    if (document.getElementById('database-section').style.display === 'block') {
        updateDatabaseView();
    }
    
    // Notificar a otras pestañas/navegadores
    dispatchStorageUpdateEvent();
}

function deleteRoom(roomId) {
    let rooms = JSON.parse(localStorage.getItem('rooms'));
    
    // Filtrar para eliminar la sala
    rooms = rooms.filter(room => room.id !== roomId);
    
    // Actualizar IDs si es necesario
    rooms = rooms.map((room, index) => {
        return {...room, id: index + 1};
    });
    
    localStorage.setItem('rooms', JSON.stringify(rooms));
    showNotification('Sala eliminada exitosamente.');
    
    // Actualizar vistas
    updateRoomsList();
    if (document.getElementById('database-section').style.display === 'block') {
        updateDatabaseView();
    }
    
    // Notificar a otras pestañas/navegadores
    const event = new CustomEvent('roomsUpdated');
    window.dispatchEvent(event);
    
    // Notificar a otras pestañas/navegadores
    dispatchStorageUpdateEvent();
}
function openEditRoomModal(roomId) {
    // Obtener salas
    const rooms = JSON.parse(localStorage.getItem('rooms'));
    
    // Encontrar la sala con el ID proporcionado
    const roomToEdit = rooms.find(room => room.id === roomId);
    
    if (roomToEdit) {
        // Llenar el formulario con los datos actuales
        document.getElementById('edit-room-name').value = roomToEdit.name;
        document.getElementById('edit-room-id').value = roomId;
        
        // Mostrar el modal
        document.getElementById('edit-room-modal').style.display = 'block';
    } else {
        showNotification('No se pudo encontrar la sala.', '#e74c3c');
    }
}

function closeEditRoomModal() {
    document.getElementById('edit-room-modal').style.display = 'none';
}

function updateRoom() {
    const roomId = parseInt(document.getElementById('edit-room-id').value);
    const newName = document.getElementById('edit-room-name').value;
    
    if (!newName) {
        showNotification('Por favor, ingresa un nombre para la sala.', '#e74c3c');
        return;
    }
    
    // Obtener salas actuales
    let rooms = JSON.parse(localStorage.getItem('rooms'));
    
    // Encontrar y actualizar la sala
    rooms = rooms.map(room => {
        if (room.id === roomId) {
            return { ...room, name: newName };
        }
        return room;
    });
    
    // Guardar cambios
    localStorage.setItem('rooms', JSON.stringify(rooms));
    
    // Dispara un evento personalizado para notificar a los usuarios
    const event = new CustomEvent('roomsUpdated');
    window.dispatchEvent(event);
    
    showNotification('Sala actualizada exitosamente.');
    
    // Cerrar modal
    closeEditRoomModal();
    
    // Actualizar vistas
    updateRoomsList();
    if (document.getElementById('database-section').style.display === 'block') {
        updateDatabaseView();
    }
    
    // Notificar a otras pestañas/navegadores
    dispatchStorageUpdateEvent();
}