const { mock } = require('sinon')
const { expect } = require('chai')

const DynamoDBClient = require('./DynamoDB')

const setupDependencies = (DynamoMock) => {
  return {
    config: { region: 'anyValue' },
    DynamoDB: function (config) {
      expect(config).to.be.deep.equal({ region: 'anyValue' })
      return DynamoMock
    }
  }
}

describe('DynamoDB Client', function () {
  it('#putItem', function () {
    const input = {
      table: 'some table',
      item: 'some item'
    }

    const DynamoMock = {
      putItem: mock()
        .once()
        .withExactArgs({
          TableName: 'some table',
          Item: 'some item'
        })
        .returns({
          promise: mock().resolves('something')
        })
    }

    const dependencies = setupDependencies(DynamoMock)

    return DynamoDBClient.putItem(input, dependencies)
      .then(result => expect(result).to.be.equal('something'))
  })
})
