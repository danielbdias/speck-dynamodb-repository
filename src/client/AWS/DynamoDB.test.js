const { mock, assert } = require('sinon')
const { expect } = require('chai')

describe('DynamoDB Client', function () {
  beforeEach(function () {
    delete require.cache[require.resolve('./DynamoDB')]

    this.DynamoDBClient = require('./DynamoDB')
    this.parameters = {
      table: 'the table',
      item: 'the item'
    }

    this.dependencies = {
      DynamoDB: null,
      Promisify: mock(),
      config: { region: 'anyValue' }
    }

    const dynamoPromisified = {
      putItem: mock()
        .thrice()
        .withExactArgs({
          TableName: this.parameters.table,
          Item: this.parameters.item
        })
        .resolves('the result')
    }

    this.dependencies.Promisify
      .withExactArgs({
        ClassToBuild: this.dependencies.DynamoDB,
        methodsToPromisify: ['putItem'],
        constructorParameters: this.dependencies.config
      })
      .returns(dynamoPromisified)
  })

  it('returns putItem call value', function () {
    return this.DynamoDBClient.putItem(this.parameters, this.dependencies)
      .then(result => expect(result).to.equal('the result'))
  })

  it('instantiate Promisify just once for more calls', function () {
    return this.DynamoDBClient.putItem(this.parameters, this.dependencies)
      .then(() => this.DynamoDBClient.putItem(this.parameters, this.dependencies))
      .then(() => assert.calledOnce(this.dependencies.Promisify))
  })
})
