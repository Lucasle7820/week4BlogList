const mongoose = require('mongoose')
const User = require('./user')

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,  // must have title
  },
  author: String,
  url: {
    type: String,
    required: true,  // must have author
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  likes: {
    type: Number,
    default: 0
  }
})

blogSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
  }
})

const Blog = mongoose.model('Blog', blogSchema)
module.exports = Blog
