const express = require('express')
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const {
  requestLogger,
  unknownEndpoint,
  errorHandler
} = require('./utils/middleware')
require('./mongo')   // just run the mongo.js file

const app = express()

app.use(cors())
app.use(express.json())
app.use(requestLogger)

app.use('/api/blogs', blogsRouter)

app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app
