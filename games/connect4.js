function createBoard() {
    return Array(6)
        .fill(null)
        .map(() => Array(7).fill(null));
}

function checkWinner(board, color) {

    const rows = 6;
    const cols = 7;

    const directions = [
        [0, 1],   // horizontal
        [1, 0],   // vertical
        [1, 1],   // diagonal derecha
        [1, -1]   // diagonal izquierda
    ];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {

            for (const [dr, dc] of directions) {

                let count = 0;

                for (let i = 0; i < 4; i++) {

                    const nr = r + dr * i;
                    const nc = c + dc * i;

                    if (
                        nr >= 0 &&
                        nr < rows &&
                        nc >= 0 &&
                        nc < cols &&
                        board[nr][nc] === color
                    ) {
                        count++;
                    }
                }

                if (count === 4) {
                    return true;
                }
            }
        }
    }

    return false;
}

function makeMove(room, player, col) {

    //
    // Ya hay ganador
    //
    if (room.winner) {
        return {
            error: "La partida ha terminado"
        };
    }

    //
    // No es su turno
    //
    if (room.turn !== player.username) {
        return {
            error: "No es tu turno"
        };
    }

    let inserted = false;

    for (let r = 5; r >= 0; r--) {

        if (!room.board[r][col]) {

            room.board[r][col] = player.color;
            inserted = true;

            break;
        }
    }

    //
    // Columna llena
    //
    if (!inserted) {
        return {
            error: "Columna llena"
        };
    }

    //
    // Comprobar victoria
    //
    if (checkWinner(room.board, player.color)) {

        room.winner = player.username;

        return room;
    }

    //
    // Cambiar turno
    //
    const otherPlayer = room.players.find(
        p => p.username !== player.username
    );

    if (otherPlayer) {
        room.turn = otherPlayer.username;
    }

    return room;
}

module.exports = {
    createBoard,
    makeMove
};