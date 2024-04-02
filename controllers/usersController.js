const User = require(`../models/User`)
const Post = require(`../models/Post`)
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
  // console.log(req.body)
  const { username, password, confirmPassword, email, confirmEmail, roles } = req.body

  //Confirm data
  if (!username || !password || !confirmPassword || !email || !confirmEmail|| !roles.length) {
    return res.status(400).json({ message: {
      text: `All fields are required`,
      type: `error`,
      location: `sign-up`,
      cause: `fields`,
    } })
  }

  //Check for duplicates
  const duplicateUsername = await User.findOne({ username }).lean().exec()
  if (duplicateUsername) {
    return res.status(409).json({ message: {
      text: `Username is already used`,
      type: `error`,
      location: `sign-up`,
      cause: `username`,
    }})
  }
  const duplicateEmail = await User.findOne({ email }).lean().exec()
  if (duplicateEmail) {
    return res.status(409).json({ message: {
      text: `Email is already used`,
      type: `error`,
      location: `sign-up`,
      cause: `email`,
    }})
  }

  if(password !== confirmPassword){
    return res.status(409).json({ message: {
      text: `Password does not match`,
      type: `error`,
      location: `sign-up`,
      cause: `password-match`,
    }})
  }

  if(email !== confirmEmail){
    return res.status(409).json({ message: {
      text: `Email does not match`,
      type: `error`,
      location: `sign-up`,
      cause: `email-match`,
    }})
  }

  //Hash password
  const hashedPasword = await bcrypt.hash(password, 10)

  const userObject = { username, password: hashedPasword, roles, email }

  //Create and store new user
  const user = await User.create(userObject)
  if (user) {
    //created
    return res.status(201).json({ message: {
      text: `User created`,
      type: `confirm`,
      location: null,
      cause: null,
    }})
  } else {
    res.status(400).json({ message: `Invalid user data recieved` })
  }
})

//Update user
//route patch/users
//Private
const updateUser = asyncHandler(async (req, res) => {
  const { userId, picture, bio, updateType } = req.body
  if (!userId || (updateType === `picture` && !picture)) {
    return res.status(400).json({ message: `Error, no pictur received` })
  } else if (!userId || (updateType === `bio` && !bio)) {
    return res.status(400).json({ message: `Error, no bio to update` })
  }

  const user = await User.findById(userId).exec()

  if (!user) {
    return res.status(400).json({ message: `User not found` })
  }

  //Check duplicate
  const duplicate = await User.findOne({ userId }).lean().exec()

  if (duplicate && duplicate?.__id.toString() !== userId) {
    return res.status(409).json({ message: `Duplicate found on edit` })
  }

  if (updateType === `picture`) {
    user.picture = picture
  } else if (updateType === `bio`) {
    user.bio = bio
  }

  const updateUser = await user.save()

  res.json({ message: `User ${updateUser.username} updated` })
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
