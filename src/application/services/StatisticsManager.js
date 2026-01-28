var StatisticsManager = (function() {
    
    var stats = {
        wins: 0,
        losses: 0,
        draws: 0
    };
    
    // Load saved stats
    function init() {
        var saved = StorageManager.load('statistics');
        if (saved) {
            stats.wins = saved.wins || 0;
            stats.losses = saved.losses || 0;
            stats.draws = saved.draws || 0;
        }
    }
    
    // Save current stats
    function save() {
        StorageManager.save('statistics', stats);
    }
    
    // Record game result
    function recordResult(result) {
        switch (result) {
            case 'win':
                stats.wins++;
                break;
            case 'loss':
                stats.losses++;
                break;
            case 'draw':
                stats.draws++;
                break;
        }
        save();
        notifyChange();
    }
    
    // Reset all stats
    function reset() {
        stats.wins = 0;
        stats.losses = 0;
        stats.draws = 0;
        save();
        notifyChange();
    }
    
    // Notify UI of changes
    function notifyChange() {
        document.dispatchEvent(new CustomEvent('statsChanged', {
            detail: getAll()
        }));
    }
    
    // Get all stats with calculated fields
    function getAll() {
        var total = stats.wins + stats.losses + stats.draws;
        var winRate = 0;
        if (total > 0) {
            winRate = Math.round((stats.wins / total) * 100);
        }
        
        return {
            wins: stats.wins,
            losses: stats.losses,
            draws: stats.draws,
            total: total,
            winRate: winRate
        };
    }
    
    // Initialize
    init();
    
    return {
        recordResult: recordResult,
        reset: reset,
        getAll: getAll
    };
    
})();
