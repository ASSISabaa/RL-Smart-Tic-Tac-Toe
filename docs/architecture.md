# Architecture Document

## Overview

The system uses **N-Tier + MVC Architecture** with four distinct layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER                   │
│                    UIController                      │
│      renderBoard() | handleClick() | updateStats()  │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                 APPLICATION LAYER                    │
│    GameEngine | SettingsManager | StatisticsManager │
│  startNewGame() | handleMove() | requestAIMove()    │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                      │
│       GameState | MonteCarloAgent | AlphaBetaAgent  │
│   applyMove() | selectAction() | updateReturns()    │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│               INFRASTRUCTURE LAYER                   │
│                   StorageManager                     │
│          save() | load() | remove() | clearAll()    │
└─────────────────────────────────────────────────────┘
```

## Dependency Direction

```
Presentation → Application → Domain ← Infrastructure
```

- Presentation calls Application layer methods
- Application coordinates Domain layer components
- Infrastructure provides data persistence to all layers

## Component Responsibilities

### UIController (Presentation)
| Attribute/Method | Description |
|------------------|-------------|
| renderBoard(board) | Update visual board display |
| handleClick(cell) | Process user cell clicks |
| updateStats(stats) | Update statistics panel |

### GameEngine (Application)
| Attribute/Method | Description |
|------------------|-------------|
| board: GameState | Current game board |
| currentPlayer | 'X' or 'O' |
| gameStatus | State machine state |
| episodeHistory | Episode for RL learning |
| startNewGame() | Initialize new game |
| handleMove(action) | Process human move |
| requestAIMove() | Trigger AI move |
| checkTerminal() | Check win/draw |

### SettingsManager (Application)
| Attribute/Method | Description |
|------------------|-------------|
| difficulty | easy/medium/hard |
| opponentType | montecarlo/alphabeta |
| explorationRate | ε for epsilon-greedy |
| startingPlayer | human/ai |

### StatisticsManager (Application)
| Attribute/Method | Description |
|------------------|-------------|
| wins, losses, draws | Game counters |
| recordResult(result) | Record game outcome |
| reset() | Clear all statistics |

### GameState (Domain Entity)
| Attribute/Method | Description |
|------------------|-------------|
| cells[3][3] | 2D board array |
| applyMove(action, player) | Apply move to board |
| isValidMove(action) | Check if move is valid |
| checkWinner() | Detect winner |
| isTerminal() | Check if game ended |

### MonteCarloAgent (Domain Service)
| Attribute/Method | Description |
|------------------|-------------|
| returnsTable | Q-value storage |
| selectAction(state) | Choose action (ε-greedy) |
| updateReturns(episode, reward) | Learn from episode |

### AlphaBetaAgent (Domain Service)
| Attribute/Method | Description |
|------------------|-------------|
| maxDepth | Search depth limit |
| selectAction(state) | Find best move |
| minimax(state, depth, α, β) | Minimax algorithm |

### StorageManager (Infrastructure)
| Method | Description |
|--------|-------------|
| save(key, data) | Store JSON data |
| load(key) | Retrieve JSON data |
| remove(key) | Delete key |
| clearAll() | Clear all app data |

## State Machine (GameEngine)

```
                    ┌──────────┐
                    │   IDLE   │
                    └────┬─────┘
                         │ startNewGame()
                         ▼
         ┌───────────────────────────────┐
         │                               │
         ▼                               │
    ┌──────────┐                    ┌────┴─────┐
    │  HUMAN   │◄──────────────────│   AI     │
    │  TURN    │                   │  TURN    │
    └────┬─────┘                   └────┬─────┘
         │ handleMove()                 │ requestAIMove()
         │                              │
         ▼                              ▼
    ┌─────────────────────────────────────┐
    │           CHECK_TERMINAL             │
    └──────────────────┬──────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │ not terminal│             │ terminal
         │             ▼             │
         │     (switch turn)         ▼
         │                    ┌───────────┐
         └────────────────────│ GAME_OVER │
                              └───────────┘
```

## Data Flow Example

1. User clicks cell 4
2. UIController.handleClick(4)
3. GameEngine.handleMove(4)
4. GameState.applyMove(4, 'X')
5. GameEngine.checkTerminal()
6. GameEngine.requestAIMove()
7. MonteCarloAgent.selectAction(state)
8. GameState.applyMove(action, 'O')
9. Event: 'boardUpdate'
10. UIController.renderBoard()

## Why This Architecture?

1. **Separation of Concerns** - Each layer has single responsibility
2. **Testability** - Domain logic testable without UI
3. **Maintainability** - Changes isolated to single layer
4. **Clarity** - Clear structure for team collaboration
