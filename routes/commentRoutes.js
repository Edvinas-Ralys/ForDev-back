const express = require(`express`)
const router = express.Router()
const commentController = require(`../controllers/commentControllers`)
const verifyJWT = require(`../middleware/verifyJWT`)

router
  .route(`/`)
  .get(commentController.getComments)
  .post(verifyJWT, commentController.createComment)
  .patch(verifyJWT, commentController.updateComment)
  .delete(verifyJWT, commentController.deleteComment)

module.exports = router