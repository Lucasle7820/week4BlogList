const express = require('express')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')

const blogsRouter = express.Router()


blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1, id: 1 })
  res.json(blogs)
})

blogsRouter.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  if (!blog) {
    return res.status(404).end()
  }
  res.json(blog)
})

blogsRouter.post('/', userExtractor, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'user not authenticated' })
    }

    const blog = new Blog({ ...req.body, user: req.user._id })
    const savedBlog = await blog.save()

    req.user.blogs = (req.user.blogs || []).concat(savedBlog._id)
    await req.user.save()

    const populatedUser = await User.findById(req.user._id).populate('blogs')
    res.status(201).json(populatedUser)
  } catch (err) {
    next(err)
  }
})

blogsRouter.delete('/:id', userExtractor, async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  if (!blog) {
    return res.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== req.user.id.toString()) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  await Blog.findByIdAndDelete(req.params.id)
  res.status(204).end()
})

module.exports = blogsRouter
