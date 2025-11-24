// File: src/ai.js
const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const AI_PLAYER = 'X';
const HUMAN_PLAYER = 'O';

/**
 * Determine the winner of the current board.
 * @param {Array<string|null>} board
 * @returns {'X' | 'O' | 'draw' | null}
 */
function getWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every((cell) => cell !== null)) {
    return 'draw';
  }

  return null;
}

/**
 * Minimax algorithm to determine the optimal move.
 * @param {Array<string|null>} board
 * @param {number} depth
 * @param {boolean} isMaximizing
 * @returns {{ score: number, index: number|null }}
 */
function minimax(board, depth, isMaximizing) {
  const winner = getWinner(board);
  if (winner) {
    if (winner === AI_PLAYER) return { score: 10 - depth, index: null };
    if (winner === HUMAN_PLAYER) return { score: depth - 10, index: null };
    return { score: 0, index: null }; // Draw
  }

  const availableMoves = board
    .map((cell, idx) => (cell === null ? idx : null))
    .filter((idx) => idx !== null);

  let bestMove = { score: isMaximizing ? -Infinity : Infinity, index: null };

  for (const move of availableMoves) {
    board[move] = isMaximizing ? AI_PLAYER : HUMAN_PLAYER;
    const result = minimax(board, depth + 1, !isMaximizing);
    board[move] = null;

    if (isMaximizing) {
      if (result.score > bestMove.score) {
        bestMove = { score: result.score, index: move };
      }
    } else {
      if (result.score < bestMove.score) {
        bestMove = { score: result.score, index: move };
      }
    }
  }

  return bestMove;
}

/**
 * Compute the AI's next move (always playing X and going first).
 * @param {Array<string|null>} board
 * @returns {number} index of the best move
 */
function getNextMove(board) {
  if (!Array.isArray(board) || board.length !== 9) {
    throw new Error('Board must be an array of length 9.');
  }

  const move = minimax([...board], 0, true);
  if (move.index === null) {
    throw new Error('No valid moves available.');
  }

  return move.index;
}

module.exports = {
  getNextMove,
  minimax,
};