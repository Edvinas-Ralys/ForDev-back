const Post = require(`../models/Post`)
const User = require(`../models/User`)
const asyncHandler = require(`express-async-handler`)
const writeImage = require(`../functions/writeImage`)

// .limit(n) returns maximum n number of items

const getAllPosts = asyncHandler(async (req, res) => {

  const posts = await Posts.find().select().limit(req.query.limit).skip(req.query.skip)
  const totalCount = await Post.countDocuments()
  // if (posts.length === 0 || !posts) {
  //   return res.status(400).json({ message: `No posts found` })
  // }
  res.json({posts, totalCount})
})


const createNewPost = asyncHandler(async (req, res) => {
  const {type, picture, title, user, createdBy, newPost, comments } = req.body



  //Confirm data
  if (!type || !title || !newPost || !user || !createdBy ) {
    return res.status(400).json({ message: `All fields are required` })
  }
  //Check for duplicates
  //Not needed

  const formatedPicture = writeImage(picture)

  const postObject = { type, picture:formatedPicture, title, user, createdBy, newPost, comments}

  const post = await Post.create(postObject)
  if (post) {
// console.log(post)
    res.status(201).json(post)
  } else {
    res.status(400).json({ message: `Invalid data` })
  }
})



const updatePost = asyncHandler(async (req, res) => {
  // console.log(req.body)
  const { editedPost, postId, userId } = req.body
  if (!editedPost || !userId) {
    res.status(400).json({ message: `Error, no data recieved` })
  }

  const post = await Post.findById(postId).exec()
  if (!post) {
    return res.status(400).json({ message: `Post not found` })
  }

  const duplicate = await Post.findOne({ postId }).lean().exec()
  if (duplicate && duplicate?.__id.toString() !== id) {
    return res.status(400).json({ message: `Post not found` })
  }

  post.editedPost = editedPost

  const updatePost = await post.save()
  res.json(updatePost)
})



const deletePost = asyncHandler(async (req, res) => {
  const { postId, userId } = req.body
  if (!postId || !userId) {
    return res.status(400).json({ message: `No ID recieved` })
  }

  const post = await Post.findById(postId).exec()

  if (!post) {
    res.status(400).json({ message: `Post not found` })
  }

  const result = await post.deleteOne()
  const reply = `Post ${result.title} has been deleted`
  res.json(reply)
})

module.exports = { getAllPosts, createNewPost, updatePost, deletePost }
