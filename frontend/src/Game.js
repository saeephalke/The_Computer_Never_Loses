import React, { useEffect, useRef, useState } from 'react';

const API_URL = 'http://localhost:3000/api/next-move';
const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const calculateWinner = (cells) => {
  for (const [a, b, c] of WINNING_LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a];
    }
  }
  return null;
};

const getEmptyIndices = (cells) =>
  cells.reduce((acc, cell, idx) => (cell === null ? acc.concat(idx) : acc), []);

export default function Game() {
  const [board, setBoard] = useState(() => Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState('X');
  const [isComputing, setIsComputing] = useState(true);
  const [status, setStatus] = useState("Computer's turn");
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ computer: 0, player: 0 });
  const [lastMove, setLastMove] = useState(null);
  const aiRequestIdRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem('tttScores');
      if (stored) {
        const parsed = JSON.parse(stored);
        setScores({
          computer: Number(parsed?.computer) || 0,
          player: Number(parsed?.player) || 0,
        });
      }
    } catch (error) {
      console.warn('Unable to load stored scores', error);
    }
  }, []);

  useEffect(() => {
    if (lastMove === null) return;
    evaluateBoard(board, lastMove);
    setLastMove(null);
  }, [board, lastMove]);

  useEffect(() => {
    if (currentTurn === 'X' && !winner) {
      requestComputerMove();
    }
  }, [currentTurn, winner]);

  const evaluateBoard = (currentBoard, symbolJustPlayed) => {
    const win = calculateWinner(currentBoard);

    if (win) {
      setWinner(win);
      setStatus(win === 'X' ? 'Computer wins!' : 'You win!');
      setCurrentTurn(null);
      setIsComputing(false);
      setScores((prev) => {
        const updated = {
          computer: win === 'X' ? prev.computer + 1 : prev.computer,
          player: win === 'O' ? prev.player + 1 : prev.player,
        };
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('tttScores', JSON.stringify(updated));
        }
        return updated;
      });
      return;
    }

    if (currentBoard.every((cell) => cell !== null)) {
      setWinner('draw');
      setStatus("It's a draw!");
      setCurrentTurn(null);
      setIsComputing(false);
      return;
    }

    const nextTurn = symbolJustPlayed === 'X' ? 'O' : 'X';
    setWinner(null);
    setCurrentTurn(nextTurn);
    setStatus(nextTurn === 'X' ? "Computer's turn" : 'Your turn');
    setIsComputing(nextTurn === 'X');
  };

  const placeSymbol = (index, symbol) => {
    if (winner) return;
    let applied = false;

    setBoard((prev) => {
      if (prev[index] !== null) return prev;
      applied = true;
      const next = [...prev];
      next[index] = symbol;
      return next;
    });

    if (applied) {
      setLastMove(symbol);
    }
  };

  const requestComputerMove = async () => {
    const available = getEmptyIndices(board);
    if (!available.length) {
      setIsComputing(false);
      return;
    }

    const requestId = ++aiRequestIdRef.current;
    setIsComputing(true);
    setStatus('Computer is thinking...');

    try {
      const response = await fetch(API_URL, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({ board }),
      });

      if (!response.ok) throw new Error('API returned an error');

      const data = await response.json();
      let moveIndex =
        typeof data.index === 'number'
          ? data.index
          : typeof data.move === 'number'
          ? data.move
          : data.position;

      if (typeof moveIndex !== 'number' || board[moveIndex] !== null) {
        moveIndex = available[Math.floor(Math.random() * available.length)];
      }

      if (requestId !== aiRequestIdRef.current) return;
      placeSymbol(moveIndex, 'X');
    } catch (error) {
      console.error('Falling back to random AI move:', error);
      if (requestId !== aiRequestIdRef.current) return;

      if (available.length) {
        const fallbackIndex =
          available[Math.floor(Math.random() * available.length)];
        placeSymbol(fallbackIndex, 'X');
      } else {
        setIsComputing(false);
      }
    }
  };

  const handleCellClick = (index) => {
    if (isComputing || currentTurn !== 'O' || winner) return;
    if (board[index] !== null) return;
    placeSymbol(index, 'O');
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setStatus("Computer's turn");
    setCurrentTurn('X');
    setIsComputing(true);
    setLastMove(null);
    aiRequestIdRef.current += 1; // invalidate any in-flight AI responses
  };

  return (
    <div className="app">
      <div className="scoreboard">
        <div>
          Computer (X): <span className="score score--x">{scores.computer}</span>
        </div>
        <div>
          You (O): <span className="score score--o">{scores.player}</span>
        </div>
      </div>

      <h1 className="title">Tic-Tac-Toe</h1>
      <p className="status">{status}</p>

      <div className="board">
        {board.map((cell, idx) => (
          <button
            key={idx}
            className={`cell ${
              cell === 'X' ? 'cell--x' : cell === 'O' ? 'cell--o' : ''
            }`}
            onClick={() => handleCellClick(idx)}
            disabled={Boolean(cell) || isComputing || Boolean(winner)}
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="actions">
        <button className="reset" onClick={handleReset}>
          Start New Round
        </button>
      </div>
    </div>
  );
}

