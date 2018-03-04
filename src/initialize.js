const config = {
  region: null,
  accessKeyId: null,
  secretAccessKey: null
}

function initialize (configuration) {
  Object.assign(config, configuration)

  if (!config) {
    throw new Error('You must set at least the AWS region in the configuration!')
  }

  return
}

initialize.config = config

module.exports = initialize
