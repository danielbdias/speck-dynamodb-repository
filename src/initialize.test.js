const { expect } = require('chai')

const initialize = require('./initialize')

describe('initialize', () => {
  it('fails to initialize due the lack of data', () => {
    expect(() => initialize()).to.throw()
  })
})
