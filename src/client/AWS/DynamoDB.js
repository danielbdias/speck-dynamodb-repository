const dependencies = {
  DynamoDB: require('aws-sdk').DynamoDB,
  config: require('../../initialize').config,
  Promisify: require('../Promisify')
}

const DynamoDBClient = {
  putItem ({ table, item }, injection) {
    return getInstance(injection).putItem({
      TableName: table,
      Item: item
    })
  },
  deleteItem ({ table, key }, injection) {
    return getInstance(injection).deleteItem({
      TableName: table,
      Key: key
    })
  },
  getItem ({ table, key }, injection) {
    return getInstance(injection).getItem({
      TableName: table,
      Key: key
    })
  },
  scan ({ table, attributes, filter }, injection) {
    const params = {
      TableName: table,
      AttributesToGet: attributes
    }

    if (filter) {
      Object.assign(params, { ScanFilter: filter })
    }

    return getInstance(injection).scan(params)
  }
}

function getInstance (injection) {
  const { DynamoDB, Promisify, config } = Object.assign({}, dependencies, injection)

  if (DynamoDBClient.instance) {
    return DynamoDBClient.instance
  }

  DynamoDBClient.instance = new Promisify({
    ClassToBuild: DynamoDB,
    methodsToPromisify: ['putItem', 'deleteItem', 'getItem', 'scan'],
    constructorParameters: config
  })

  return DynamoDBClient.instance
}

module.exports = DynamoDBClient
