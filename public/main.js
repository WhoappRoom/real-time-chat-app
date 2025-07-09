// Generate unique ID for users
function generateUserId() {
  return 'user-' + Math.random().toString(36).substr(2, 9);
}

// Convert image file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// WebSocket connection
const socket = new WebSocket(`${location.hostname === 'localhost' ? `ws://${location.host}` : `wss://${location.host}`}`);

// DOM Elements
const authSection = document.getElementById('auth');
const appSection = document.getElementById('app');
const fullNameInput = document.getElementById('fullName');
const fileInput = document.getElementById('file');
const previewPic = document.getElementById('preview-pic');
const saveBtn = document.getElementById('save');
const messagesDiv = document.getElementById('messages');
const inputMessage = document.getElementById('input-message');
const sendBtn = document.getElementById('send');
const logoutBtn = document.getElementById('logout');
const toast = document.getElementById('toast');

// Current user data
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Initialize app
function initApp() {
  if (currentUser) {
    // Convert stored base64 to object URL for local display
    if (currentUser.picture && currentUser.picture.startsWith('data:')) {
      currentUser.localPicture = URL.createObjectURL(dataURItoBlob(currentUser.picture));
    }
    authSection.style.display = 'none';
    appSection.style.display = 'inline-block';
    connectToChat();
  } else {
    authSection.style.display = 'flex';
    appSection.style.display = 'none';
  }
  document.querySelector('meta[name="viewport"]').content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
}

// Convert data URI to Blob
function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

// Connect to chat
function connectToChat() {
  socket.onopen = () => {
    showToast('Connected to chat', 'success');
    // Send user join notification
    const joinMessage = {
      type: 'system',
      content: `${currentUser.name} has joined the chat`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPic: currentUser.picture, // Send base64 version
      timestamp: new Date().toISOString()
    };
    socket.send(JSON.stringify(joinMessage));
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    displayMessage(message);
  };

  socket.onclose = () => {
    showToast('Disconnected from chat', 'error');
  };

  socket.onerror = (error) => {
    showToast('Connection error', 'error');
    console.error('WebSocket error:', error);
  };
}

// Display message
function displayMessage(message) {
  const messageElement = document.createElement('div');
  
  if (message.type === 'system') {
    messageElement.className = 'message system';
    messageElement.textContent = message.content;
  } else {
    messageElement.className = `message ${message.userId === currentUser?.id ? 'sent' : 'received'}`;
    
    // Use base64 image directly
    const displayPic = message.userPic || 'default-avatar.png';
    
    messageElement.innerHTML = `
      <div class="message-header">
        <img src="${displayPic}" alt="${message.userName}" class="message-avatar">
        <span class="message-sender">${message.userName}</span>
        <span class="message-time">${formatTime(message.timestamp)}</span>
      </div>
      <div class="message-content">${message.content}</div>
    `;
  }
  
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Format time
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Show toast notification
function showToast(message, type) {
  toast.textContent = message;
  toast.className = `show ${type}`;
  setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 3000);
}

// Event Listeners
fileInput.addEventListener('change', function() {
  if (this.files && this.files[0]) {
    previewPic.src = URL.createObjectURL(this.files[0]);
  }
});

saveBtn.addEventListener('click', async function() {
  const fullName = fullNameInput.value.trim();
  
  if (!fullName) {
    showToast('Please enter your name', 'error');
    return;
  }

  const userId = generateUserId();
  let userPic = 'default-avatar.png';

  if (fileInput.files[0]) {
    try {
      userPic = await fileToBase64(fileInput.files[0]);
    } catch (error) {
      console.error('Error converting image:', error);
      showToast('Error processing image', 'error');
      return;
    }
  }

  currentUser = {
    id: userId,
    name: fullName,
    picture: userPic
  };

  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  initApp();
});

sendBtn.addEventListener('click', sendMessage);
inputMessage.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const content = inputMessage.value.trim();
  
  if (content && currentUser) {
    const message = {
      type: 'chat',
      content: content,
      userId: currentUser.id,
      userName: currentUser.name,
      userPic: currentUser.picture, // Send base64 version
      timestamp: new Date().toISOString()
    };
    
    socket.send(JSON.stringify(message));
    inputMessage.value = '';
  }
}

logoutBtn.addEventListener('click', function() {
  // Send leave notification
  const leaveMessage = {
    type: 'system',
    content: `${currentUser.name} has left the chat`,
    userId: currentUser.id,
    userName: currentUser.name,
    userPic: currentUser.picture,
    timestamp: new Date().toISOString()
  };
  socket.send(JSON.stringify(leaveMessage));
  
  // Clean up object URLs
  if (currentUser.localPicture) {
    URL.revokeObjectURL(currentUser.localPicture);
  }
  
  localStorage.removeItem('currentUser');
  currentUser = null;
  initApp();
  window.location.reload();
});

// Initialize the app
initApp();
function handleViewport() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', handleViewport);
window.addEventListener('orientationchange', handleViewport);
handleViewport(); // Initial call