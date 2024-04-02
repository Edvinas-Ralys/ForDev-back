const express = require(`express`)
const router = express.Router()
const postController = require(`../controllers/postController`)
const verifyJWT = require(`../middleware/verifyJWT`)

router
  .route(`/`)
  .get(postController.getAllPosts)
  .post(verifyJWT, postController.createNewPost)
  .patch(verifyJWT, postController.updatePost)
  .delete(verifyJWT, postController.deletePost)

module.exports = router
