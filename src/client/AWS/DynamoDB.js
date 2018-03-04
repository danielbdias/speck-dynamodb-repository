const dependencies = {
  DynamoDB: require('aws-sdk').DynamoDB,
  config: require('../../initialize').config
}

const DynamoDBClient = {
  putItem ({ table, item }, injection) {
    return getInstance(injection)
      .putItem({
        TableName: table,
        Item: item
      })
      .promise()
  },
  deleteItem ({ table, key }, injection) {
    return getInstance(injection)
      .deleteItem({
        TableName: table,
        Key: key
      })
      .promise()
  },
  getItem ({ table, key }, injection) {
    return getInstance(injection)
      .getItem({
        TableName: table,
        Key: key
      })
      .promise()
  },
  scan ({ table, attributes, filter }, injection) {
    const params = {
      TableName: table,
      AttributesToGet: attributes
    }

    if (filter) {
      Object.assign(params, { ScanFilter: filter })
    }

    return getInstance(injection)
      .scan(params)
      .promise()
  }
}

function getInstance (injection) {
  const { DynamoDB, config } = Object.assign({}, dependencies, injection)

  if (DynamoDBClient.instance) {
    return DynamoDBClient.instance
  }

  DynamoDBClient.instance = new DynamoDB(config)

  return DynamoDBClient.instance
}

module.exports = DynamoDBClient
