var StorageManager = (function() {
    
    var NAMESPACE = 'rl_tictactoe_';
    
    // Save data to localStorage
    function save(key, data) {
        try {
            var json = JSON.stringify(data);
            localStorage.setItem(NAMESPACE + key, json);
            return true;
        } catch (err) {
            console.error('Failed to save:', key, err);
            return false;
        }
    }
    
    // Load data from localStorage
    function load(key) {
        try {
            var json = localStorage.getItem(NAMESPACE + key);
            if (json === null) return null;
            return JSON.parse(json);
        } catch (err) {
            console.error('Failed to load:', key, err);
            return null;
        }
    }
    
    // Remove specific key
    function remove(key) {
        localStorage.removeItem(NAMESPACE + key);
    }
    
    // Clear all app data
    function clearAll() {
        var keysToRemove = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf(NAMESPACE) === 0) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(function(k) {
            localStorage.removeItem(k);
        });
    }
    
    return {
        save: save,
        load: load,
        remove: remove,
        clearAll: clearAll
    };
    
})();
