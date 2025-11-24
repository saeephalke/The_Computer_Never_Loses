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
  const [isComputing, setIsComputing] = useState(false);
  const [status, setStatus] = useState("Computer's turn");
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ computer: 0, player: 0 });
  const aiRequestIdRef = useRef(0);

  // 🔥 New: always keep latest board in a ref
  const boardRef = useRef(board);
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  // Load saved scores
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

  // AI moves automatically
  useEffect(() => {
    if (currentTurn === 'X' && !winner) {
      requestComputerMove();
    }
  }, [currentTurn, winner]);

  const evaluateBoard = (updatedBoard, symbolJustPlayed) => {
    const win = calculateWinner(updatedBoard);

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

    if (updatedBoard.every((cell) => cell !== null)) {
      setWinner('draw');
      setStatus("It's a draw!");
      setCurrentTurn(null);
      setIsComputing(false);
      return;
    }

    const nextTurn = symbolJustPlayed === 'X' ? 'O' : 'X';
    setCurrentTurn(nextTurn);
    setStatus(nextTurn === 'X' ? "Computer's turn" : 'Your turn');
    setIsComputing(nextTurn === 'X');
  };

  const placeSymbol = (index, symbol) => {
    if (winner) return;

    setBoard((prev) => {
      if (prev[index] !== null) return prev;

      const updated = [...prev];
      updated[index] = symbol;

      evaluateBoard(updated, symbol);

      return updated;
    });
  };

  const requestComputerMove = async () => {
    const latestBoard = boardRef.current;
    const available = getEmptyIndices(latestBoard);
    if (!available.length) return;

    const requestId = ++aiRequestIdRef.current;

    setIsComputing(true);
    setStatus('Computer is thinking...');

    try {
      const response = await fetch(API_URL, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({ board: latestBoard }), // 🔥 use ref instead of stale state
      });

      if (!response.ok) throw new Error('API returned an error');

      const data = await response.json();

      let moveIndex =
        typeof data.index === 'number'
          ? data.index
          : typeof data.move === 'number'
          ? data.move
          : data.position;

      let updatedBoard = boardRef.current;
      if (typeof moveIndex !== 'number' || updatedBoard[moveIndex] !== null) {
        console.warn("Invalid AI move from API, falling back to random.");
        moveIndex = available[Math.floor(Math.random() * available.length)];
      }

      if (requestId !== aiRequestIdRef.current) return;

      placeSymbol(moveIndex, 'X');
    } catch (error) {
      console.error('AI error - using random move:', error);

      if (requestId !== aiRequestIdRef.current) return;

      const fallbackIndex =
        available[Math.floor(Math.random() * available.length)];

      placeSymbol(fallbackIndex, 'X');
    }
  };

  const handleCellClick = (index) => {
    if (isComputing || currentTurn !== 'O' || winner) return;
    if (board[index] !== null) return;
    placeSymbol(index, 'O');
  };

  const handleReset = () => {
    aiRequestIdRef.current += 1;

    setBoard(Array(9).fill(null));
    setWinner(null);
    setStatus("Computer's turn");
    setIsComputing(false);

    setCurrentTurn('X'); // Computer starts
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
