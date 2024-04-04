const Post = require(`../models/Post`)
const User = require(`../models/User`)
const asyncHandler = require(`express-async-handler`)
const writeImage = require(`../functions/writeImage`)
const fs = require("fs")
// .limit(n) returns maximum n number of items

const getAllPosts = asyncHandler(async (req, res) => {
  console.log(req.body)
  const posts = await Post.find().select().limit(req.query.limit).skip(req.query.skip)
  const totalCount = await Post.countDocuments()
  res.json({ posts, totalCount })
})

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
    res.status(201).json(postResponse)
  } else {
    res.status(400).json({ message: `Invalid data` })
  }
})

const updatePost = asyncHandler(async (req, res) => {
  // console.log(req.body)

  // Sending a comment
  if (req.body?.updateType === `comment`) {
    const { comment, commenterUsername, commenterId, postId, commentId } = req.body
    if (!comment || !commenterUsername || !commenterId || !postId || !commentId) {
      return res.status(400).json({ message: `All fields are required` })
    }

    const commentedPost = await Post.findById(postId).exec()
    if (!commentedPost) {
      return res.status(400).json({ message: `Post not found` })
    }
    const date = new Date()
    let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
    let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    let year = date.getFullYear()
    let currentDate = `${day}-${month}-${year}`
    const commentObejct = {
      commentText: comment,
      commenterUsername,
      commenterId:Number(commenterId),
      commentPosted: currentDate,
      postId,
      commentId,
    }
    commentedPost.comments.unshift(commentObejct)
    console.log(commentObejct)
    const commentSent = await commentedPost.save()
    res.json({message:{text:`Comment posted`, type:`confirm`}, commentObejct})
    return
  }

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
  // if(req.body?.deleteType === `comment`){
  //   console.log(req.body)

  //   return
  // }

  const { postId, userId, deleteType } = req.body
  console.log(req.body)
  if (!postId || !userId || !deleteType) {
    return res.status(400).json({ message: `No ID recieved` })
  }

  if (deleteType === `post`) {
    const post = await Post.findById(postId).exec()
    if (!post) {
      return res.status(400).json({ message: `Post not found` })
    } else if (post && post.userId !== userId) {
      return res.status(400).json({ message: `Acces denied` })
    }
    const result = await post.deleteOne()
    fs.unlinkSync("public/images/" + post.image)
    console.log(result)
    const reply = `Post ${result.title} has been deleted`
    res.json(reply)


  } else if (deleteType === `comment`) {
    const { commentId, userId } = req.body
    console.log(req.body)
    const post = await Post.findById(postId).exec()
    if (!post) {
      return res.status(400).json({ message: `Post not found` })
    }
    // else if (post && post.userId !== userId) {
    //   console.log(post.userId, userId)
    //   return res.status(400).json({ message: `Acces denied` })
    // }
    const updatedComments = post.comments.filter(item => item.commentId !== req.body.commentId)
    post.comments = updatedComments
    const result = await post.save()
    return res.json({ message: { text: `Comment deleted`, type: `confirm` } })
  }
})

module.exports = { getAllPosts, createNewPost, updatePost, deletePost }
