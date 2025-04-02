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
  
  function setupRoomListeners() {
    database.ref('rooms').on('value', (snapshot) => {
        const rooms = snapshot.val() || [];
        
        // Verificar si la sala actual ha cambiado
        if (currentRoom) {
            const updatedRoom = Array.isArray(rooms) ? 
                rooms.find(r => r.id === currentRoom.id) : 
                Object.values(rooms).find(r => r.id === currentRoom.id);
                
            if (updatedRoom) {
                // Notificar si el monto máximo ha cambiado
                if (updatedRoom.maxBetAmount !== currentRoom.maxBetAmount) {
                    showNotification(`¡Atención! El monto máximo de apuesta para esta sala ha cambiado a S/.${updatedRoom.maxBetAmount}`, '#f39c12');
                }
                
                // Notificar si el estado de apuestas ha cambiado
                if (updatedRoom.bettingStatus !== currentRoom.bettingStatus) {
                    let statusMessage = '';
                    switch(updatedRoom.bettingStatus) {
                        case 'both': statusMessage = 'Apuestas abiertas para ambos equipos'; break;
                        case 'radiant': statusMessage = 'Apuestas abiertas solo para Radiant'; break;
                        case 'dire': statusMessage = 'Apuestas abiertas solo para Dire'; break;
                        case 'none': statusMessage = 'Apuestas cerradas para ambos equipos'; break;
                    }
                    showNotification(`¡Atención! Estado de apuestas actualizado: ${statusMessage}`, '#f39c12');
                }
                
                currentRoom = updatedRoom;
            }
        }
    });
}

// Llama a esta función al inicio
document.addEventListener('DOMContentLoaded', function() {
    // ... (tu código existente)
    setupRoomListeners();
});
  const database = firebase.database();
  const auth = firebase.auth();
  
  // Variables globales
  let elementToDeleteId = null;
  let deleteType = null;
  let currentUser = null;
  let selectedTeam = null;
  let currentRoom = null;

  let currentBetAmount = 0;
  let currentBetTeam = '';
  
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
      const betsSnapshot = await database.ref('bets').once('value');
      if (!betsSnapshot.exists()) {
          database.ref('bets').set({});
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
        
        // Verificar si estaba viendo la base de datos
        const lastView = sessionStorage.getItem('adminView');
        if (lastView === 'database') {
            showDatabase();
        } else {
            document.getElementById('admin-panel').style.display = 'block';
            if (lastView === 'users') {
                showUsersList();
            } else {
                showRoomsList();
            }
        }
        
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
    
    // Guardar el estado en sessionStorage
    sessionStorage.setItem('adminView', 'database');
    
    updateDatabaseView();
}
  
