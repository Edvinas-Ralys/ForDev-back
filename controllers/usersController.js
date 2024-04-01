const User = require(`../models/User`)
const Fundraiser = require(`../models/Fundraiser`)
const asyncHandler = require(`express-async-handler`)
const bcrypt = require(`bcrypt`)

//Get all users
//route get/users
//Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select(`-password`).lean()
  if (users.lenght === 0 || !users) {
    return res.status(400).json({ message: `No users found` })
  }

  res.json(users)
})



//Create new user
//route post/users
//Private
const createNewUser = asyncHandler(async (req, res) => {
  console.log(req.body)
  const { firstName, lastName, email, password, roles, picture } = req.body

  //Confirm data
  if (!firstName || !lastName || !email || !password || !roles.length) {
    return res.status(400).json({ message: `All fields are required` })
  }

  //Check for duplicates
  const duplicate = await User.findOne({ email }).lean().exec()
  if (duplicate) {
    return res.status(409).json({ message: `Duplicate email` })
  }

  //Hash password
  const hashedPasword = await bcrypt.hash(password, 10)

  const userObject = { firstName, lastName, password: hashedPasword, roles, email, picture }

  //Create and store new user
  const user = await User.create(userObject)
  if (user) {
    //created
    res.status(201).json({ message: `New user ${firstName} created` })
  } else {
    res.status(400).json({ message: `Invalid user data recieved` })
  }
})

//Update user
//route patch/users
//Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, picture, firstName } = req.body
  if (!id || !picture) {
    return res.status(400).json({ message: `Error, no date received` })
  }

  const user = await User.findById(id).exec()

  if (!user) {
    return res.status(400).json({ message: `User not found` })
  }

  //Check duplicate
  const duplicate = await User.findOne({ id }).lean().exec()

  if (duplicate && duplicate?.__id.toString() !== id) {
    return res.status(409).json({ message: `Duplicate found on edit` })
  }

  user.picture = picture

  const updateUser = await user.save()

  res.json({ message: `User ${firstName} updated` })
})

//Delete user
//route delete/users
//Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body
  if (!id) {
    return res.status(400).json({ message: `User ID required` })
  }

  const fundraiser = await Fundraiser.findOne({ _user: id }).lean().exec()
  if (fundraiser) {
    return res.status(400).json({ message: `There are fundraisers active` })
  }

  const user = await User.findById(id).exec()

  if (!user) {
    return res.status(400).json({ message: `User not found` })
  }

  const result = await user.deleteOne()

  const reply = `User ${result.firstName} has been deleted`

  res.json(reply)
})

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser }
