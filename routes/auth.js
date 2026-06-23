const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../database/db");

router.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            error: "Faltan datos"
        });
    }

    const hash = await bcrypt.hash(password, 10);

    db.run(
        `
        INSERT INTO users
        (username, email, password)
        VALUES (?, ?, ?)
        `,
        [username, email, hash],
        function (err) {
            if (err) {
                return res.status(400).json({
                    error: "Usuario o email ya existe"
                });
            }

            res.json({
                message: "Usuario creado",
                id: this.lastID
            });
        }
    );
});

router.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, user) => {

            if (!user) {
                return res.status(400).json({
                    error: "Usuario no existe"
                });
            }

            const ok = await bcrypt.compare(
                password,
                user.password
            );

            if (!ok) {
                return res.status(400).json({
                    error: "Password incorrecta"
                });
            }

            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email
            };

            res.json({
                message: "Login correcto",
                user: req.session.user
            });
        }
    );
});

router.get("/api/me", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            error: "No auth"
        });
    }

    res.json(req.session.user);
});

router.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({
            ok: true
        });
    });
});

module.exports = router;