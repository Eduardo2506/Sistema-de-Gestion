// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyASxBDyn6JVYB9_20GnHeao3ewQAtd92-s",
    authDomain: "sistema-de-gestion-7ccea.firebaseapp.com",
    databaseURL: "https://sistema-de-gestion-7ccea-default-rtdb.firebaseio.com",
    projectId: "sistema-de-gestion-7ccea",
    storageBucket: "sistema-de-gestion-7ccea.firebasestorage.app",
    messagingSenderId: "725758100631",
    appId: "1:725758100631:web:de3a56543791ac789995d2",
    measurementId: "G-HGQB5P6Z9M"
  };
  
  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  const auth = firebase.auth();
  
  // Variables globales
  let elementToDeleteId = null;
  let deleteType = null;
  let currentUser = null;
  
  // Definir el usuario administrador (puedes cambiar estas credenciales)
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';
  
  // Inicialización de evento DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
      checkActiveSession();
      
      // Inicializar la base de datos si está vacía
      initializeDatabase();
  });
  
  // Función para inicializar la base de datos
  async function initializeDatabase() {
      const usersSnapshot = await database.ref('users').once('value');
      if (!usersSnapshot.exists()) {
          database.ref('users').set([]);
      }
      
      const roomsSnapshot = await database.ref('rooms').once('value');
      if (!roomsSnapshot.exists()) {
          database.ref('rooms').set([]);
      }
  }
 // Escuchar cambios en el estado de autenticación
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        // Usuario está autenticado
        console.log("Usuario autenticado:", user.email);
        
        // Si el correo no está verificado y estamos en la vista principal
        if (!user.emailVerified && document.getElementById('main-options').classList.contains('visible')) {
            showVerificationForm(user.email);
        }
    } else {
        // Usuario no está autenticado
        console.log("Usuario no autenticado");
    }
}); 
  // Escuchar cambios en la base de datos
  database.ref().on('value', (snapshot) => {
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
  });
  
  // Función para obtener usuarios
  async function getUsers() {
      const snapshot = await database.ref('users').once('value');
      const data = snapshot.val() || [];
      return Array.isArray(data) ? data : Object.values(data);
  }
  
  // Función para guardar usuarios
  function saveUsers(users) {
      return database.ref('users').set(users);
  }
  
  // Función para obtener salas
  async function getRooms() {
      const snapshot = await database.ref('rooms').once('value');
      const data = snapshot.val() || [];
      return Array.isArray(data) ? data : Object.values(data);
  }
  
  // Función para guardar salas
  function saveRooms(rooms) {
      return database.ref('rooms').set(rooms);
  }
  
  // Verificación de sesión activa
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
  async function registerUser() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const email = document.getElementById('register-email').value;
    
    if (!username || !password || !email) {
        showNotification('Por favor, completa todos los campos.', '#e74c3c');
        return;
    }
    
    try {
        // Crear el usuario en Firebase Authentication
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;
        
        // Enviar correo de verificación
        await firebaseUser.sendEmailVerification();
        
        // Guardar información adicional del usuario en la base de datos
        const users = await getUsers();
        const newUser = {
            id: users.length + 1,
            username: username,
            password: password, // Nota: en producción, considera no almacenar contraseñas en texto plano
            email: email,
            uid: firebaseUser.uid, // Guardar el UID de Firebase Authentication
            emailVerified: false // Marcar como no verificado inicialmente
        };
        
        users.push(newUser);
        await saveUsers(users);
        
        // Mostrar notificación y redirigir al formulario de verificación
        showNotification('Usuario registrado. Por favor verifica tu correo electrónico.');
        showVerificationForm(email);
        
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        showNotification('Error al registrar:  ' + error.message, '#e74c3c');
    }
}
// Función para mostrar el formulario de verificación
function showVerificationForm(email) {
    document.getElementById('verification-email').textContent = email;
    document.getElementById('main-options').classList.add('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('admin-login-form').classList.add('hidden');
    document.getElementById('verification-form').classList.remove('hidden');
    
    // Configurar evento para reenviar correo
    document.getElementById('resend-verification').addEventListener('click', function(event) {
        event.preventDefault();
        resendVerificationEmail();
    });
}
// Función para reenviar correo de verificación
async function resendVerificationEmail() {
    try {
        const user = firebase.auth().currentUser;
        if (user) {
            await user.sendEmailVerification();
            showNotification('Correo de verificación reenviado.');
        } else {
            showNotification('Debes iniciar sesión para reenviar el correo.', '#e74c3c');
        }
    } catch (error) {
        console.error("Error al reenviar verificación:", error);
        showNotification('Error al reenviar: ' + error.message, '#e74c3c');
    }
}
// Función para verificar si el correo ha sido verificado
async function checkVerification() {
    try {
        // Recargar el usuario para obtener el estado actualizado
        await firebase.auth().currentUser.reload();
        const user = firebase.auth().currentUser;
        
        if (user && user.emailVerified) {
            // Actualizar el estado en la base de datos
            const users = await getUsers();
            const updatedUsers = users.map(u => {
                if (u.email === user.email) {
                    return {...u, emailVerified: true};
                }
                return u;
            });
            
            await saveUsers(updatedUsers);
            
            // Buscar y establecer el usuario actual
            const currentUserData = updatedUsers.find(u => u.email === user.email);
            currentUser = currentUserData;
            
            // Guardar sesión
            sessionStorage.setItem('currentUserSession', JSON.stringify(currentUserData));
            
            // Mostrar el panel de usuario
            document.getElementById('verification-form').classList.add('hidden');
            document.getElementById('user-panel').style.display = 'block';
            
            // Mostrar el nombre de usuario
            document.getElementById('username-display').textContent = currentUserData.username;
            
            // Cargar las salas disponibles
            loadUserRooms();
            
            showNotification('¡Correo verificado correctamente! Bienvenido.');
        } else {
            showNotification('Tu correo aún no ha sido verificado. Por favor verifica tu bandeja de entrada.', '#e74c3c');
        }
    } catch (error) {
        console.error("Error al verificar email:", error);
        showNotification('Error al verificar: ' + error.message, '#e74c3c');
    }
}  
async function loginUser() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showNotification('Por favor, completa todos los campos.', '#e74c3c');
        return;
    }
    
    try {
        // Obtener usuarios
        const users = await getUsers();
        
        // Buscar el usuario por nombre de usuario
        const user = users.find(u => u.username === username);
        
        if (!user) {
            showNotification('Usuario no encontrado.', '#e74c3c');
            return;
        }
        
        // Iniciar sesión con Firebase Authentication usando el email
        const userCredential = await firebase.auth().signInWithEmailAndPassword(user.email, password);
        const firebaseUser = userCredential.user;
        
        // Verificar si el correo está verificado
        if (!firebaseUser.emailVerified) {
            // Mostrar formulario de verificación
            showNotification('Debes verificar tu correo electrónico antes de iniciar sesión.', '#e74c3c');
            showVerificationForm(user.email);
            return;
        }
        
        // Si está verificado, proceder con el inicio de sesión
        currentUser = user;
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
        
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        showNotification('Usuario o contraseña incorrectos.', '#e74c3c');
    }
}
  
