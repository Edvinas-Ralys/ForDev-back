const asyncHandler = require(`express-async-handler`)
const Post = require(`../models/Post`)

const getSearchResults = asyncHandler(async (req, res) => {
  console.log(req.query)
  const foundPosts = await Post.find()
  if (!req.query.title && (!req.query.tags || req.query.tags.length === 0)) {
    return res
      .status(400)
      .json({ message: { text: `Please enter search parameters`, type: `error` } })
  }

  let results = []
  foundPosts.map(
    post =>
      ((req.query.title && post.title.includes(req.query.title)) ||
        (req.query.tags && post.tags.some(t => req.query.tags.includes(t)))) &&
      results.push(post)
  )
  res.json(results)
})

module.exports = { getSearchResults }
