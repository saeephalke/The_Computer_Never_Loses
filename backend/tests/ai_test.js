// File: tests/ai_tests.js
const assert = require('assert');
const { getNextMove } = require('../src/ai');

describe('Tic Tac Toe AI', () => {
  it('should select one of the corners on an empty board with variation', () => {
    const corners = [0, 2, 6, 8];
    const seen = new Set();
    for (let i = 0; i < 20; i += 1) {
      const board = Array(9).fill(null);
      const move = getNextMove(board);
      assert.ok(corners.includes(move), 'Opening move must be a corner');
      seen.add(move);
    }
    assert.ok(seen.size >= 2, 'AI should vary its corner selection over multiple runs');
  });

  it('should win immediately if possible', () => {
    const board = ['X', 'X', null, 'O', 'O', null, null, null, null];
    assert.strictEqual(getNextMove(board), 2);
  });

  it('should block opponent winning move', () => {
    const board = ['X', null, null, 'O', 'O', null, 'X', null, null];
    assert.strictEqual(getNextMove(board), 5);
  });

  it('should take the last remaining spot to draw', () => {
    const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null];
    assert.strictEqual(getNextMove(board), 8);
  });
});