const express = require("express");
const router = express.Router();
const games = require("../games");
const rooms = require("../data/rooms");

// CREATE ROOM
router.post("/api/room/create", (req, res) => {
    const roomId = Math.random().toString(36).substring(2, 7);

    rooms[roomId] = {
        id: roomId,
        game: "connect4",
        players: [
            { username: req.session.user.username, color: "🔴" }
        ],
        board: games.connect4.createBoard(),
        turn: req.session.user.username,
        winner: null
    };

    res.json(rooms[roomId]);
});

// JOIN ROOM
router.post("/api/room/join", (req, res) => {
    const room = rooms[req.body.roomId];

    room.players.push({
        username: req.session.user.username,
        color: "🟡"
    });

    res.json(room);
});

// MOVE
router.post("/api/room/move", (req, res) => {
    const room = rooms[req.body.roomId];
    const player = room.players.find(p => p.username === req.session.user.username);

    const updated = games.connect4.makeMove(room, player, req.body.col);

    res.json(updated);
});

// GET ROOM
router.get("/api/room/:id", (req, res) => {
    res.json(rooms[req.params.id]);
});

module.exports = router;