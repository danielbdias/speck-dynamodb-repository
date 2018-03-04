const config = {
  region: null,
  accessKeyId: null,
  secretAccessKey: null
}

function initialize ({ region, accessKeyId, secretAccessKey }) {
  if (!region) {
    throw new Error('You must set at least the AWS region in the configuration!')
  }

  Object.assign(config, { region, accessKeyId, secretAccessKey })

  return
}

initialize.config = config

module.exports = initialize
