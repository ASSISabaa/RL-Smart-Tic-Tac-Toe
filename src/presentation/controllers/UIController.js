var UIController = (function() {
    
    // DOM element cache
    var el = {};
    
    
     //Initialize UI
     
    function init() {
        cacheElements();
        bindEvents();
        loadSettings();
        updateStats(StatisticsManager.getAll());
        updateStatesCount();
        GameEngine.startNewGame();
    }
    
    
     //Cache DOM element references
     
    function cacheElements() {
        el.cells = document.querySelectorAll('.cell');
        el.turnText = document.getElementById('turnText');
        el.gameOverModal = document.getElementById('gameOverModal');
        el.modalMessage = document.getElementById('modalMessage');
        el.modalSubtitle = document.getElementById('modalSubtitle');
        el.modalIcon = document.getElementById('modalIcon');
        el.trainingModal = document.getElementById('trainingModal');
        
        el.wins = document.getElementById('winsValue');
        el.losses = document.getElementById('lossesValue');
        el.draws = document.getElementById('drawsValue');
        el.winRate = document.getElementById('winRateValue');
        el.winRateBar = document.getElementById('winRateBar');
        el.winRateBar2 = document.getElementById('winRateBar2');
        el.statesCount = document.getElementById('statesCount');
        el.epsilonValue = document.getElementById('epsilonValue');
        
        el.difficultySelect = document.getElementById('difficultySelect');
        el.opponentSelect = document.getElementById('opponentSelect');
        el.starterSelect = document.getElementById('starterSelect');
        el.trainGamesInput = document.getElementById('trainGames');
    }
    
    
    //  Bind event listeners
     
    function bindEvents() {
        // Cell clicks
        for (var i = 0; i < el.cells.length; i++) {
            (function(index) {
                el.cells[index].addEventListener('click', function() {
                    handleClick(index);
                });
            })(i);
        }
        
        // Buttons
        document.getElementById('newGameBtn').addEventListener('click', function() {
            hideModal();
            GameEngine.startNewGame();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', function() {
            hideModal();
            GameEngine.startNewGame();
        });
        
        document.getElementById('trainBtn').addEventListener('click', onTrain);
        document.getElementById('resetBtn').addEventListener('click', onReset);
        
        // Settings dropdowns
        el.difficultySelect.addEventListener('change', function() {
            SettingsManager.update('difficulty', this.value);
            updateEpsilon();
        });
        
        el.opponentSelect.addEventListener('change', function() {
            SettingsManager.update('opponentType', this.value);
        });
        
        el.starterSelect.addEventListener('change', function() {
            SettingsManager.update('startingPlayer', this.value);
        });
        
        // Game events
        document.addEventListener('boardUpdate', function(e) {
            renderBoard(e.detail.board, e.detail.winPattern);
            updateTurn(e.detail);
        });
        
        document.addEventListener('gameOver', function(e) {
            renderBoard(e.detail.board, e.detail.winPattern);
            showGameOver(e.detail.result);
            updateStats(StatisticsManager.getAll());
            updateStatesCount();
        });
        
        document.addEventListener('statsChanged', function(e) {
            updateStats(e.detail);
        });
    }
    
   
     //handleClick(cell) - Class diagram method
     
    function handleClick(cell) {
        if (!GameEngine.isHumanTurn()) {
            return;
        }
        GameEngine.handleMove(cell);
    }
    
    
     //renderBoard(board, winPattern) - Class diagram method
    
    function renderBoard(board, winPattern) {
        for (var i = 0; i < el.cells.length; i++) {
            var cell = el.cells[i];
            var value = board[i];
            
            cell.textContent = value;
            cell.className = 'cell';
            
            if (value === 'X') {
                cell.classList.add('x');
            } else if (value === 'O') {
                cell.classList.add('o');
            }
            
            if (winPattern && winPattern.indexOf(i) !== -1) {
                cell.classList.add('winner');
            }
        }
    }
    
    
     //updateStats(stats) - Class diagram method
     
    function updateStats(stats) {
        el.wins.textContent = stats.wins;
        el.losses.textContent = stats.losses;
        el.draws.textContent = stats.draws;
        el.winRate.textContent = stats.winRate + '%';
        el.winRateBar.style.width = stats.winRate + '%';
        if (el.winRateBar2) {
            el.winRateBar2.textContent = stats.winRate + '%';
        }
    }
    
    
      //Update turn indicator
     
    function updateTurn(state) {
        el.turnText.className = 'turn-indicator';
        
        if (state.gameStatus === 'gameOver') {
            el.turnText.innerHTML = '<span>Game Over</span>';
        } else if (state.currentPlayer === 'X') {
            el.turnText.classList.add('human-turn');
            el.turnText.innerHTML = '<span>Your turn (X)</span>';
        } else {
            el.turnText.classList.add('ai-turn');
            el.turnText.innerHTML = '<span>AI thinking...</span>';
        }
    }
    
    
     //Update states count
     
    function updateStatesCount() {
        el.statesCount.textContent = GameEngine.getStatesCount();
    }
    
    
     //Update epsilon display
     
    function updateEpsilon() {
        var epsilon = SettingsManager.get('explorationRate');
        el.epsilonValue.textContent = epsilon.toFixed(1);
    }
    
   
     // Load settings into UI
     
    function loadSettings() {
        var settings = SettingsManager.getAll();
        el.difficultySelect.value = settings.difficulty;
        el.opponentSelect.value = settings.opponentType;
        el.starterSelect.value = settings.startingPlayer;
        updateEpsilon();
    }
    
    
     //Show game over modal
     
    function showGameOver(result) {
        var config = {
            win: {
                icon: '🎉',
                title: 'You Win!',
                subtitle: 'Great job! You beat the AI.',
                iconClass: 'win'
            },
            loss: {
                icon: '🤖',
                title: 'AI Wins!',
                subtitle: 'The AI learned well this time.',
                iconClass: 'loss'
            },
            draw: {
                icon: '🤝',
                title: "It's a Draw!",
                subtitle: 'A well-matched game.',
                iconClass: 'draw'
            }
        };
        
        var c = config[result] || config.draw;
        
        el.modalIcon.textContent = c.icon;
        el.modalIcon.className = 'modal-icon ' + c.iconClass;
        el.modalMessage.textContent = c.title;
        el.modalSubtitle.textContent = c.subtitle;
        
        el.gameOverModal.classList.add('visible');
    }
    
    
     //Hide modal
     
    function hideModal() {
        el.gameOverModal.classList.remove('visible');
    }
    
  
     //Handle train button
     
    function onTrain() {
        var numGames = parseInt(el.trainGamesInput.value) || 100;
        
        el.trainingModal.classList.add('visible');
        
        setTimeout(function() {
            GameEngine.trainAI(numGames);
            el.trainingModal.classList.remove('visible');
            updateStats(StatisticsManager.getAll());
            updateStatesCount();
        }, 50);
    }
    
    
     //Handle reset button
     
    function onReset() {
        var confirmed = confirm('Reset all AI learning data and statistics?\n\nThis cannot be undone.');
        if (confirmed) {
            GameEngine.resetLearning();
            updateStats(StatisticsManager.getAll());
            updateStatesCount();
        }
    }
    
    // Public API
    return {
        init: init,
        handleClick: handleClick,
        renderBoard: renderBoard,
        updateStats: updateStats
    };
    
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    UIController.init();
});
