//CODE: src/server.js
const express = require('express');
const { getNextMove } = require('./ai.js');

const app = express();
app.use(express.json());

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

//TEST: test/server_test.js
const { expect } = require('chai');
const request = require('supertest');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('GET /api/next-move', () => {
  let getNextMoveStub;
  let app;

  const mountApp = () => {
    getNextMoveStub = sinon.stub();
    app = proxyquire('../src/server', {
      './ai': { getNextMove: getNextMoveStub },
    });
  };

  beforeEach(() => {
    mountApp();
  });

  it('returns the JSON output from getNextMove', async () => {
    const board = ['X', null, 'O', null, 'X', null, 'O', null, null];
    const nextMoveResult = { index: 8, symbol: 'X' };
    getNextMoveStub.returns(nextMoveResult);

    const response = await request(app)
      .get('/api/next-move')
      .send({ board })
      .expect(200);

    expect(response.body).to.deep.equal(nextMoveResult);
    sinon.assert.calledOnce(getNextMoveStub);
    const passedBoard = getNextMoveStub.firstCall.args[0];
    expect(passedBoard).to.deep.equal(board);
  });

  it('returns 400 when board data is invalid', async () => {
    await request(app)
      .get('/api/next-move')
      .send({ board: ['X', 'O'] })
      .expect(400);
    sinon.assert.notCalled(getNextMoveStub);
  });

  it('returns 500 when getNextMove throws an error', async () => {
    const board = ['X', null, 'O', null, 'X', null, 'O', null, null];
    getNextMoveStub.throws(new Error('test failure'));

    const response = await request(app)
      .get('/api/next-move')
      .send({ board })
      .expect(500);

    expect(response.body).to.have.property(
      'error',
      'Unable to determine next move'
    );
  });
});