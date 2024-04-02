const express = require(`express`)
const router = express.Router()
const verifyJWT = require(`../middleware/verifyJWT`)
const profileController = require (`../controllers/profileController`)

router.route(`/`)
.get(verifyJWT, profileController.getProfileFundraisers)
.delete(verifyJWT, profileController.deleteProfileFundraiser)


module.exports = router