const dotenv = require('dotenv')
const path = require('path')

const env = process.env.NODE_ENV || 'development'

const envFileMap = {
  development: '.env',
  test: '.env.test',
  production: '.env.production'
}

const envFile = envFileMap[env]
dotenv.config({ path: path.resolve(process.cwd(), envFile) })

const PORT = process.env.PORT || 3001
const MONGODB_URI = process.env.MONGODB_URI

module.exports = {
  PORT,
  MONGODB_URI
}