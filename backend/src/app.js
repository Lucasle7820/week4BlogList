import express from 'express'
import cors from 'cors'
import blogsRouter from './controllers/blogs.js'
import { requestLogger, unknownEndpoint, errorHandler } from './utils/middleware.js'
import './mongo.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(requestLogger)

app.use('/api/blogs', blogsRouter)

app.use(unknownEndpoint)
app.use(errorHandler)

export default app
