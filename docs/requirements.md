# Requirements Document

## 1. Functional Requirements

### 1.1 Mapped to Stakeholders

| ID | Requirement | Stakeholder |
|----|-------------|-------------|
| FR1 | Display 3x3 game board | Players |
| FR2 | Detect win/draw conditions | Players |
| FR3 | Monte Carlo RL agent | Students, Instructors |
| FR4 | Alpha-Beta baseline agent | Students |
| FR5 | Display game statistics | Players, Students |
| FR6 | Adjustable difficulty settings | Students |
| FR7 | Track learning progress | Students, Instructors |

### 1.2 General Functional Requirements

| ID | Requirement |
|----|-------------|
| GFR1 | Persist learning data across sessions |
| GFR2 | Self-play training mode |
| GFR3 | Reset learning/statistics |
| GFR4 | Switch between AI agents |
| GFR5 | Choose starting player |

### 1.3 Detailed Requirements

**FR1: Game Board Display**
- Display 3×3 grid of cells
- Show 'X' for human moves, 'O' for AI moves
- Highlight winning line when game ends
- Cells must be clickable when it's human's turn

**FR2: Win/Draw Detection**
- Detect 3-in-a-row horizontally (3 patterns)
- Detect 3-in-a-row vertically (3 patterns)
- Detect 3-in-a-row diagonally (2 patterns)
- Detect draw when board is full with no winner

**FR3: Monte Carlo RL Agent**
- Implement first-visit Monte Carlo algorithm
- Use epsilon-greedy action selection
- Store Q-values in returns table
- Learn from complete episodes
- Persist Q-table to localStorage

**FR4: Alpha-Beta Agent**
- Implement minimax algorithm
- Apply alpha-beta pruning optimization
- Adjustable search depth per difficulty
- Serve as optimal play baseline

**FR5: Statistics Display**
- Track wins, losses, draws
- Calculate and display win rate
- Show visual progress bar

**FR6: Settings**
- Difficulty: Easy (ε=0.7), Medium (ε=0.3), Hard (ε=0.1)
- AI Opponent: Monte Carlo or Alpha-Beta
- Starting Player: Human or AI

**FR7: Learning Progress**
- Display number of states explored
- Update after each game and training

## 2. Non-Functional Requirements

| ID | Category | Requirement | Metric |
|----|----------|-------------|--------|
| NFR1 | Performance | AI move response time | < 100ms |
| NFR2 | Performance | Training speed | 100 games < 2s |
| NFR3 | Usability | Browser compatibility | Chrome, Firefox, Safari, Edge |
| NFR4 | Usability | Responsive design | Works on desktop and tablet |
| NFR5 | Reliability | Data persistence | Survives page refresh |
| NFR6 | Reliability | Error handling | No crashes during gameplay |

## 3. Use Cases

### UC1: Play Game
**Actor:** Player
**Flow:**
1. Player opens the application
2. System displays empty board
3. Player clicks a cell
4. System validates and applies move
5. System checks for terminal state
6. If not terminal, AI makes move
7. Repeat 3-6 until game ends
8. System shows result and updates statistics

### UC2: Train AI
**Actor:** Player
**Flow:**
1. Player enters number of training games
2. Player clicks Train button
3. System runs self-play games
4. System updates Q-table after each game
5. System updates learning progress display

### UC3: Change Settings
**Actor:** Player
**Flow:**
1. Player selects new difficulty/opponent/starter
2. System updates internal settings
3. System persists settings to localStorage
4. Changes take effect on next game

### UC4: Reset Learning
**Actor:** Player
**Flow:**
1. Player clicks Reset Learning button
2. System asks for confirmation
3. If confirmed, system clears Q-table and statistics
4. System updates displays
