// Get references to DOM elements
const gameModeScreen = document.getElementById('game-mode-screen');
const gameScreen = document.getElementById('game-screen');
const startGameButton = document.getElementById('start-game-button');
const backToModeSelectionButton = document.getElementById('back-to-mode-selection');

const statusDisplay = document.getElementById('status-display');
const gameBoard = document.getElementById('game-board');
const resetButton = document.getElementById('reset-button');
const cells = document.querySelectorAll('.board-cell');
const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');

// Game state variables
let board = ['', '', '', '', '', '', '', '', '']; // Represents the 9 cells
let currentPlayer = 'X'; // 'X' or 'O'
let gameActive = true; // True if the game is ongoing
let gameMode = 'human-human'; // Default mode: 'human-human' or 'human-computer'

// Define all possible winning combinations (indices of the board array)
const winningCombinations = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal from top-left
    [2, 4, 6]  // Diagonal from top-right
];

/**
 * Updates the status display message.
 * @param {string} message - The message to display.
 */
function updateStatus(message) {
    statusDisplay.textContent = message;
}

/**
 * Initializes or resets the game to its starting state.
 */
function initializeGame() {
    board = ['', '', '', '', '', '', '', '', '']; // Clear the board array
    currentPlayer = 'X'; // Always start with Player X
    gameActive = true; // Set game as active
    updateStatus(`Player ${currentPlayer}'s Turn`); // Update status display

    // Clear all cell contents and remove styling
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'win-highlight'); // Remove player marks and highlight
    });
}

/**
 * Handles a click event on a game board cell.
 * @param {Event} event - The click event object.
 */
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.cellIndex); // Get the index from data attribute

    // If the cell is already filled, the game is not active, or it's the computer's turn, do nothing
    if (board[clickedCellIndex] !== '' || !gameActive || (gameMode === 'human-computer' && currentPlayer === 'O')) {
        return;
    }

    // Update the board array and the cell's content
    board[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase()); // Add 'x' or 'o' class for styling

    // Check for a win or a draw
    if (checkForWin()) {
        updateStatus(`Player ${currentPlayer} Wins!`);
        gameActive = false;
        return; // Game ended
    }

    if (checkForDraw()) {
        updateStatus("It's a Draw!");
        gameActive = false;
        return; // Game ended
    }

    // Switch to the next player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus(`Player ${currentPlayer}'s Turn`);

    // If in Human vs Computer mode and it's now the computer's turn
    if (gameMode === 'human-computer' && currentPlayer === 'O' && gameActive) {
        // Add a small delay for better user experience
        setTimeout(makeComputerMove, 700); // 700ms delay for computer's move
    }
}

/**
 * Checks if the current player has won the game.
 * @returns {boolean} True if the current player has won, false otherwise.
 */
function checkForWin() {
    let roundWon = false;
    for (let i = 0; i < winningCombinations.length; i++) {
        const winCondition = winningCombinations[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];

        // If any cell in the combination is empty, continue to the next combination
        if (a === '' || b === '' || c === '') {
            continue;
        }
        // If all three cells match the current player's mark, a win is found
        if (a === b && b === c) {
            roundWon = true;
            // Add highlight class to winning cells
            winCondition.forEach(index => {
                cells[index].classList.add('win-highlight');
            });
            break; // Exit loop as soon as a win is found
        }
    }
    return roundWon;
}

/**
 * Checks if the game is a draw.
 * @returns {boolean} True if the game is a draw, false otherwise.
 */
function checkForDraw() {
    // If the board is full and no one has won, it's a draw
    return !checkForWin() && board.every(cell => cell !== '');
}

/**
 * Computer's AI logic to make a move.
 * The computer plays as 'O'.
 */
