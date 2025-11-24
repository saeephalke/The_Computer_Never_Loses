//TEST: test/server_test.js
const { expect } = require('chai');
const request = require('supertest');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('POST /api/next-move', () => {
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