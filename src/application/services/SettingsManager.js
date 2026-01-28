
var SettingsManager = (function() {
    
    // Epsilon values for each difficulty level
    var EPSILON_VALUES = {
        easy: 0.7,      // high exploration = weaker play
        medium: 0.3,    // balanced
        hard: 0.1       // low exploration = stronger play
    };
    
    // Current settings
    var settings = {
        difficulty: 'medium',
        opponentType: 'montecarlo',
        explorationRate: 0.3,
        startingPlayer: 'human'
    };
    
    // Load saved settings on init
    function init() {
        var saved = StorageManager.load('settings');
        if (saved) {
            settings.difficulty = saved.difficulty || 'medium';
            settings.opponentType = saved.opponentType || 'montecarlo';
            settings.explorationRate = saved.explorationRate || 0.3;
            settings.startingPlayer = saved.startingPlayer || 'human';
        }
    }
    
    // Save current settings
    function save() {
        StorageManager.save('settings', settings);
    }
    
    // Update a single setting
    function update(key, value) {
        settings[key] = value;
        
        // Sync epsilon with difficulty
        if (key === 'difficulty') {
            settings.explorationRate = EPSILON_VALUES[value] || 0.3;
        }
        
        save();
        
        // Notify listeners
        document.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: getAll()
        }));
    }
    
    // Get single setting
    function get(key) {
        return settings[key];
    }
    
    // Get all settings (copy)
    function getAll() {
        return {
            difficulty: settings.difficulty,
            opponentType: settings.opponentType,
            explorationRate: settings.explorationRate,
            startingPlayer: settings.startingPlayer
        };
    }
    
    // Initialize on load
    init();
    
    return {
        get: get,
        getAll: getAll,
        update: update
    };
    
})();