function logoutUser() {
    // Cerrar sesión en Firebase Authentication
    firebase.auth().signOut().then(() => {
        // Limpiar el usuario actual
        currentUser = null;
        
        // Eliminar la sesión de sessionStorage
        sessionStorage.removeItem('currentUserSession');
        
        // Ocultar el panel de usuario
        document.getElementById('user-panel').style.display = 'none';
        
        // Mostrar opciones principales
        showMainOptions();
        
        showNotification('Has cerrado sesión exitosamente.');
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
        showNotification('Error al cerrar sesión: ' + error.message, '#e74c3c');
    });
}
  
  async function loadUserRooms() {
      // Obtener las salas desde Firebase
      const rooms = await getRooms();
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
  
  async function joinRoom(roomId) {
      // Obtener la sala
      const rooms = await getRooms();
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
  async function createRoom() {
      const roomName = document.getElementById('room-name').value;
      
      if (!roomName) {
          showNotification('Por favor, ingresa un nombre para la sala.', '#e74c3c');
          return;
      }
      
      // Obtener salas actuales
      const rooms = await getRooms();
      
      // Agregar nueva sala
      const newRoom = {
          id: rooms.length + 1,
          name: roomName
      };
      
      rooms.push(newRoom);
      await saveRooms(rooms);
      
      showNotification('Sala creada exitosamente.');
      
      // Cerrar modal
      closeCreateRoomModal();
      
      // Mostrar la lista de salas actualizada
      showRoomsList();
  }
  
  // Funciones para actualizar listas
  async function updateUsersList() {
      const users = await getUsers();
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
  
  async function updateRoomsList() {
      const rooms = await getRooms();
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
  
  async function updateDatabaseView() {
      const users = await getUsers();
      const rooms = await getRooms();
      
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
  
  async function deleteUser(userId) {
      let users = await getUsers();
      
      // Filtrar para eliminar el usuario
      users = users.filter(user => user.id !== userId);
      
      // Actualizar IDs si es necesario
      users = users.map((user, index) => {
          return {...user, id: index + 1};
      });
      
      await saveUsers(users);
      showNotification('Usuario eliminado exitosamente.');
  }
  
  async function deleteRoom(roomId) {
      let rooms = await getRooms();
      
      // Filtrar para eliminar la sala
      rooms = rooms.filter(room => room.id !== roomId);
      
      // Actualizar IDs si es necesario
      rooms = rooms.map((room, index) => {
          return {...room, id: index + 1};
      });
      
      await saveRooms(rooms);
      showNotification('Sala eliminada exitosamente.');
  }
  
  async function openEditRoomModal(roomId) {
      // Obtener salas
      const rooms = await getRooms();
      
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
  
  async function updateRoom() {
      const roomId = parseInt(document.getElementById('edit-room-id').value);
      const newName = document.getElementById('edit-room-name').value;
      
      if (!newName) {
          showNotification('Por favor, ingresa un nombre para la sala.', '#e74c3c');
          return;
      }
      
      // Obtener salas actuales
      let rooms = await getRooms();
      
      // Encontrar y actualizar la sala
      rooms = rooms.map(room => {
          if (room.id === roomId) {
              return { ...room, name: newName };
          }
          return room;
      });
      
      // Guardar cambios
      await saveRooms(rooms);
      
      showNotification('Sala actualizada exitosamente.');
      
      // Cerrar modal
      closeEditRoomModal();
  }