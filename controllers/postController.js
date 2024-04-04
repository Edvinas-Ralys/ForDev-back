const Post = require(`../models/Post`)
const User = require(`../models/User`)
const asyncHandler = require(`express-async-handler`)
const writeImage = require(`../functions/writeImage`)

// .limit(n) returns maximum n number of items

const getAllPosts = asyncHandler(async (req, res) => {
  console.log(req.body)
  const posts = await Post.find().select().limit(req.query.limit).skip(req.query.skip)
  const totalCount = await Post.countDocuments()
  // if (posts.length === 0 || !posts) {
  //   return res.status(400).json({ message: `No posts found` })
  // }
  res.json({posts, totalCount})
})


const createNewPost = asyncHandler(async (req, res) => {
  const {tags, image, title, userId, createdBy, text } = req.body
  console.log(req.body)
  // if(req.body?.updateType === `comment`){
  //   const {comment, commenterUsername, commenterId, postId} = req.body
  //   if(!comment || !commenterUsername || !commenterId || !postId){
  //     return res.status(400).json({ message: `All fields are required` })
  //   }
  //   console.log(`comment made`)
  //   return
  // }
  if (tags.lenght === 0 || !title || !text || !userId || !createdBy ) {
    return res.status(400).json({ message: `All fields are required` })
  }

  const formatedImage = writeImage(image)

  const postObject = { tags, image:formatedImage, title, userId, createdBy, text}

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
    if(req.body?.updateType === `comment`){
    const {comment, commenterUsername, commenterId, postId} = req.body
    if(!comment || !commenterUsername || !commenterId || !postId){
      return res.status(400).json({ message: `All fields are required` })
    }

    const commentedPost = await Post.findById(postId).exec()
    if(!commentedPost){
      return res.status(400).json({ message: `Post not found` })
    }
    const date = new Date()
    let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
    let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    let year = date.getFullYear()
    let currentDate = `${day}-${month}-${year}`
    const commentObejct = {
      commentText:comment,
      commenterUsername,
      commenterId,
      commentPosted:currentDate
    }
    commentedPost.comments.unshift(commentObejct)
    const commentSent = await commentedPost.save()
    res.json(commentObejct)
    console.log(`comment made`)
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
