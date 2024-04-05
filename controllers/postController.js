const Post = require(`../models/Post`)
const Comment = require(`../models/Comment`)
const User = require(`../models/User`)
const asyncHandler = require(`express-async-handler`)
const writeImage = require(`../functions/writeImage`)
const fs = require("fs")
// .limit(n) returns maximum n number of items


//! Get all posts
const getAllPosts = asyncHandler(async (req, res) => {
  console.log(req.body)
  const posts = await Post.find().select().limit(req.query.limit).skip(req.query.skip)
  const totalCount = await Post.countDocuments()
  res.json({ posts, totalCount })
})

//!Create Post
const createNewPost = asyncHandler(async (req, res) => {
  const { tags, image, title, userId, createdBy, text } = req.body
  if (tags.length === 0 || !title || !text || !userId || !createdBy) {
    return res.status(400).json({ message: { text: `All fields are rquired`, type: `error` } })
  }
  if (title.length < 10) {
    return res
      .status(400)
      .json({ message: { text: `Title too short`, type: `error`, cause: `title` } })
  } else if (title.length > 100) {
    return res
      .status(400)
      .json({ message: { text: `Title too long`, type: `error`, cause: `title` } })
  }

  if (text.length < 100) {
    return res
      .status(400)
      .json({ message: { text: `Post too short`, type: `error`, cause: `text` } })
  } else if (text.length > 10000) {
    return res
      .status(400)
      .json({ message: { text: `Post too long`, type: `error`, cause: `text` } })
  }
  if (image) {
    const base64Str = image.split(`base64,`)[1]
    const decode = atob(base64Str)
    if (decode.length > 4000000) {
      return res.status(400).json({
        message: {
          text: `Image size too big. Maximum file size 4mb`,
          type: `error`,
          cause: `image`,
        },
      })
    }
  }
  const formatedImage = writeImage(image)
  const postObject = { tags, image: formatedImage, title, userId, createdBy, text }
  const postResponse = await Post.create(postObject)
  if (postResponse) {
    res.status(201).json({postResponse, message:{text:`Post created`, type:`confirm`}})
  } else {
    res.status(400).json({ message:{text:`Invalid data`, type:`error`} })
  }
})



//! Update post
//After profile
const updatePost = asyncHandler(async (req, res) => {
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


//!Delete post
//!Finished
const deletePost = asyncHandler(async (req, res) => {
  const { postId, userId } = req.body
  if (!postId || !userId) {
    return res.status(400).json({ message: {text: `No ID recieved`, type:`error`} })
  }
    const post = await Post.findById(postId).exec()
    if (!post) {
      return res.status(400).json({ message: {text:`Post not found`, type:`error`} })
    } else if (post && post.userId !== userId) {
      return res.status(400).json({ message: {text: `Access denied`, type:`error`} })
    }
    const result = await post.deleteOne()
    const comments = await Comment.deleteMany({postId:postId})

    post.image && fs.unlinkSync("public/images/" + post.image)
    res.json({message:{text:`Post deleted`, type:`confirm`}})



})

module.exports = { getAllPosts, createNewPost, updatePost, deletePost }
