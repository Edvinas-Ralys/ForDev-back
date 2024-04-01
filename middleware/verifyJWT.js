const jwt = require(`jsonwebtoken`)

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.header.Authorization



  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: `Unauthorized` })
  }

  const token = authHeader.split(` `)[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) {
      console.log(err)
      return res.status(403).json({ message: `Forbidden` })
    } else {
      req.user = decode.UserInfo.email
      next()

    }

  })
}

module.exports = verifyJWT
