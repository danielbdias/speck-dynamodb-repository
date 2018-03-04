const isNull = (value) => value === null || value === undefined

const valueToDatabase = (value, type) => {
  if (isNull(value)) {
    return { NULL: true }
  }

  switch (type) {
    case 'number':
      return { N: value.toString() }
    case 'string':
      return { S: value }
    case 'date':
      if (typeof value === 'string') return { N: value }
      if (typeof value === 'number') return { N: value.toString() }

      return { N: value.getTime().toString() }
    case 'object':
      return { S: JSON.stringify(value) }
    default:
      throw new Error(`Invalid value type [${type}].`)
  }
}

const valueToEntity = (value, type) => {
  if (isNull(value) || value.NULL) {
    return null
  }

  switch (type) {
    case 'number':
      return parseInt(value.N, 10)
    case 'string':
      return value.S
    case 'date':
      return new Date(parseInt(value.N, 10))
    case 'object':
      return JSON.parse(value.S)
    default:
      throw new Error(`Invalid value type [${type}].`)
  }
}

class BaseMapper {
  constructor (typeMap, EntityType) {
    this.typeMap = typeMap
    this.EntityType = EntityType

    this.getEntityAttributes = this.getEntityAttributes.bind(this)
    this.toDatabase = this.toDatabase.bind(this)
    this.toEntity = this.toEntity.bind(this)
  }

  getEntityAttributes () {
    return Object.keys(this.typeMap)
  }

  toDatabase (entity, field = null) {
    if (field) {
      return valueToDatabase(entity[field], this.typeMap[field])
    }

    return this.getEntityAttributes()
            .reduce((accumulator, key) => {
              const translatedValue = valueToDatabase(entity[key], this.typeMap[key])
              return Object.assign(accumulator, { [key]: translatedValue })
            },
            {})
  }

  toEntity (databaseItem, field = null) {
    if (field) {
      return valueToEntity(databaseItem[field], this.typeMap[field])
    }

    const rawEntityValue = this.getEntityAttributes()
      .reduce((accumulator, key) => {
        const translatedValue = valueToEntity(databaseItem[key], this.typeMap[key])
        return Object.assign(accumulator, { [key]: translatedValue })
      },
      {})

    return new this.EntityType(rawEntityValue)
  }
}

module.exports = BaseMapper
