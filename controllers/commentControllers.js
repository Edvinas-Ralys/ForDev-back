const Comment = require(`../models/Comment`)
const asyncHandler = require(`express-async-handler`)

const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.query
  const comments = await Comment.find({ postId: postId })
  const totalCount = await Comment.countDocuments()
  res.json({ comments, totalCount })
  console.log(req.query)
})

const createComment = asyncHandler(async (req, res) => {
  const { commentContent, postId, commenterUsername, commenterId, id } = req.body
  if (!commentContent || !postId || !commenterUsername || !commenterId || !id) {
    return res.status(400).json({ message: { text: `All fields are rquired`, type: `error` } })
  }
  const date = new Date()
  let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
  let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
  let year = date.getFullYear()
  let currentDate = `${day}-${month}-${year}`

  commentObject = {
    commentContent,
    postId,
    commenterUsername,
    commenterId,
    id,
    created: currentDate,
  }
  const response = await Comment.create(commentObject)
  if (response) {
    res.status(201).json(response)
  } else {
    res.status(400).json({ message: `Invalid data` })
  }
})

const deleteComment = asyncHandler(async (req, res) => {})

const updateComment = asyncHandler(async (req, res) => {})

module.exports = { getComments, deleteComment, createComment, updateComment }