function makeComputerMove() {
    if (!gameActive) return;

    const availableCells = board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);

    if (availableCells.length === 0) {
        // This case should ideally be caught by checkForDraw earlier, but as a safeguard
        checkForDraw();
        return;
    }

    let bestMove = -1;
    const computerPlayer = 'O';
    const humanPlayer = 'X';

    // Helper function to check for a potential winning/blocking move
    function findWinningOrBlockingMove(playerToCheck) {
        for (let i = 0; i < winningCombinations.length; i++) {
            const [a, b, c] = winningCombinations[i];
            const line = [board[a], board[b], board[c]];

            // Check for two of playerToCheck's marks and one empty cell
            if (line.filter(cell => cell === playerToCheck).length === 2 && line.includes('')) {
                if (board[a] === '' && playerToCheck === board[b] && playerToCheck === board[c]) return a;
                if (board[b] === '' && playerToCheck === board[a] && playerToCheck === board[c]) return b;
                if (board[c] === '' && playerToCheck === board[a] && playerToCheck === board[b]) return c;
            }
        }
        return -1;
    }

    // 1. Check for winning move (for computer 'O')
    bestMove = findWinningOrBlockingMove(computerPlayer);

    // 2. Check for blocking move (for human 'X')
    if (bestMove === -1) {
        bestMove = findWinningOrBlockingMove(humanPlayer);
    }

    // 3. Take center if available
    if (bestMove === -1 && board[4] === '') {
        bestMove = 4;
    }

    // 4. Take opposite corner if human took a corner (and center is taken or not available)
    if (bestMove === -1) {
        if (board[0] === humanPlayer && board[8] === '') bestMove = 8;
        else if (board[2] === humanPlayer && board[6] === '') bestMove = 6;
        else if (board[6] === humanPlayer && board[2] === '') bestMove = 2;
        else if (board[8] === humanPlayer && board[0] === '') bestMove = 0;
    }

    // 5. Take an empty corner
    if (bestMove === -1) {
        const corners = [0, 2, 6, 8];
        for (let i = 0; i < corners.length; i++) {
            if (board[corners[i]] === '') {
                bestMove = corners[i];
                break;
            }
        }
    }

    // 6. Take any empty side
    if (bestMove === -1) {
        const sides = [1, 3, 5, 7];
        for (let i = 0; i < sides.length; i++) {
            if (board[sides[i]] === '') {
                bestMove = sides[i];
                break;
            }
        }
    }

    // Fallback: if no strategic move, pick a random available cell
    if (bestMove === -1 && availableCells.length > 0) {
        bestMove = availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    // If a valid move is found, execute it
    if (bestMove !== -1) {
        const cellToUpdate = cells[bestMove];
        board[bestMove] = computerPlayer;
        cellToUpdate.textContent = computerPlayer;
        cellToUpdate.classList.add(computerPlayer.toLowerCase());

        if (checkForWin()) {
            updateStatus(`Player ${computerPlayer} Wins!`);
            gameActive = false;
            return;
        }

        if (checkForDraw()) {
            updateStatus("It's a Draw!");
            gameActive = false;
            return;
        }

        // Switch back to human player
        currentPlayer = humanPlayer;
        updateStatus(`Player ${currentPlayer}'s Turn`);
    }
}

/**
 * Shows the game mode selection screen and hides the game screen.
 */
function showModeSelectionScreen() {
    gameModeScreen.classList.remove('hidden-screen');
    gameScreen.classList.add('hidden-screen');
    // Ensure Human vs Human is selected by default when returning
    document.querySelector('input[name="gameMode"][value="human-human"]').checked = true;
    gameMode = 'human-human'; // Reset game mode
    initializeGame(); // Also reset the game board state when returning to selection screen
}

/**
 * Shows the game screen and hides the game mode selection screen.
 */
function showGameScreen() {
    gameModeScreen.classList.add('hidden-screen');
    gameScreen.classList.remove('hidden-screen');
    // Get the selected game mode before starting the game
    gameMode = document.querySelector('input[name="gameMode"]:checked').value;
    initializeGame(); // Initialize game with the selected mode
}

// Add event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
// Changed this line: Reset Game button now goes back to mode selection
resetButton.addEventListener('click', showModeSelectionScreen);
startGameButton.addEventListener('click', showGameScreen);
backToModeSelectionButton.addEventListener('click', showModeSelectionScreen);

// Add event listeners for game mode selection (only to update the internal gameMode variable)
gameModeRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        // This listener now only updates the gameMode variable,
        // the actual game initialization happens when 'Start Game' is clicked.
    });
});

// Initially show the mode selection screen when the page loads
document.addEventListener('DOMContentLoaded', showModeSelectionScreen);
