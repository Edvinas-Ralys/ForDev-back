const User = require(`../models/User`)
const jwt = require(`jsonwebtoken`)
const bcrypt = require(`bcrypt`)
const asyncHandler = require(`express-async-handler`)

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      message: {
        text: `All fields are required`,
        type: `error`,
        location: `login`,
        cause: `fields`,
      },
    })
  }

  const foundUser = await User.findOne({ email }).exec()
  if (!foundUser) {
    return res.status(401).json({
      message: {
        text: `No user found`,
        type: `error`,
        location: `login`,
        cause: `user`,
      },
    })
  }

  const match = await bcrypt.compare(password, foundUser.password)
  if (!match) {
    return res.status(401).json({
      message: {
        text: `Invalid email or password`,
        type: `error`,
        location: `login`,
        cause: `invalid-input`,
      },
    })
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: `100d` }
  )

  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  )

  res.cookie(`jwt`, refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: `None`,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  res.json({
    accessToken,
    user: {
      username: foundUser.username,
      picture: foundUser.picture,
      role: foundUser.roles[0],
      id: foundUser.userId,
    },
    message: {
      text: `Welcome, ${foundUser.username}`,
      type: `confirm`,
      location: `none`,
      cause: `none`,
    },
  })
})

const refresh = (req, res) => {
  const cookies = req.cookies
  if (!cookies) {
    return res.status(401).json({ message: `Unauthorized` })
  }
  const refreshToken = cookies.jwt

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decode) => {
      if (err) {
        return res.status(403).json({ message: `Forbidden` })
      }

      const foundUser = await User.findOne({ username: decode.username })
      if (!foundUser) {
        return res.status(401).json({ message: `Unauthorized` })
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: `5h` }
      )
      res.json({ accessToken })
    })
  )
}

const logout = (req, res) => {
  const cookies = req.cookies
  if (!cookies?.jwt) {
    return res.status(204)
  }
  res.clearCookie(`jwt`, { httpOnly: true, sameSite: `None`, secure: true })
  res.json({ message: `Cookie cleared` })
}

module.exports = {
  login,
  refresh,
  logout,
}
