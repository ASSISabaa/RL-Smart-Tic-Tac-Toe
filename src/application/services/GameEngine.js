var GameEngine = (function() {
    
    // State Machine States (from LLD proposal)
    var STATE = {
        IDLE: 'idle',
        HUMAN_TURN: 'humanTurn',
        AI_TURN: 'aiTurn',
        CHECK_TERMINAL: 'checkTerminal',
        GAME_OVER: 'gameOver'
    };
    
    // Game state attributes (from class diagram)
    var board = new GameState();
    var currentPlayer = 'X';
    var gameStatus = STATE.IDLE;
    var episodeHistory = [];    // For MC learning
    var winPattern = null;      // Winning cell indices
    var gameResult = null;      // 'win', 'loss', 'draw'
    

    function startNewGame() {
        board.reset();
        episodeHistory = [];
        winPattern = null;
        gameResult = null;
        
        // Determine who starts based on settings
        var starter = SettingsManager.get('startingPlayer');
        currentPlayer = (starter === 'human') ? 'X' : 'O';
        
        if (currentPlayer === 'X') {
            gameStatus = STATE.HUMAN_TURN;
        } else {
            gameStatus = STATE.AI_TURN;
        }
        
        notifyStateChange();
        
        // If AI starts, trigger AI move after short delay
        if (gameStatus === STATE.AI_TURN) {
            setTimeout(function() {
                requestAIMove();
            }, 350);
        }
        
        return getState();
    }
    

    function handleMove(action) {
        if (gameStatus !== STATE.HUMAN_TURN) {
            return null;
        }
        
        if (!board.isValidMove(action)) {
            return null;
        }
        
        // Apply move
        board.applyMove(action, 'X');
        notifyStateChange();
        
        // Check if game ended
        gameStatus = STATE.CHECK_TERMINAL;
        return checkTerminal();
    }
    

    function requestAIMove() {
        if (gameStatus !== STATE.AI_TURN) {
            return null;
        }
        
        // Get selected AI agent
        var opponentType = SettingsManager.get('opponentType');
        var agent = (opponentType === 'montecarlo') 
            ? MonteCarloAgent 
            : AlphaBetaAgent;
        
        // Record state before move (for MC learning)
        var stateBeforeMove = board.encode();
        
        // Select action
        var action = agent.selectAction(board);
        
        // Store in episode history for MC agent
        if (opponentType === 'montecarlo') {
            episodeHistory.push({
                state: stateBeforeMove,
                action: action
            });
        }
        
        // Apply move
        board.applyMove(action, 'O');
        notifyStateChange();
        
        // Check if game ended
        gameStatus = STATE.CHECK_TERMINAL;
        return checkTerminal();
    }

    function checkTerminal() {
        var winner = board.checkWinner();
        
        if (winner !== null) {
            // Someone won
            gameStatus = STATE.GAME_OVER;
            winPattern = winner.pattern;
            
            if (winner.winner === 'X') {
                // Human won
                gameResult = 'win';
                StatisticsManager.recordResult('win');
                updateMCAgent(-1); // AI lost
            } else {
                // AI won
                gameResult = 'loss';
                StatisticsManager.recordResult('loss');
                updateMCAgent(1);  // AI won
            }
            
            notifyGameOver();
            return getState();
        }
        
        if (board.isDraw()) {
            // Draw
            gameStatus = STATE.GAME_OVER;
            gameResult = 'draw';
            StatisticsManager.recordResult('draw');
            updateMCAgent(0);
            
            notifyGameOver();
            return getState();
        }
        
        // Game continues - switch turn
        if (currentPlayer === 'X') {
            currentPlayer = 'O';
            gameStatus = STATE.AI_TURN;
            
            // Trigger AI move
            setTimeout(function() {
                requestAIMove();
            }, 350);
        } else {
            currentPlayer = 'X';
            gameStatus = STATE.HUMAN_TURN;
        }
        
        notifyStateChange();
        return getState();
    }
    
  
    function updateMCAgent(reward) {
        var opponentType = SettingsManager.get('opponentType');
        if (opponentType === 'montecarlo' && episodeHistory.length > 0) {
            MonteCarloAgent.updateReturns(episodeHistory, reward);
        }
    }
    

    function trainAI(numGames) {
        for (var g = 0; g < numGames; g++) {
            runTrainingGame();
        }
    }
    
    function runTrainingGame() {
        var trainBoard = new GameState();
        var history = [];
        var player = Math.random() < 0.5 ? 'X' : 'O';
        
        while (!trainBoard.isTerminal()) {
            var action;
            
            if (player === 'O') {
                // MC agent plays
                var stateKey = trainBoard.encode();
                action = MonteCarloAgent.selectAction(trainBoard);
                history.push({ state: stateKey, action: action });
            } else {
                // Random opponent
                var moves = trainBoard.getValidMoves();
                action = moves[Math.floor(Math.random() * moves.length)];
            }
            
            trainBoard.applyMove(action, player);
            player = (player === 'X') ? 'O' : 'X';
        }
        
        // Calculate reward
        var winner = trainBoard.checkWinner();
        var reward = 0;
        if (winner !== null) {
            reward = (winner.winner === 'O') ? 1 : -1;
        }
        
        MonteCarloAgent.updateReturns(history, reward);
    }
    

    function resetLearning() {
        MonteCarloAgent.reset();
        StatisticsManager.reset();
    }
    
    
    //  Build state object for UI
     
    function getState() {
        return {
            board: board.toArray(),
            currentPlayer: currentPlayer,
            gameStatus: gameStatus,
            result: gameResult,
            winPattern: winPattern
        };
    }
    
    
     //Notify UI of state changes
    
    function notifyStateChange() {
        document.dispatchEvent(new CustomEvent('boardUpdate', {
            detail: getState()
        }));
    }
    
    function notifyGameOver() {
        document.dispatchEvent(new CustomEvent('gameOver', {
            detail: getState()
        }));
    }
    
    
     //Getters for UI
     
    function getStatesCount() {
        return MonteCarloAgent.getStatesCount();
    }
    
    function isHumanTurn() {
        return gameStatus === STATE.HUMAN_TURN;
    }
    
    // Public API
    return {
        startNewGame: startNewGame,
        handleMove: handleMove,
        requestAIMove: requestAIMove,
        checkTerminal: checkTerminal,
        trainAI: trainAI,
        resetLearning: resetLearning,
        getState: getState,
        getStatesCount: getStatesCount,
        isHumanTurn: isHumanTurn,
        STATE: STATE
    };
    
})();
