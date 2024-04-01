const express = require(`express`)
const router = express.Router()
const fundraiserController = require(`../controllers/fundraisersController`)
const verifyJWT = require(`../middleware/verifyJWT`)

router.route(`/`)
.get(fundraiserController.getAllFundraisers)
.post(verifyJWT, fundraiserController.createNewFundrasier)
.patch(verifyJWT, fundraiserController.updateFundraiser)
.delete(verifyJWT, fundraiserController.deleteFundraiser)

module.exports = router