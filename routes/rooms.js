const express = require("express");
const router = express.Router();
const games = require("../games");
const rooms = require("../data/rooms");

//
// CREATE ROOM
//
router.post("/api/room/create", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            error: "No autenticado"
        });
    }

    const roomId = Math.random().toString(36).substring(2, 7);

    rooms[roomId] = {
        id: roomId,
        game: "connect4",
        players: [
            {
                username: req.session.user.username,
                color: "🔴"
            }
        ],
        board: games.connect4.createBoard(),
        turn: req.session.user.username,
        winner: null
    };

    res.json({
        room: rooms[roomId]
    });
});

//
// JOIN ROOM
//
router.post("/api/room/join", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            error: "No autenticado"
        });
    }

    const { roomId } = req.body;

    const room = rooms[roomId];

    if (!room) {
        return res.status(404).json({
            error: "Sala no existe"
        });
    }

    const alreadyJoined = room.players.find(
        p => p.username === req.session.user.username
    );

    if (!alreadyJoined && room.players.length < 2) {
        room.players.push({
            username: req.session.user.username,
            color: "🟡"
        });
    }

    res.json({
        room
    });
});

//
// MOVE
//
router.post("/api/room/move", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            error: "No autenticado"
        });
    }

    const { roomId, col } = req.body;

    const room = rooms[roomId];

    if (!room) {
        return res.status(404).json({
            error: "Sala no existe"
        });
    }

    const player = room.players.find(
        p => p.username === req.session.user.username
    );

    if (!player) {
        return res.status(400).json({
            error: "No perteneces a esta sala"
        });
    }

    const updatedRoom = games.connect4.makeMove(
        room,
        player,
        col
    );

    res.json(updatedRoom);
});

//
// GET ROOM
//
router.get("/api/room/:id", (req, res) => {
    const room = rooms[req.params.id];

    if (!room) {
        return res.status(404).json({
            error: "Sala no existe"
        });
    }

    res.json({
        room
    });
});

module.exports = router;