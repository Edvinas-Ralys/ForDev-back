const Fundraiser = require(`../models/Fundraiser`)
const User = require(`../models/User`)
const asyncHandler = require(`express-async-handler`)
const writeImage = require(`../functions/writeImage`)

// .limit(n) returns maximum n number of items

const getAllFundraisers = asyncHandler(async (req, res) => {

  const fundraisers = await Fundraiser.find().select().limit(req.query.limit).skip(req.query.skip)
  const totalCount = await Fundraiser.countDocuments()
  // if (fundraisers.length === 0 || !fundraisers) {
  //   return res.status(400).json({ message: `No fundraisers found` })
  // }
  res.json({fundraisers, totalCount})
})


const createNewFundrasier = asyncHandler(async (req, res) => {
  const { country, type, recipients, goal, picture, title, story, userId, createdBy, collected } = req.body

  const formatedImage = writeImage(picture)

  //Confirm data
  if (!country || !type || !recipients.length || !goal || !picture || !title || !story || !userId || !createdBy ) {
    return res.status(400).json({ message: `All fields are required` })
  }
  //Check for duplicates
  //Not needed

  const fundraiserObject = { country, type, recipients, goal, picture:formatedImage, title, story, userId, createdBy, collected }

  const fundraiser = await Fundraiser.create(fundraiserObject)
  if (fundraiser) {
// console.log(fundraiser)
    res.status(201).json(fundraiser)
  } else {
    res.status(400).json({ message: `Invalid data` })
  }
})



const updateFundraiser = asyncHandler(async (req, res) => {
  console.log(req.body)
  const { donateAmount, id } = req.body
  if (!donateAmount) {
    res.status(400).json({ message: `Error, no data recieved` })
  }

  const fundrasier = await Fundraiser.findById(id).exec()
  if (!fundrasier) {
    return res.status(400).json({ message: `Fundraiser not found` })
  }

  const duplicate = await Fundraiser.findOne({ id }).lean().exec()
  if (duplicate && duplicate?.__id.toString() !== id) {
    return res.status(400).json({ message: `Fundraiser not found` })
  }

  fundrasier.collected = Number(fundrasier.collected) + Number(donateAmount)
  fundrasier.comments.push(req.body.comments)
  const updateFundraiser = await fundrasier.save()
  res.json(fundrasier)
})



const deleteFundraiser = asyncHandler(async (req, res) => {
  const { id } = req.body
  if (!id) {
    return res.status(400).json({ message: `No ID recieved` })
  }

  const fundraiser = await Fundraiser.findById(id).exec()

  if (!fundraiser) {
    res.status(400).json({ message: `Fundraiser not found` })
  }

  const result = await fundraiser.deleteOne()
  const reply = `Fundraiser ${result.title} has been deleted`
  res.json(reply)
})

module.exports = { getAllFundraisers, createNewFundrasier, updateFundraiser, deleteFundraiser }
