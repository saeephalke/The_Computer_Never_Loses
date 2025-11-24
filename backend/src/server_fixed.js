const express = require('express');
const { getNextMove } = require('./ai');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const isValidBoard = (board) =>
  Array.isArray(board) &&
  board.length === 9 &&
  board.every((cell) => cell === 'X' || cell === 'O' || cell === null);

app.get('/api/next-move', (req, res) => {
  const { board } = req.body || {};

  if (!isValidBoard(board)) {
    return res.status(400).json({
      error:
        'Invalid board data. Provide an array of 9 elements containing "X", "O", or null.',
    });
  }

  try {
    const result = getNextMove(board);
    return res.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error determining next move:', error);
    return res.status(500).json({ error: 'Unable to determine next move' });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
