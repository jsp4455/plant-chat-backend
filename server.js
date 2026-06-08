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

// ⭐ NEW: store all messages
let messages = [];

// ⭐ NEW: store saved message IDs
let savedMessageIds = [];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // ⭐ Send full history to new user
    socket.emit("message_history", messages);

    // ⭐ Send saved IDs so highlights load
    socket.emit("saved_message_ids", savedMessageIds);

    socket.on('send_message', (msg) => {
        const message = {
            id: Date.now(),
            text: msg.text,
            sender: msg.sender || "Unknown",
            time: new Date().toLocaleTimeString()
        };

        // ⭐ Save message in history
        messages.push(message);

        io.emit('new_message', message);
    });

    // ⭐ Save message on board
    socket.on("save_on_board", (id) => {
        if (!savedMessageIds.includes(id)) {
            savedMessageIds.push(id);
            io.emit("saved_message_ids", savedMessageIds);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log("Server running on port", PORT));
