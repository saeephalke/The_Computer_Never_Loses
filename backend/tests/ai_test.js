// File: tests/ai_tests.js
import { strictEqual } from 'assert';
import { getNextMove } from '../src/ai.js';

describe('Tic Tac Toe AI', () => {
  it('should take the center on the opening move', () => {
    const board = ['X', null, null, null, null, null, null, null, null];
    strictEqual(getNextMove(board), 4);
  });

  it('should win immediately if possible', () => {
    const board = ['X', 'X', null, 'O', 'O', null, null, null, null];
    strictEqual(getNextMove(board), 2);
  });

  it('should block opponent winning move', () => {
    const board = ['X', null, null, 'O', 'O', null, 'X', null, null];
    strictEqual(getNextMove(board), 5);
  });

  it('should take the last remaining spot to draw', () => {
    const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null];
    strictEqual(getNextMove(board), 8);
  });

  it('should throw an error for invalid board length', () => {
    const board = ['X', 'O', null];
    try {
      getNextMove(board);
    } catch (e) {
      strictEqual(e.message, 'Board must be an array of length 9.');
    }
  });

    it('should throw an error when no valid moves are available', () => {
        const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
        try {
        getNextMove(board);
        } catch (e) {
        strictEqual(e.message, 'No valid moves available.');
        }
    });
});