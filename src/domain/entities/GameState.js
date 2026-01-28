function GameState() {
    // Initialize empty 3x3 board
    this.cells = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
}

// All possible winning line patterns
GameState.WIN_PATTERNS = [
    // Rows
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    // Columns
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    // Diagonals
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]]
];

// Convert action index (0-8) to row/col
GameState.prototype.indexToPos = function(index) {
    return {
        row: Math.floor(index / 3),
        col: index % 3
    };
};

// Convert row/col to action index
GameState.prototype.posToIndex = function(row, col) {
    return row * 3 + col;
};

// Reset the board to empty state
GameState.prototype.reset = function() {
    for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
            this.cells[r][c] = '';
        }
    }
};

// Check if a move at given index is valid
GameState.prototype.isValidMove = function(index) {
    if (index < 0 || index > 8) return false;
    var pos = this.indexToPos(index);
    return this.cells[pos.row][pos.col] === '';
};

// Apply a move to the board
GameState.prototype.applyMove = function(index, player) {
    if (!this.isValidMove(index)) {
        return false;
    }
    var pos = this.indexToPos(index);
    this.cells[pos.row][pos.col] = player;
    return true;
};

// Get list of valid action indices
GameState.prototype.getValidMoves = function() {
    var moves = [];
    for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
            if (this.cells[r][c] === '') {
                moves.push(this.posToIndex(r, c));
            }
        }
    }
    return moves;
};

// Check for a winner
// Returns { winner: 'X'/'O', pattern: [indices] } or null
GameState.prototype.checkWinner = function() {
    var patterns = GameState.WIN_PATTERNS;
    
    for (var i = 0; i < patterns.length; i++) {
        var p = patterns[i];
        var a = this.cells[p[0][0]][p[0][1]];
        var b = this.cells[p[1][0]][p[1][1]];
        var c = this.cells[p[2][0]][p[2][1]];
        
        if (a !== '' && a === b && b === c) {
            return {
                winner: a,
                pattern: [
                    this.posToIndex(p[0][0], p[0][1]),
                    this.posToIndex(p[1][0], p[1][1]),
                    this.posToIndex(p[2][0], p[2][1])
                ]
            };
        }
    }
    return null;
};

// Check if board is completely full
GameState.prototype.isFull = function() {
    for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
            if (this.cells[r][c] === '') {
                return false;
            }
        }
    }
    return true;
};

// Check if game ended in draw
GameState.prototype.isDraw = function() {
    return this.checkWinner() === null && this.isFull();
};

// Check if game is over (win or draw)
GameState.prototype.isTerminal = function() {
    return this.checkWinner() !== null || this.isFull();
};

// Encode board state as string (for Q-table key)
GameState.prototype.encode = function() {
    var str = '';
    for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
            str += this.cells[r][c] || '_';
        }
    }
    return str;
};

// Get flat array representation for UI
GameState.prototype.toArray = function() {
    var arr = [];
    for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
            arr.push(this.cells[r][c]);
        }
    }
    return arr;
};

// Create a deep copy of this state
GameState.prototype.clone = function() {
    var copy = new GameState();
    for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
            copy.cells[r][c] = this.cells[r][c];
        }
    }
    return copy;
};
