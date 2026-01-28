var MonteCarloAgent = (function() {
    
    // Q-table: { "stateString": { actionIndex: { sum, count } } }
    var returnsTable = {};
    
    // Load Q-table from storage
    function load() {
        var saved = StorageManager.load('returnsTable');
        if (saved) {
            returnsTable = saved;
        }
    }
    
    // Save Q-table to storage
    function save() {
        StorageManager.save('returnsTable', returnsTable);
    }
    
    // Get Q-value for state-action pair
    function getQValue(stateKey, action) {
        if (!returnsTable[stateKey]) return 0;
        var entry = returnsTable[stateKey][action];
        if (!entry) return 0;
        if (entry.count === 0) return 0;
        return entry.sum / entry.count;
    }
    
    function selectAction(state) {
        var validMoves = state.getValidMoves();
        if (validMoves.length === 0) return null;
        
        var epsilon = SettingsManager.get('explorationRate');
        
        // Exploration: random action
        if (Math.random() < epsilon) {
            var randomIndex = Math.floor(Math.random() * validMoves.length);
            return validMoves[randomIndex];
        }
        
        // Exploitation: best known action
        var stateKey = state.encode();
        var bestAction = validMoves[0];
        var bestValue = getQValue(stateKey, bestAction);
        
        for (var i = 1; i < validMoves.length; i++) {
            var action = validMoves[i];
            var value = getQValue(stateKey, action);
            if (value > bestValue) {
                bestValue = value;
                bestAction = action;
            }
        }
        
        return bestAction;
    }
    

    function updateReturns(episode, reward) {
        var visited = {};
        
        for (var i = 0; i < episode.length; i++) {
            var stateKey = episode[i].state;
            var action = episode[i].action;
            var pairKey = stateKey + ':' + action;
            
            // First-visit: only update first occurrence
            if (visited[pairKey]) continue;
            visited[pairKey] = true;
            
            // Initialize table entries if needed
            if (!returnsTable[stateKey]) {
                returnsTable[stateKey] = {};
            }
            if (!returnsTable[stateKey][action]) {
                returnsTable[stateKey][action] = { sum: 0, count: 0 };
            }
            
            // Update running average
            returnsTable[stateKey][action].sum += reward;
            returnsTable[stateKey][action].count += 1;
        }
        
        save();
    }
    
    // Get number of unique states in Q-table
    function getStatesCount() {
        return Object.keys(returnsTable).length;
    }
    
    // Reset Q-table (clear all learning)
    function reset() {
        returnsTable = {};
        save();
    }
    
    // Initialize
    load();
    
    return {
        selectAction: selectAction,
        updateReturns: updateReturns,
        getStatesCount: getStatesCount,
        reset: reset
    };
    
})();
