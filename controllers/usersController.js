const User = require(`../models/User`)
const Post = require(`../models/Post`)
const Comment = require(`../models/Comment`)
const asyncHandler = require(`express-async-handler`)
const bcrypt = require(`bcrypt`)
const writeImage = require(`../functions/writeImage`)
const fs = require("fs")

//Get all users
//route get/users
//Private
const getUser = asyncHandler(async (req, res) => {
  const { userId } = req.query
  if (!userId) {
    return res.status(401).json({ message: { text: `No user found`, type: `error` } })
  }
  const userDetails = await User.findOne({ userId }).select(`-password`).exec()
  const userPosts = await Post.find({ userId }).select(`-createdBy -userId`).exec()
  const userComments = await Comment.find({ commenterId: userId })
    .select(`-commenterId -commenterUsername`)
    .exec()

    if(!userDetails || !userPosts || !userComments){
      return res.status(400).json({message:{text:`No user found`, type:`error`}})
    }

  const userObject = {
    userComments,
    userPosts,
    userDetails,
  }
  res.status(200).json(userObject)

})

//Create new user
//route post/users
//Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, confirmPassword, email, confirmEmail, roles } = req.body
  if (!username || !password || !confirmPassword || !email || !confirmEmail || !roles.length) {
    return res.status(400).json({
      message: {
        text: `All fields are required`,
        type: `error`,
        location: `sign-up`,
        cause: `fields`,
      },
    })
  }

  //Check for duplicates
  const duplicateUsername = await User.findOne({ username }).lean().exec()
  if (duplicateUsername) {
    return res.status(409).json({
      message: {
        text: `Username is already used`,
        type: `error`,
        location: `sign-up`,
        cause: `username`,
      },
    })
  }
  const duplicateEmail = await User.findOne({ email }).lean().exec()
  if (duplicateEmail) {
    return res.status(409).json({
      message: {
        text: `Email is already used`,
        type: `error`,
        location: `sign-up`,
        cause: `email`,
      },
    })
  }

  if (password !== confirmPassword) {
    return res.status(409).json({
      message: {
        text: `Password does not match`,
        type: `error`,
        location: `sign-up`,
        cause: `password-match`,
      },
    })
  }

  if (email !== confirmEmail) {
    return res.status(409).json({
      message: {
        text: `Email does not match`,
        type: `error`,
        location: `sign-up`,
        cause: `email-match`,
      },
    })
  }

  //Hash password
  const hashedPasword = await bcrypt.hash(password, 10)

  const userObject = { username, password: hashedPasword, roles, email }

  //Create and store new user
  const user = await User.create(userObject)
  if (user) {
    //created
    return res.status(201).json({
      message: {
        text: `User created`,
        type: `confirm`,
        location: null,
        cause: null,
      },
    })
  } else {
    res.status(400).json({ message: `Invalid user data recieved` })
  }
})

//Update user
//route patch/users
//Private
const updateUser = asyncHandler(async (req, res) => {
  const { userId, picture, bio, interest, updateType } = req.body
  if (!userId || !updateType) {
    return res.status(400).json({ message: { text: `Access denied`, type: `error` } })
  } else if (updateType === `bio` && !bio) {
    return res.status(400).json({ message: { text: `Can't update empty string`, type: `error` } })
  } else if (updateType === `bio` && bio.length > 200){
    return res.status(400).json({ message: { text: `Text too long. Maximum 200 characters`, type: `error` } })
  } else if (updateType === `picture` && !picture) {
    return res.status(400).json({ message: { text: `No picture found`, type: `error` } })
  } else if (updateType === `interest` && (!interest || interest.length === 0)) {
    return res.status(400).json({ message: { text: `No interests selected`, type: `error` } })
  }
  const user = await User.findOne({ userId:Number(userId) }).exec()
  if (!user) {
    return res.status(400).json({ message: { text: `User not found`, type: `error` } })
  }

  //Check duplicate
  const duplicate = await User.findOne({ userId:Number(userId) }).lean().exec()


  if (updateType === `picture`) {
    const base64Str = picture.split(`base64,`)[1]
    const decode = atob(base64Str)
    if (decode.length > 4000000) {
      return res.status(400).json({
        message: {
          text: `Image size too big. Maximum file size 4mb`,
          type: `error`,
          cause: `image`,
        },
      })
    } else if(req.body.oldPicture !== null){
      fs.unlinkSync("public/images/" + user.picture)
      const formatedPicture = writeImage(picture)
      user.picture = formatedPicture
    } else {
      const formatedPicture = writeImage(picture)
      user.picture = formatedPicture
    }
  } else if (updateType === `bio`) {
    user.bio = bio
  } else if(updateType === `picture-remove`){
    fs.unlinkSync("public/images/" + user.picture)
    user.picture = null
  } else if (updateType === `remove-bio`){
    user.bio = null
  }

  const updateUser = await user.save()
  if(req.body.updateType === `picture`){
    return res.json({ message: { text: `${req.body.updateType} updated`, type: `confirm` }, newPicture:updateUser.picture })
  } else if (req.body.updateType === `picture-remove`){
    return res.json({ message: { text: `Picture removed`, type: `confirm` }, newPicture:null })
  }
  res.json({ message: { text: `${req.body.updateType} updated`, type: `confirm` } })
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

module.exports = { getUser, createNewUser, updateUser, deleteUser }
