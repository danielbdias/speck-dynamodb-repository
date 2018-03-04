const dependencies = {
  DynamoClient: require('./client/AWS/DynamoDB'),
  uuid: require('uuid')
}

class Repository {
  constructor ({ tableName, primaryKey, mapper }, injection) {
    Object.assign(this, { tableName, primaryKey, mapper, injection })

    this.save = this.save.bind(this)
    this.delete = this.delete.bind(this)

    this.findOneById = this.findOneById.bind(this)
    this.findAll = this.findAll.bind(this)
    this.findAllByCriterias = this.findAllByCriterias.bind(this)
    this.findAllBy = this.findAllBy.bind(this)
  }

  save (entity) {
    const { DynamoClient, uuid } = Object.assign({}, dependencies, this.injection)

    if (!entity[this.primaryKey]) {
      entity[this.primaryKey] = uuid.v4()
    }

    if (!entity.valid) {
      return Promise.reject(
        new Error(`Could not insert record on ${this.tableName}. Errors: ${JSON.stringify(entity.errors)}`))
    }

    const item = this.mapper.toDatabase(entity)

    return DynamoClient.putItem({ table: this.tableName, item }, this.injection)
      .then(_ => entity)
  }

  delete (entity) {
    const { DynamoClient } = Object.assign({}, dependencies, this.injection)

    if (!entity[this.primaryKey]) {
      return Promise.resolve()
    }

    const key = {
      [this.primaryKey]: this.mapper.toDatabase(entity, this.primaryKey)
    }

    return DynamoClient.deleteItem({ table: this.tableName, key }, this.injection)
      .then(_ => true)
  }

  findOneById (entityId) {
    const { DynamoClient } = Object.assign({}, dependencies, this.injection)

    const key = {
      [this.primaryKey]: this.mapper.toDatabase({ [this.primaryKey]: entityId }, this.primaryKey)
    }

    return DynamoClient.getItem({ table: this.tableName, key }, this.injection)
      .then(data => this.mapper.toEntity(data.Item))
  }

  findOneByCriterias (criterias) {
    return this.findAllByCriterias(criterias)
      .then(items => items[0])
  }

  findAll () {
    return this.findAllBy()
  }

  findAllByCriterias (criterias) {
    const filter = Object.keys(criterias)
      .reduce((accumulator, entityField) => Object.assign(accumulator, {
        [entityField]: {
          AttributeValueList: [ this.mapper.toDatabase(criterias, entityField) ],
          ComparisonOperator: 'EQ'
        }
      }), {})

    return this.findAllBy({ filter })
  }

  findAllBy (option = {}) {
    const { DynamoClient } = Object.assign({}, dependencies, this.injection)

    const attributes = this.mapper.getEntityAttributes()

    const { filter, limit } = option

    return DynamoClient.scan({ table: this.tableName, attributes, filter, limit }, this.injection)
      .then(data => data.Items.map(item => this.mapper.toEntity(item)))
  }
}

module.exports = {
  for (tableName, primaryKey, mapper, composition = {}, injection) {
    const baseRepository = new Repository({ tableName, primaryKey, mapper })

    const boundMethods = Object.keys(composition).reduce((newMethods, methodName) => {
      newMethods[methodName] = composition[methodName].bind(baseRepository)
      return newMethods
    }, {})

    return Object.assign(baseRepository, boundMethods)
  }
}
