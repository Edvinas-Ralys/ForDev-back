const Comment = require(`../models/Comment`)
const asyncHandler = require(`express-async-handler`)

//!GET
const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.query
  const comments = await Comment.find({ postId: postId })
  if (!comments) {
    return res.status(400).json({ message: { text: `No comments found`, type: `error` } })
  } else {
    const totalCount = await Comment.countDocuments()
    res.json({ comments, totalCount })
  }
})

//!CREATE
const createComment = asyncHandler(async (req, res) => {
  const { commentContent, postId, commenterUsername, commenterId, id, postTitle } = req.body
  if (!commentContent || !postId || !commenterUsername || !commenterId || !id || !postTitle) {
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
    postTitle
  }
  const response = await Comment.create(commentObject)
  if (response) {
    res.status(201).json({
      commentObject: { ...commentObject, createdAt: response.createdAt },
      message: { text: `Comment posted`, type: `confirm` },
    })
  } else {
    res.status(400).json({ message: `Invalid data` })
  }
})

//!DELETE
const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId, userId } = req.body
  if (!postId || !commentId || !userId) {
    return res.status(400).json({ message: { text: `No data recieved`, type: `error` } })
  }
  const comment = await Comment.findOne({ id: commentId }).exec()
  if (!comment) {
    return res.status(400).json({ message: { text: `No comment found`, type: `error` } })
  } else if (comment && comment.commenterId !== userId) {
    return res.status(400).json({ message: { text: `Access denied`, type: `error` } })
  }
  const result = await comment.deleteOne()
  res.json({ message: { text: `Comment deleted`, type: `confirm` }, deletedId: commentId })
})

//!UPDATE
const updateComment = asyncHandler(async (req, res) => {
  const { commentId, newComment, originalComment, postId, userId } = req.body
  if (!commentId || !newComment || !originalComment || !postId || !userId) {
    return res.status(400).json({ message: { text: `No data recieved`, type: `error` } })
  }

  const comment = await Comment.findOne({ id: commentId }).exec()
  if (!comment) {
    return res.status(400).json({ message: `No comment found`, type: `error` })
  } else if ((comment && comment.commenterId !== userId) || comment.postId !== postId) {
    return res.status(400).json({ message: { text: `Access denied`, type: `error` } })
  }

  comment.originalComment = originalComment
  comment.commentContent = newComment
  const response = await comment.save()
  res.json({ message: { text: `Comment updated`, type: `confirm` }, updatedComment: response })
})

module.exports = { getComments, deleteComment, createComment, updateComment }
