(function() {
    
    var passed = 0;
    var failed = 0;
    
    function test(name, fn) {
        try {
            fn();
            console.log('✓ ' + name);
            passed++;
        } catch (e) {
            console.error('✗ ' + name + ': ' + e.message);
            failed++;
        }
    }
    
    function assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }
    
    function assertEquals(expected, actual, message) {
        if (expected !== actual) {
            throw new Error((message || 'Expected') + ': ' + expected + ', got: ' + actual);
        }
    }
    
    console.log('=== GameState Tests ===');
    
    test('GameState: cells[3][3] initialized empty', function() {
        var state = new GameState();
        for (var r = 0; r < 3; r++) {
            for (var c = 0; c < 3; c++) {
                assertEquals('', state.cells[r][c], 'Cell [' + r + '][' + c + ']');
            }
        }
    });
    
    test('GameState: applyMove works correctly', function() {
        var state = new GameState();
        var result = state.applyMove(4, 'X');
        assert(result === true, 'Should return true');
        assertEquals('X', state.cells[1][1], 'Center cell');
    });
    
    test('GameState: isValidMove returns false for occupied cell', function() {
        var state = new GameState();
        state.applyMove(4, 'X');
        assert(state.isValidMove(4) === false, 'Should be invalid');
    });
    
    test('GameState: reset clears all cells', function() {
        var state = new GameState();
        state.applyMove(0, 'X');
        state.applyMove(4, 'O');
        state.reset();
        for (var r = 0; r < 3; r++) {
            for (var c = 0; c < 3; c++) {
                assertEquals('', state.cells[r][c], 'Cell should be empty');
            }
        }
    });
    
    test('GameState: detects horizontal win', function() {
        var state = new GameState();
        state.applyMove(0, 'X');
        state.applyMove(1, 'X');
        state.applyMove(2, 'X');
        var winner = state.checkWinner();
        assert(winner !== null, 'Should detect winner');
        assertEquals('X', winner.winner, 'Winner should be X');
    });
    
    test('GameState: detects vertical win', function() {
        var state = new GameState();
        state.applyMove(0, 'O');
        state.applyMove(3, 'O');
        state.applyMove(6, 'O');
        var winner = state.checkWinner();
        assert(winner !== null, 'Should detect winner');
        assertEquals('O', winner.winner, 'Winner should be O');
    });
    
    test('GameState: detects diagonal win', function() {
        var state = new GameState();
        state.applyMove(0, 'X');
        state.applyMove(4, 'X');
        state.applyMove(8, 'X');
        var winner = state.checkWinner();
        assert(winner !== null, 'Should detect winner');
        assertEquals('X', winner.winner, 'Winner should be X');
    });
    
    test('GameState: detects draw correctly', function() {
        var state = new GameState();
        // X O X
        // X X O
        // O X O
        state.cells = [['X','O','X'], ['X','X','O'], ['O','X','O']];
        assert(state.isDraw() === true, 'Should be draw');
        assert(state.checkWinner() === null, 'No winner');
    });
    
    test('GameState: getValidMoves returns correct indices', function() {
        var state = new GameState();
        state.applyMove(0, 'X');
        state.applyMove(4, 'O');
        var moves = state.getValidMoves();
        assertEquals(7, moves.length, 'Should have 7 valid moves');
        assert(moves.indexOf(0) === -1, '0 should not be valid');
        assert(moves.indexOf(4) === -1, '4 should not be valid');
    });
    
    test('GameState: encode returns correct string', function() {
        var state = new GameState();
        state.applyMove(0, 'X');
        state.applyMove(4, 'O');
        var encoded = state.encode();
        assertEquals('X___O____', encoded, 'Encoded state');
    });
    
    test('GameState: clone creates independent copy', function() {
        var state = new GameState();
        state.applyMove(0, 'X');
        var copy = state.clone();
        copy.applyMove(4, 'O');
        assertEquals('X', state.cells[0][0], 'Original unchanged');
        assertEquals('', state.cells[1][1], 'Original center empty');
        assertEquals('O', copy.cells[1][1], 'Copy has O in center');
    });
    
    console.log('\n=== MonteCarloAgent Tests ===');
    
    test('MonteCarloAgent: selectAction returns valid move', function() {
        var state = new GameState();
        var action = MonteCarloAgent.selectAction(state);
        assert(action >= 0 && action <= 8, 'Action should be 0-8');
        assert(state.isValidMove(action), 'Action should be valid');
    });
    
    test('MonteCarloAgent: selectAction handles limited moves', function() {
        var state = new GameState();
        // Fill all but one cell
        for (var i = 0; i < 8; i++) {
            state.applyMove(i, i % 2 === 0 ? 'X' : 'O');
        }
        var action = MonteCarloAgent.selectAction(state);
        assertEquals(8, action, 'Should choose only available cell');
    });
    
    console.log('\n=== AlphaBetaAgent Tests ===');
    
    test('AlphaBetaAgent: selectAction returns valid move', function() {
        var state = new GameState();
        var action = AlphaBetaAgent.selectAction(state);
        assert(action >= 0 && action <= 8, 'Action should be 0-8');
        assert(state.isValidMove(action), 'Action should be valid');
    });
    
    test('AlphaBetaAgent: blocks winning move', function() {
        var state = new GameState();
        // X X _
        // _ _ _
        // _ _ _
        state.cells = [['X', 'X', ''], ['', '', ''], ['', '', '']];
        var action = AlphaBetaAgent.selectAction(state);
        assertEquals(2, action, 'Should block at position 2');
    });
    
    test('AlphaBetaAgent: takes winning move', function() {
        var state = new GameState();
        // O O _
        // X _ _
        // X _ _
        state.cells = [['O', 'O', ''], ['X', '', ''], ['X', '', '']];
        var action = AlphaBetaAgent.selectAction(state);
        assertEquals(2, action, 'Should win at position 2');
    });
    
    console.log('\n=== StorageManager Tests ===');
    
    test('StorageManager: save and load work correctly', function() {
        StorageManager.save('test_key', { foo: 'bar', num: 42 });
        var loaded = StorageManager.load('test_key');
        assertEquals('bar', loaded.foo, 'String value');
        assertEquals(42, loaded.num, 'Number value');
        StorageManager.remove('test_key');
    });
    
    test('StorageManager: load returns null for missing key', function() {
        var result = StorageManager.load('nonexistent_key_xyz');
        assert(result === null, 'Should return null');
    });
    
    console.log('\n=== Test Summary ===');
    console.log('Passed: ' + passed);
    console.log('Failed: ' + failed);
    console.log('Total: ' + (passed + failed));
    
})();
