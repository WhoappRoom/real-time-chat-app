const novax = require('novaxjs2');
const { WebSocketServer } = require('ws');
const app = new novax();
const server = app.server;

app.serveStatic(); // default public folder

const wss = new WebSocketServer({ server });
const activeUsers = new Set();

wss.on('connection', (ws) => {
  console.log('Client Connected');
  
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      
      // Broadcast message to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage));
        }
      });
      
      // Track active users for join/leave messages
      if (parsedMessage.type === 'system' && parsedMessage.content.includes('joined')) {
        activeUsers.add(parsedMessage.userId);
      } else if (parsedMessage.type === 'system' && parsedMessage.content.includes('left')) {
        activeUsers.delete(parsedMessage.userId);
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.get('/', (req, res) => app.sendFile('./public/index.html', res));
app.at(3000, '0.0.0.0', () => console.log('Server is running on port 3000'));
