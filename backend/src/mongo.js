import mongoose from 'mongoose'
import { MONGODB_URI } from './utils/config.js'
import logger from './utils/logger.js'

mongoose.set('strictQuery', false)

logger.info('Connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB')
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message)
  })
