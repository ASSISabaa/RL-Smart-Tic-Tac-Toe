
var AlphaBetaAgent = (function() {
    
    // Depth limits for each difficulty
    var DEPTH_LIMITS = {
        easy: 1,
        medium: 4,
        hard: 9
    };
    
   
    function selectAction(state) {
        var validMoves = state.getValidMoves();
        if (validMoves.length === 0) return null;
        
        // Get depth based on difficulty
        var difficulty = SettingsManager.get('difficulty');
        var maxDepth = DEPTH_LIMITS[difficulty] || 9;
        
        var bestAction = validMoves[0];
        var bestScore = -Infinity;
        var alpha = -Infinity;
        var beta = Infinity;
        
        for (var i = 0; i < validMoves.length; i++) {
            var action = validMoves[i];
            var newState = state.clone();
            newState.applyMove(action, 'O');
            
            var score = minimax(newState, maxDepth - 1, alpha, beta, false);
            
            if (score > bestScore) {
                bestScore = score;
                bestAction = action;
            }
            
            alpha = Math.max(alpha, score);
        }
        
        return bestAction;
    }
    
   
    function minimax(state, depth, alpha, beta, isMaximizing) {
        // Check terminal states
        var winner = state.checkWinner();
        if (winner !== null) {
            return winner.winner === 'O' ? 10 : -10;
        }
        if (state.isDraw()) {
            return 0;
        }
        if (depth === 0) {
            return evaluate(state);
        }
        
        var validMoves = state.getValidMoves();
        
        if (isMaximizing) {
            // AI's turn - maximize score
            var maxScore = -Infinity;
            
            for (var i = 0; i < validMoves.length; i++) {
                var newState = state.clone();
                newState.applyMove(validMoves[i], 'O');
                var score = minimax(newState, depth - 1, alpha, beta, false);
                
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                
                if (beta <= alpha) break; // Prune
            }
            
            return maxScore;
        } else {
            // Human's turn - minimize score
            var minScore = Infinity;
            
            for (var i = 0; i < validMoves.length; i++) {
                var newState = state.clone();
                newState.applyMove(validMoves[i], 'X');
                var score = minimax(newState, depth - 1, alpha, beta, true);
                
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                
                if (beta <= alpha) break; // Prune
            }
            
            return minScore;
        }
    }
    
   
    function evaluate(state) {
        var score = 0;
        var patterns = GameState.WIN_PATTERNS;
        
        for (var i = 0; i < patterns.length; i++) {
            var p = patterns[i];
            var cells = [
                state.cells[p[0][0]][p[0][1]],
                state.cells[p[1][0]][p[1][1]],
                state.cells[p[2][0]][p[2][1]]
            ];
            
            var oCount = 0;
            var xCount = 0;
            
            for (var j = 0; j < 3; j++) {
                if (cells[j] === 'O') oCount++;
                else if (cells[j] === 'X') xCount++;
            }
            
            // Only score lines that could still be won
            if (oCount > 0 && xCount === 0) {
                score += oCount;
            }
            if (xCount > 0 && oCount === 0) {
                score -= xCount;
            }
        }
        
        return score;
    }
    
    return {
        selectAction: selectAction
    };
    
})();
