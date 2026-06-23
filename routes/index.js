const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../database/db");

const rooms = {};

//
// STATUS
//
router.get("/api/status", (req, res) => {
    res.json({ status: "ok", message: "API funcionando 🚀" });
});

//
// REGISTER
//
router.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    const hash = await bcrypt.hash(password, 10);

    db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hash],
        function (err) {
            if (err) return res.status(400).json({ error: "Usuario ya existe" });

            res.json({ message: "Usuario creado", id: this.lastID });
        }
    );
});

//
// LOGIN
//
router.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, user) => {
            if (err) return res.status(500).json({ error: "Error servidor" });
            if (!user) return res.status(400).json({ error: "Usuario no existe" });

            const ok = await bcrypt.compare(password, user.password);
            if (!ok) return res.status(400).json({ error: "Password incorrecta" });

            req.session.user = {
                username: user.username,
                id: user.id
            };

            res.json({ message: "Login correcto", user: req.session.user });
        }
    );
});

//
// ME
//
router.get("/api/me", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "No autenticado" });
    }
    res.json(req.session.user);
});

//
// LOGOUT
//
router.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logout correcto" });
    });
});

//
// 🎮 CONECTA 4 HELPERS
//
function createBoard() {
    return Array(6).fill(null).map(() => Array(7).fill(null));
}

function checkWinner(board, color) {
    const R = 6;
    const C = 7;

    const dirs = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1]
    ];

    for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) {
            for (const [dr, dc] of dirs) {
                let ok = true;

                for (let i = 0; i < 4; i++) {
                    const nr = r + dr * i;
                    const nc = c + dc * i;

                    if (
                        nr < 0 || nr >= R ||
                        nc < 0 || nc >= C ||
                        board[nr][nc] !== color
                    ) {
                        ok = false;
                        break;
                    }
                }

                if (ok) return true;
            }
        }
    }

    return false;
}

//
// CREATE ROOM
//
router.post("/api/room/create", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "No autenticado" });
    }

    const roomId = Math.random().toString(36).substring(2, 8);

    rooms[roomId] = {
        id: roomId,
        players: [
            { username: req.session.user.username, color: "🔴" }
        ],
        board: createBoard(),
        turn: req.session.user.username,
        winner: null
    };

    res.json({ room: rooms[roomId] });
});

//
// JOIN ROOM
//
router.post("/api/room/join", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "No autenticado" });
    }

    const { roomId } = req.body;
    const room = rooms[roomId];

    if (!room) {
        return res.status(404).json({ error: "Sala no existe" });
    }

    if (room.players.length >= 2) {
        return res.status(400).json({ error: "Sala llena" });
    }

    if (!room.players.find(p => p.username === req.session.user.username)) {
        room.players.push({
            username: req.session.user.username,
            color: "🟡"
        });
    }

    res.json({ room });
});

//
// MOVE
//
router.post("/api/room/move", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "No autenticado" });
    }

    const { roomId, col } = req.body;
    const room = rooms[roomId];

    if (!room) {
        return res.status(404).json({ error: "Sala no existe" });
    }

    if (room.winner) {
        return res.status(400).json({ error: "Partida terminada" });
    }

    const player = room.players.find(p => p.username === req.session.user.username);

    if (!player) {
        return res.status(400).json({ error: "No estás en la sala" });
    }

    if (room.turn !== player.username) {
        return res.status(400).json({ error: "No es tu turno" });
    }

    for (let r = 5; r >= 0; r--) {
        if (!room.board[r][col]) {
            room.board[r][col] = player.color;
            break;
        }
    }

    if (checkWinner(room.board, player.color)) {
        room.winner = player.username;
    }

    const other = room.players.find(p => p.username !== player.username);
    if (other) room.turn = other.username;

    res.json(room);
});

//
// GET ROOM
//
router.get("/api/room/:id", (req, res) => {
    const room = rooms[req.params.id];

    if (!room) {
        return res.status(404).json({ error: "Sala no existe" });
    }

    res.json(room);
});

module.exports = router;