function closeDatabase() {
    document.getElementById('database-section').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    
    // Restaurar la vista anterior de admin
    const lastView = sessionStorage.getItem('adminView') || 'rooms';
    if (lastView === 'users') {
        showUsersList();
    } else {
        showRoomsList();
    }
}
  
  // Funciones para el panel de administrador
  function showUsersList() {
    document.getElementById('users-list-section').classList.remove('hidden');
    document.getElementById('rooms-list-section').classList.add('hidden');
    
    // Guardar el estado en sessionStorage
    sessionStorage.setItem('adminView', 'users');
    
    updateUsersList();
}
function showRoomsList() {
    document.getElementById('users-list-section').classList.add('hidden');
    document.getElementById('rooms-list-section').classList.remove('hidden');
    
    // Guardar el estado en sessionStorage
    sessionStorage.setItem('adminView', 'rooms');
    
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
            <p class="max-bet-info">Apuesta máxima: S/.${room.maxBetAmount || 'No definido'}</p>
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
        // Guardar la sala actual
        currentRoom = room;
        
        // Configurar el modal de apuesta
        document.getElementById('bet-room-name').textContent = room.name;
        document.getElementById('bet-room-id').textContent = `Sala #${room.id}`;
        
        // Establecer el valor máximo en el campo de apuesta
        const betAmountInput = document.getElementById('bet-amount');
        betAmountInput.max = room.maxBetAmount;
        betAmountInput.placeholder = `Máximo: S/.${room.maxBetAmount}`;
        
        // Resetear la selección
        selectedTeam = null;
        
        // Obtener botones de equipo
        const radiantBtn = document.getElementById('radiant-btn');
        const direBtn = document.getElementById('dire-btn');
        
        // Configurar visibilidad según el estado de apuestas
        switch(room.bettingStatus) {
            case 'both':
                radiantBtn.style.display = 'block';
                direBtn.style.display = 'block';
                break;
            case 'radiant':
                radiantBtn.style.display = 'block';
                direBtn.style.display = 'none';
                break;
            case 'dire':
                radiantBtn.style.display = 'none';
                direBtn.style.display = 'block';
                break;
            case 'none':
                radiantBtn.style.display = 'none';
                direBtn.style.display = 'none';
                document.getElementById('bet-modal').querySelector('.submit-button').disabled = true;
                break;
        }
        
        // Mostrar el modal
        document.getElementById('bet-modal').style.display = 'block';
    } else {
        showNotification('No se pudo encontrar la sala.', '#e74c3c');
    }
}
// Función para cerrar el modal de apuesta
function closeBetModal() {
    document.getElementById('bet-modal').style.display = 'none';
}
// Función para seleccionar equipo
function selectTeam(team) {
    selectedTeam = team;
    
    // Actualizar UI
    if (team === 'radiant') {
        document.getElementById('radiant-btn').classList.add('selected');
        document.getElementById('dire-btn').classList.remove('selected');
    } else {
        document.getElementById('radiant-btn').classList.remove('selected');
        document.getElementById('dire-btn').classList.add('selected');
    }
}
// Función para realizar la apuesta
async function placeBet() {
    // Validar selección
    if (!selectedTeam) {
        showNotification('Por favor, selecciona un equipo.', '#e74c3c');
        return;
    }
    
    // Validar monto
    const amount = parseFloat(document.getElementById('bet-amount').value);
    if (!amount || amount <= 0) {
        showNotification('Por favor, ingresa un monto válido.', '#e74c3c');
        return;
    }
    
    // Validar que no exceda el monto máximo
    if (amount > currentRoom.maxBetAmount) {
        showNotification(`La apuesta no puede exceder S/.${currentRoom.maxBetAmount}.`, '#e74c3c');
        return;
    }
    
    // Guardar los datos de la apuesta temporalmente
    currentBetAmount = amount;
    currentBetTeam = selectedTeam;
    
    // Mostrar modal de Yape
    document.getElementById('yape-amount').textContent = `S/.${amount.toFixed(2)}`;
    document.getElementById('yape-code').value = '';
    document.getElementById('payment-status').className = 'payment-status hidden';
    document.getElementById('bet-modal').style.display = 'none';
    document.getElementById('yape-modal').style.display = 'block';
}

function closeYapeModal() {
    document.getElementById('yape-modal').style.display = 'none';
    document.getElementById('bet-modal').style.display = 'block';
}

