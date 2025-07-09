# Real-Time Chat Application

A simple, responsive real-time chat application built with Node.js, WebSockets, and vanilla JavaScript.

## Features

- Real-time messaging using WebSockets
- User authentication with profile pictures
- Responsive design that works on mobile and desktop
- System messages for user join/leave notifications
- Message timestamps
- Toast notifications
- Persistent user sessions using localStorage
- Image upload and display (converted to base64)

## Technologies Used

- **Backend**:
  - Node.js
  - novaxjs2 (web framework)
  - ws (WebSocket library)

- **Frontend**:
  - Vanilla JavaScript
  - HTML5
  - CSS3 (with responsive design)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/WhoappRoom/real-time-chat-app.git
   cd real-time-chat-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

```
real-time-chat-app/
├── public/
│   ├── index.html       # Main HTML file
│   ├── main.js          # Client-side JavaScript
│   ├── main.css         # Stylesheet
│   └── img_avatar.png   # Default avatar image
├── index.js             # Server entry point
└── package.json         # Project configuration
```

## Usage

1. Upon loading the app, you'll see an authentication modal.
2. Enter your name and optionally upload a profile picture.
3. Click "Join Chat" to enter the chat room.
4. Type messages in the input field and press Enter or click the send button.
5. To logout, click the logout button in the top-right corner.

## Configuration

The application runs on port 3000 by default. To change this, modify the port number in `index.js`:
```javascript
app.at(3000, () => console.log('Server is running on port 3000'));
```

## Deployment

For production deployment:
1. Install production dependencies:
   ```bash
   npm install 
   ```
2. Start the server:
   ```bash
   npm start
   ```

For deployment to platforms like Heroku or Render, make sure to:
- Set the appropriate environment variables
- Configure the WebSocket URL in `main.js` if needed

## License

This project is open-source and available under the [ISC License](LICENSE).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.