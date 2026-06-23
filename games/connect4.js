function createBoard() {
    return Array(6).fill(null).map(() => Array(7).fill(null));
}

function checkWinner(board, color) {
    const R = 6, C = 7;

    const dirs = [
        [0,1],[1,0],[1,1],[1,-1]
    ];

    for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) {
            for (const [dr,dc] of dirs) {
                let ok = true;

                for (let i = 0; i < 4; i++) {
                    const nr = r + dr*i;
                    const nc = c + dc*i;

                    if (
                        nr < 0 || nc < 0 ||
                        nr >= R || nc >= C ||
                        board[nr][nc] !== color
                    ) ok = false;
                }

                if (ok) return true;
            }
        }
    }

    return false;
}

function makeMove(room, player, col) {
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

    return room;
}

module.exports = {
    createBoard,
    makeMove
};