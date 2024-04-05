const jwt = require(`jsonwebtoken`)

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.header.Authorization || null

  if (!authHeader?.startsWith("Bearer ") || authHeader === null) {
    return res.status(401).json({ message: { text: `Unauthorized`, type: `error` } })
  }

  const token = authHeader.split(` `)[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) {
      return res.status(403).json({ message: { text: `Forbidden`, type: `error` } })
    } else {
      req.user = decode.UserInfo.email
      next()
    }
  })
}

module.exports = verifyJWT
