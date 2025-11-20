//TEST: test/server_test.js
import { expect } from 'chai';
import request from 'supertest';
import proxyquire from 'proxyquire';
import { stub, assert } from 'sinon';

describe('GET /api/next-move', () => {
  let getNextMoveStub;
  let app;

  const mountApp = () => {
    getNextMoveStub = stub();
    app = proxyquire('../src/server', {
      './ai.js': { getNextMove: getNextMoveStub },
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
    assert.calledOnce(getNextMoveStub);
    const passedBoard = getNextMoveStub.firstCall.args[0];
    expect(passedBoard).to.deep.equal(board);
  });

  it('returns 400 when board data is invalid', async () => {
    await request(app)
      .get('/api/next-move')
      .send({ board: ['X', 'O'] })
      .expect(400);
    assert.notCalled(getNextMoveStub);
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