// File: examples/ai_example.js (relative to the project root)

const { getNextMove, minimax } = require('../ai.js');

/**
 * Demonstrates how to ask the AI for its next move.
 *
 * @param {Array<string|null>} board
 *   A 9-element array representing the board in row-major order.
 *   Each cell is either:
 *     - 'X' for the AI’s moves,
 *     - 'O' for the human player’s moves, or
 *     - null for an empty spot.
 * @returns {void}
 *   Prints the chosen move and an updated board preview.
 */
function showcaseNextMove(board) {
  const nextIndex = getNextMove(board);
  console.log('Current board:', board);
  console.log('AI recommends playing at index:', nextIndex);

  const preview = [...board];
  preview[nextIndex] = 'X';
  console.log('Board after applying AI move:', preview, '\n');
}

/**
 * Shows how to access the lower-level minimax helper for custom analyses.
 *
 * @param {Array<string|null>} board
 *   Same board representation as in showcaseNextMove.
 * @param {boolean} isMaximizing
 *   true to evaluate from the AI (X) perspective, false for the human (O).
 * @returns {void}
 *   Prints the evaluated score and the recommended index for that perspective.
 */
function inspectMinimax(board, isMaximizing) {
  const analysis = minimax([...board], 0, isMaximizing);
  console.log(
    `Minimax (${isMaximizing ? 'AI' : 'Human'} perspective) =>`,
    analysis,
    '\n',
  );
}

// --- Example scenarios ---

// Opening move: AI should take the center.
showcaseNextMove([null, null, null, null, null, null, null, null, null]);

// Mid-game where AI can win immediately.
showcaseNextMove(['X', 'X', null, 'O', 'O', null, null, null, null]);

// Analyze a tense situation from both perspectives.
const trickyBoard = ['X', null, null, 'O', 'O', null, 'X', null, null];
inspectMinimax(trickyBoard, true);  // AI turn
inspectMinimax(trickyBoard, false); // Human turn