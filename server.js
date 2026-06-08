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

// ⭐ Temporary messages (do NOT survive refresh)
let liveMessages = [];

// ⭐ Permanent saved messages (survive refresh)
let messages = [];

// ⭐ IDs of saved messages
let savedMessageIds = [];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send ONLY saved messages
    socket.emit("message_history", messages);

    // Send saved IDs so highlights load
    socket.emit("saved_message_ids", savedMessageIds);

    // Handle new message
    socket.on('send_message', (msg) => {
        const message = {
            id: Date.now(),
            text: msg.text,
            sender: msg.sender || "Unknown",
            time: new Date().toLocaleTimeString()
        };

        // Store in temporary live list
        liveMessages.push(message);

        io.emit('new_message', message);
    });

    // ⭐ Save message permanently
    socket.on("save_on_board", (id) => {
        const msg = liveMessages.find(m => m.id === id);

        if (msg && !messages.find(m => m.id === id)) {
            messages.push(msg); // store permanently
        }

        if (!savedMessageIds.includes(id)) {
            savedMessageIds.push(id);
            io.emit("saved_message_ids", savedMessageIds);
        }
    });

    // ⭐ Unsave message (remove from permanent)
    socket.on("unsave_on_board", (id) => {
        savedMessageIds = savedMessageIds.filter(x => x !== id);
        messages = messages.filter(m => m.id !== id);
        io.emit("saved_message_ids", savedMessageIds);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log("Server running on port", PORT));
