const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('send_message', (msg) => {
        io.emit('new_message', {
            id: Date.now(),
            text: msg.text,
            sender: msg.sender || "Unknown",
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log("Server running on port", PORT));
