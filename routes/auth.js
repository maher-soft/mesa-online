const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../database/db");

router.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hash],
        function (err) {
            if (err) return res.status(400).json({ error: "Usuario ya existe" });

            res.json({ id: this.lastID });
        }
    );
});

router.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, user) => {
            if (!user) return res.status(400).json({ error: "No existe" });

            const ok = await bcrypt.compare(password, user.password);
            if (!ok) return res.status(400).json({ error: "Password incorrecta" });

            req.session.user = {
                id: user.id,
                username: user.username
            };

            res.json({ user: req.session.user });
        }
    );
});

router.get("/api/me", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "No auth" });
    }

    res.json(req.session.user);
});

router.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ ok: true });
    });
});

module.exports = router;