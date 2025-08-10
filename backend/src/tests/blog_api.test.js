const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const api = supertest(app)

beforeAll(async () => {
  await mongoose.connection.dropDatabase()
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('Blogs API', () => {

  describe('GET /api/blogs', () => {
    test('returns all blogs', async () => {
      const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('contains a specific blog title', async () => {
      const response = await api.get('/api/blogs')
      const titles = response.body.map(b => b.title)
      expect(titles).toContain('HTML is easy')
    })
  })

  describe('POST /api/blogs', () => {
    test('successfully creates a valid blog', async () => {
      const newBlog = {
        title: 'async/await simplifies making async calls',
        author: 'Test Author',
        url: 'http://example.com',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
      const titles = blogsAtEnd.map(b => b.title)
      expect(titles).toContain(newBlog.title)
    })

    test('defaults likes to 0 if missing', async () => {
      const newBlog = {
        title: 'Blog without likes',
        author: 'Jane Doe',
        url: 'http://example.com/no-likes',
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogs = await helper.blogsInDb()
      const savedBlog = blogs.find(blog => blog.title === newBlog.title)
      expect(savedBlog.likes).toBe(0)
    })

    test('responds with 400 if title is missing', async () => {
      const newBlog = {
        author: 'Author Only',
        url: 'http://example.com/no-title',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogs = await helper.blogsInDb()
      expect(blogs).toHaveLength(helper.initialBlogs.length)
    })

    test('responds with 400 if url is missing', async () => {
      const newBlog = {
        title: 'No URL Blog',
        author: 'Author Only',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogs = await helper.blogsInDb()
      expect(blogs).toHaveLength(helper.initialBlogs.length)
    })
  })

  describe('Blog model', () => {
    test('uses "id" instead of "_id" as identifier', async () => {
      const blogs = await helper.blogsInDb()
      const blog = blogs[0]
      expect(blog.id).toBeDefined()
      expect(blog._id).toBeUndefined()
    })
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('updating a blog', () => {
  test('succeeds in updating likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedData = { ...blogToUpdate, likes: blogToUpdate.likes + 1 }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(blogToUpdate.likes + 1)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[0].likes).toBe(blogToUpdate.likes + 1)
  })
})


afterAll(async () => {
  await mongoose.connection.close()
})
