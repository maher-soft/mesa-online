require("dotenv").config();

const express = require("express");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

require("./database/db");

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// FRONTEND
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ROUTES
app.use(require("./routes"));

// SOCKETS
io.on("connection", (socket) => {
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
    });

    socket.on("move", (data) => {
        io.to(data.roomId).emit("updateRoom", data.room);
    });
});

server.listen(3000, () => {
    console.log("http://localhost:3000");
});