async function verifyYapePayment() {
    const yapeCode = document.getElementById('yape-code').value.trim();
    
    if (!yapeCode || yapeCode.length !== 3 || !/^\d+$/.test(yapeCode)) {
        showNotification('Por favor, ingresa un código de 3 dígitos válido.', '#e74c3c');
        return;
    }
    
    const statusElement = document.getElementById('payment-status');
    statusElement.textContent = 'Verificando pago...';
    statusElement.className = 'payment-status pending';
    
    try {
        // Aquí normalmente harías una verificación con tu backend
        // Pero como es verificación manual, marcamos como pendiente
        
        const betData = {
            userId: currentUser.id,
            userName: currentUser.username,
            roomId: currentRoom.id,
            roomName: currentRoom.name,
            team: currentBetTeam,
            amount: currentBetAmount,
            yapeCode: yapeCode,
            status: 'pending', // pending, verified, rejected
            timestamp: Date.now(),
            verifiedBy: null,
            verificationDate: null
        };
        
        // Guardar la apuesta en la base de datos
        const betRef = database.ref('bets').push();
        await betRef.set(betData);
        
        statusElement.textContent = 'Pago recibido. Esperando verificación del administrador.';
        statusElement.className = 'payment-status pending';
        
        showNotification('Apuesta registrada. Espera la verificación del administrador.');
        
        // Cerrar modales después de 3 segundos
        setTimeout(() => {
            closeYapeModal();
            closeBetModal();
        }, 3000);
        
    } catch (error) {
        console.error("Error al registrar apuesta:", error);
        statusElement.textContent = 'Error al registrar la apuesta. Intenta nuevamente.';
        statusElement.className = 'payment-status error';
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
    const maxBetAmount = parseFloat(document.getElementById('max-bet-amount').value);
    
    if (!roomName) {
        showNotification('Por favor, ingresa un nombre para la sala.', '#e74c3c');
        return;
    }
    
    if (!maxBetAmount || maxBetAmount <= 0) {
        showNotification('Por favor, ingresa un monto máximo de apuesta válido.', '#e74c3c');
        return;
    }
    
    // Obtener salas actuales
    const rooms = await getRooms();
    
    // Agregar nueva sala con monto máximo
    const newRoom = {
        id: rooms.length + 1,
        name: roomName,
        maxBetAmount: maxBetAmount,
        bettingStatus: 'both' // 'both', 'radiant', 'dire', 'none'
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
            <td>S/.${room.maxBetAmount || 'No definido'}</td>
            <td>
                <button class="view-button" onclick="viewRoomBets(${room.id})">Entrar</button>
                <button class="edit-button" onclick="openEditRoomModal(${room.id})">Editar</button>
                <button class="delete-button" onclick="confirmDelete(${room.id}, 'room')">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}
async function notifyUser(userId, message) {
    try {
        // Obtener todos los usuarios
        const users = await getUsers();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            console.warn(`Usuario con ID ${userId} no encontrado para notificación`);
            return;
        }
        
        // Aquí podrías implementar diferentes métodos de notificación:
        // - Notificaciones en la interfaz cuando el usuario inicie sesión
        // - Envío de correo electrónico
        // - Notificaciones push, etc.
        
        console.log(`Notificación para usuario ${user.username}: ${message}`);
        
        // Por ahora simplemente mostramos un log
        // En una implementación real, podrías guardar estas notificaciones en la base de datos
        // para mostrarlas cuando el usuario inicie sesión
        
    } catch (error) {
        console.error("Error al notificar usuario:", error);
        // No mostramos notificación al usuario para no interrumpir el flujo principal
    }
}
async function openEditRoomModal(roomId) {
    try {
        const rooms = await getRooms();
        const roomToEdit = rooms.find(room => room.id === roomId);
        
        if (!roomToEdit) {
            showNotification('No se pudo encontrar la sala para editar.', '#e74c3c');
            return;
        }
        
        // Llenar el formulario de edición con los datos de la sala
        document.getElementById('edit-room-id').value = roomToEdit.id;
        document.getElementById('edit-room-name').value = roomToEdit.name;
        document.getElementById('edit-max-bet-amount').value = roomToEdit.maxBetAmount;
        
        // Mostrar el modal
        document.getElementById('edit-room-modal').style.display = 'block';
    } catch (error) {
        console.error("Error al abrir modal de edición:", error);
        showNotification('Error al preparar la edición: ' + error.message, '#e74c3c');
    }
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
            <td>S/.${room.maxBetAmount || 'No definido'}</td>
            <td>
                <button class="view-button" onclick="viewRoomBets(${room.id})">Entrar</button>
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
    try {
        // 1. Obtener todas las salas
        let rooms = await getRooms();
        
        // 2. Filtrar para eliminar la sala
        rooms = rooms.filter(room => room.id !== roomId);
        
        // 3. Actualizar IDs si es necesario
        rooms = rooms.map((room, index) => {
            return {...room, id: index + 1};
        });
        
        // 4. Eliminar todas las apuestas asociadas a esta sala
        const betsSnapshot = await database.ref('bets').once('value');
        const allBets = betsSnapshot.val() || {};
        
        // Buscar y eliminar las apuestas asociadas a esta sala
        const promises = [];
        for (const betId in allBets) {
            const bet = allBets[betId];
            if (bet.roomId === roomId) {
                // Agregar promesa para eliminar cada apuesta
                promises.push(database.ref(`bets/${betId}`).remove());
            }
        }
        
        // Esperar a que todas las eliminaciones de apuestas se completen
        await Promise.all(promises);
        
        // 5. Guardar las salas actualizadas
        await saveRooms(rooms);
        
        showNotification('Sala y todas sus apuestas eliminadas exitosamente.');
    } catch (error) {
        console.error("Error al eliminar sala:", error);
        showNotification('Error al eliminar sala: ' + error.message, '#e74c3c');
    }
}
  
  function closeEditRoomModal() {
      document.getElementById('edit-room-modal').style.display = 'none';
  }
  
  async function updateRoom() {
    const roomId = parseInt(document.getElementById('edit-room-id').value);
    const newName = document.getElementById('edit-room-name').value.trim();
    const newMaxBetAmount = parseFloat(document.getElementById('edit-max-bet-amount').value);
    
    // Validaciones
    if (!newName) {
        showNotification('Por favor, ingresa un nombre para la sala.', '#e74c3c');
        return;
    }
    
    if (!newMaxBetAmount || newMaxBetAmount <= 0) {
        showNotification('Por favor, ingresa un monto máximo de apuesta válido.', '#e74c3c');
        return;
    }
    
    try {
        // Obtener salas actuales
        let rooms = await getRooms();
        
        // Verificar si el ID existe
        const roomExists = rooms.some(room => room.id === roomId);
        if (!roomExists) {
            showNotification('La sala que intentas editar no existe.', '#e74c3c');
            return;
        }
        
        // Actualizar la sala
        rooms = rooms.map(room => {
            if (room.id === roomId) {
                return { 
                    ...room, 
                    name: newName,
                    maxBetAmount: newMaxBetAmount
                };
            }
            return room;
        });
        
        // Guardar cambios
        await saveRooms(rooms);
        
        showNotification('Sala actualizada exitosamente.');
        
        // Cerrar modal y actualizar la vista
        closeEditRoomModal();
        
        // Actualizar la vista según donde estemos
        const currentView = sessionStorage.getItem('adminView');
        if (currentView === 'database') {
            updateDatabaseView();
        } else if (currentView === 'users') {
            updateUsersList();
        } else {
            updateRoomsList();
        }
        
    } catch (error) {
        console.error("Error al actualizar sala:", error);
        showNotification('Error al actualizar sala: ' + error.message, '#e74c3c');
    }
}
// Función para resetear el modal de crear sala
function closeCreateRoomModal() {
    document.getElementById('create-room-modal').style.display = 'none';
    document.getElementById('room-name').value = '';
    document.getElementById('max-bet-amount').value = '';
}

async function viewRoomBets(roomId) {
    try {

        // Limpiar controles existentes primero
        const existingControls = document.querySelector('.betting-controls');
        if (existingControls) {
            existingControls.remove();
        }
        
        // Obtener las salas
        const rooms = await getRooms();
        
        // Encontrar la sala seleccionada
        const selectedRoom = rooms.find(room => room.id === roomId);
        
        if (!selectedRoom) {
            showNotification('No se pudo encontrar la sala.', '#e74c3c');
            return;
        }
        
        // Actualizar el título del panel de apuestas
        document.getElementById('room-bets-title').textContent = `Apuestas para: ${selectedRoom.name} (Sala #${selectedRoom.id})`;
        
        // Obtener todas las apuestas de la base de datos
        const betsSnapshot = await database.ref('bets').once('value');
        const allBets = betsSnapshot.val() || {};
        
        // Filtrar las apuestas para esta sala
        const roomBets = [];
        for (const betId in allBets) {
            const bet = allBets[betId];
            if (bet.roomId === roomId) {
                roomBets.push({
                    id: betId,
                    ...bet
                });
            }
        }
        
        
         // Mostrar las apuestas en la tabla
         const betsTableBody = document.getElementById('room-bets-table').querySelector('tbody');
         betsTableBody.innerHTML = '';
        
        if (roomBets.length === 0) {
            betsTableBody.innerHTML = '<tr><td colspan="8" class="no-bets">No hay apuestas en esta sala.</td></tr>';
        } else {
            roomBets.forEach(bet => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${bet.userId}</td>
                    <td>${bet.userName}</td>
                    <td>S/.${bet.amount.toFixed(2)}</td>
                    <td><span class="team-indicator ${bet.team}">${bet.team === 'radiant' ? 'Radiant' : 'Dire'}</span></td>
                    <td>${new Date(bet.timestamp).toLocaleString()}</td>
                    <td>${bet.yapeCode || 'N/A'}</td>
                    <td>
                        <span class="status-indicator ${bet.status}">
                            ${bet.status === 'verified' ? 'Verificado' : 
                              bet.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </span>
                    </td>
                    <td>
                        ${bet.status === 'pending' ? `
                            <button class="verify-button" onclick="verifyBet('${bet.id}', true, '${bet.userId}')">Aprobar</button>
                            <button class="reject-button" onclick="verifyBet('${bet.id}', false, '${bet.userId}')">Rechazar</button>
                        ` : bet.verifiedBy || 'N/A'}
                    </td>
                `;
                betsTableBody.appendChild(row);
            });
        }
        
        // Mostrar el panel de apuestas
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('database-section').style.display = 'none';
        document.getElementById('room-bets-section').style.display = 'block';

        showBettingControls(roomId); // Mostrar controles de apuestas
        
    } catch (error) {
        console.error("Error al cargar apuestas:", error);
        showNotification('Error al cargar las apuestas: ' + error.message, '#e74c3c');
    }
}
async function verifyBet(betId, isApproved, userId) {
    try {
        // Obtener la apuesta específica
        const betSnapshot = await database.ref(`bets/${betId}`).once('value');
        const bet = betSnapshot.val();
        
        if (!bet) {
            showNotification('No se encontró la apuesta.', '#e74c3c');
            return;
        }
        
        if (isApproved) {
            // Aprobar la apuesta
            const updates = {
                status: 'verified',
                verifiedBy: 'admin', // Aquí podrías poner el ID del admin
                verificationDate: Date.now()
            };

            // Enviar notificación
            await sendNotification(userId, {
                type: 'success',
                message: `Tu apuesta de S/.${bet.amount} en ${bet.roomName} ha sido aprobada`,
                timestamp: Date.now()
            });
            
            await database.ref(`bets/${betId}`).update(updates);
            
            showNotification(`Apuesta aprobada correctamente.`);
            
            try {
                // Intentar notificar al usuario (pero no bloquear si falla)
                await notifyUser(userId, `Tu apuesta de S/.${bet.amount} en la sala ${bet.roomName} ha sido aprobada.`);
            } catch (notificationError) {
                console.error("Error al notificar usuario:", notificationError);
                // Continuamos aunque falle la notificación
            }
            
        } else {

            await sendNotification(userId, {
                type: 'error',
                message: `Tu apuesta de S/.${bet.amount} en ${bet.roomName} ha sido rechazada`,
                timestamp: Date.now()
            });
            // Rechazar la apuesta - eliminarla de la base de datos
            await database.ref(`bets/${betId}`).remove();
            
            showNotification(`Apuesta rechazada y eliminada.`);
            
            try {
                // Intentar notificar al usuario (pero no bloquear si falla)
                await notifyUser(userId, `Tu apuesta de S/.${bet.amount} en la sala ${bet.roomName} ha sido rechazada.`);
            } catch (notificationError) {
                console.error("Error al notificar usuario:", notificationError);
                // Continuamos aunque falle la notificación
            }
        }
        
        // Actualizar la lista de apuestas
        viewRoomBets(bet.roomId);
        
    } catch (error) {
        console.error("Error al verificar apuesta:", error);
        showNotification('Error al verificar la apuesta: ' + error.message, '#e74c3c');
    }
}
// Función para enviar notificaciones
async function sendNotification(userId, notification) {
    try {
        // 1. Guardar en el almacenamiento local (solución temporal)
        let userNotifications = JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
        userNotifications.push(notification);
        localStorage.setItem(`notifications_${userId}`, JSON.stringify(userNotifications));
        
        // 2. Si hay conexión SSE, enviar también
        if (window.EventSource) {
            // Aquí iría el código para enviar via SSE si tienes backend
        }
    } catch (error) {
        console.error("Error al enviar notificación:", error);
    }
}
// Función para verificar notificaciones (polling)
function checkForLocalNotifications() {
    if (!currentUser) return;
    
    const notifications = JSON.parse(localStorage.getItem(`notifications_${currentUser.id}`)) || [];
    
    // Mostrar solo las nuevas (usando timestamp)
    const lastChecked = localStorage.getItem(`lastChecked_${currentUser.id}`) || 0;
    const newNotifications = notifications.filter(n => n.timestamp > lastChecked);
    
    newNotifications.forEach(n => {
        showNotification(n.message, n.type === 'success' ? '#2ecc71' : '#e74c3c');
    });
    
    // Actualizar último chequeo
    if (newNotifications.length > 0) {
        localStorage.setItem(`lastChecked_${currentUser.id}`, Date.now());
        
        // Limpiar notificaciones mostradas (opcional)
        localStorage.setItem(`notifications_${currentUser.id}`, 
            JSON.stringify(notifications.filter(n => n.timestamp <= lastChecked)));
    }
    
    // Verificar cada 30 segundos
    setTimeout(checkForLocalNotifications, 30000);
}

// Iniciar cuando el usuario entra
if (currentUser) {
    checkForLocalNotifications();
}
// Función para volver del panel de apuestas al panel de administrador
function closeRoomBets() {
    document.getElementById('room-bets-section').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
}
async function updateBettingStatus(roomId, status) {
    try {
        const rooms = await getRooms();
        const updatedRooms = rooms.map(room => {
            if (room.id === roomId) {
                return {...room, bettingStatus: status};
            }
            return room;
        });
        
        await saveRooms(updatedRooms);
        showNotification(`Estado de apuestas actualizado: ${status}`);
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        showNotification('Error al actualizar estado: ' + error.message, '#e74c3c');
    }
}

// Función para mostrar controles de apuestas en el panel de admin
function showBettingControls(roomId) {
    const controlsHTML = `
        <div class="betting-controls">
            <h3>Control de Apuestas</h3>
            <div class="control-buttons">
                <button class="admin-button" onclick="updateBettingStatus(${roomId}, 'radiant')">Abrir solo Radiant</button>
                <button class="admin-button" onclick="updateBettingStatus(${roomId}, 'dire')">Abrir solo Dire</button>
                <button class="admin-button" onclick="updateBettingStatus(${roomId}, 'both')">Abrir ambos</button>
                <button class="admin-button" onclick="updateBettingStatus(${roomId}, 'none')">Cerrar ambos</button>
            </div>
        </div>
    `;
    
    // Agregar controles al panel de apuestas
    const controlsContainer = document.createElement('div');
    controlsContainer.innerHTML = controlsHTML;
    document.getElementById('room-bets-section').prepend(controlsContainer);
}

// Funciones para manejar la UI de notificaciones
function toggleNotifications() {
    const panel = document.getElementById('notifications-panel');
    panel.classList.toggle('hidden');
    
    if (!panel.classList.contains('hidden')) {
        loadNotifications();
        resetUnreadCount();
    }
}

function closeNotifications() {
    document.getElementById('notifications-panel').classList.add('hidden');
}

function loadNotifications() {
    if (!currentUser) return;
    
    const notifications = JSON.parse(localStorage.getItem(`notifications_${currentUser.id}`)) || [];
    const list = document.getElementById('notifications-list');
    
    list.innerHTML = '';
    
    if (notifications.length === 0) {
        list.innerHTML = '<p class="no-notifications">No tienes notificaciones</p>';
        return;
    }
    
    notifications.reverse().forEach(notif => {
        const item = document.createElement('div');
        item.className = `notification-item ${notif.type}`;
        item.innerHTML = `
            <p>${notif.message}</p>
            <small>${new Date(notif.timestamp).toLocaleString()}</small>
        `;
        list.appendChild(item);
    });
}

function resetUnreadCount() {
    localStorage.setItem(`lastChecked_${currentUser.id}`, Date.now());
    updateUnreadBadge();
}

function updateUnreadBadge() {
    if (!currentUser) return;
    
    const lastChecked = localStorage.getItem(`lastChecked_${currentUser.id}`) || 0;
    const notifications = JSON.parse(localStorage.getItem(`notifications_${currentUser.id}`)) || [];
    const unread = notifications.filter(n => n.timestamp > lastChecked).length;
    
    const badge = document.getElementById('unread-count');
    badge.textContent = unread;
    
    if (unread > 0) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Actualizar cada minuto
setInterval(updateUnreadBadge, 60000);