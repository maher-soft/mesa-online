const socket = io();

let currentRoom = null;

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.error) return alert(data.error);

    loadUser();
}

async function loadUser() {
    const res = await fetch("/api/me", {
        credentials: "include"
    });

    const data = await res.json();

    if (data.error) return;

    document.getElementById("auth").style.display = "none";
    document.getElementById("userPanel").style.display = "block";

    document.getElementById("userInfo").innerText = data.username;
}

async function logout() {
    await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
    });

    location.reload();
}

async function createRoom() {
    const res = await fetch("/api/room/create", {
        method: "POST",
        credentials: "include"
    });

    const data = await res.json();

    currentRoom = data.room.id;

    socket.emit("joinRoom", currentRoom);

    renderRoom(data.room);
}

async function joinRoom() {
    const roomId = document.getElementById("roomId").value;

    const res = await fetch("/api/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ roomId })
    });

    const data = await res.json();

    currentRoom = roomId;

    socket.emit("joinRoom", roomId);

    renderRoom(data.room);
}

async function move(col) {
    const res = await fetch("/api/room/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ roomId: currentRoom, col })
    });

    const room = await res.json();

    socket.emit("move", { roomId: currentRoom, room });

    renderRoom(room);
}

socket.on("updateRoom", (room) => {
    renderRoom(room);
});

function renderRoom(room) {
    let html = `<h3>Sala: ${room.id}</h3>`;
    html += `<p>Turno: ${room.turn}</p>`;

    if (room.winner) {
        html += `<h2>🏆 Ganador: ${room.winner}</h2>`;
    }

    html += "<div>";
    for (let c = 0; c < 7; c++) {
        html += `<button onclick="move(${c})">↓</button>`;
    }
    html += "</div>";

    html += "<pre>";

    for (let r = 0; r < 6; r++) {
        let row = "";
        for (let c = 0; c < 7; c++) {
            row += room.board[r][c] || "⚪";
        }
        html += row + "\n";
    }

    html += "</pre>";

    document.getElementById("roomInfo").innerHTML = html;
}

loadUser();