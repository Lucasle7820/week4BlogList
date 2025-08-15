const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

let token = null

beforeEach(async () => {
  // clear DB
  await User.deleteMany({})
  await Blog.deleteMany({})

  // create a test user
  const passwordHash = await bcrypt.hash('sekret5', 10)
  const user = new User({ username: 'root2', name: 'Superuser', passwordHash })
  await user.save()

  // login to get token
  const loginRes = await api
    .post('/api/login')
    .send({ username: 'root2', password: 'sekret5' })

  token = loginRes.body.token
  if (!token) throw new Error('No token returned from /api/login in beforeEach')

  const blogsToInsert = helper.initialBlogs.map(b => ({ ...b, user: user._id }))
  await Blog.insertMany(blogsToInsert)
})

test('successfully creates a valid blog when token is provided', async () => {
  const newBlog = {
    title: 'async/await simplifies async code',
    author: 'Something',
    url: 'http://example.com'
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(b => b.title)
  expect(titles).toContain('async/await simplifies async code')
})

test('fails with 401 Unauthorized if token is missing', async () => {
  const newBlog = {
    title: 'no auth blog',
    author: 'Intruder',
    url: 'http://hacker.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog) //
    .expect(401)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

afterAll(async () => {
  await mongoose.connection.close()
})