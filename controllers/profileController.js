const Fundraiser = require(`../models/Fundraiser`)
const User = require(`../models/User`)
const asyncHandler = require(`express-async-handler`)
const writeImage = require(`../functions/writeImage`)
const fs = require('fs');

const getProfileFundraisers = asyncHandler(async (req, res) => {
  if (!req.query.id) {
    return res.status(500).json({ message: `not logged in` })
  }

  const fundraisers = await Fundraiser.find({ userId: req.query.id })
    .limit(req.query.limit)
    .skip(req.query.skip)
  const totalCount = await Fundraiser.countDocuments()
  res.json({ fundraisers, totalCount })
})



const deleteProfileFundraiser = asyncHandler(async (req, res) => {
  console.log(req.body)
  if(!req.body.id){
    return res.status(400).json({message: 'No ID found'})
  }

  const fund = await Fundraiser.findById(req.body.destroyFund).exec()
  if(!fund){
    res.status(400).json({message: `Fundraiser not found`})
  }
  const result = await fund.deleteOne()
  fs.unlinkSync("public/images/" + fund.picture)
  console.log(fund)
  const reply = `Fundrasier "${fund.title}" has  been deleted`
  res.json(reply)
})

module.exports = { getProfileFundraisers, deleteProfileFundraiser }
