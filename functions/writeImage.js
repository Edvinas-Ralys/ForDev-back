const fs = require('fs');
const md5 = require('md5');
const { v4: uuidv4 } = require('uuid');


const writeImage = imageBase64 => {
    if (!imageBase64) {
      return null
    }
    let type
    let image
    if (imageBase64.indexOf("data:image/png;base64,") === 0) {
      type = `png`
      image = Buffer.from(imageBase64.replace(/^data:image\/png;base64,/, ""), "base64")
    } else if (imageBase64.indexOf("data:image/jpeg;base64,") === 0) {
      type = `jpg`
      image = Buffer.from(imageBase64.replace(/^data:image\/jpeg;base64,/, ""), "base64")
    } else {
      res.status(500).send(`Incorrenct image format`)
      return
    }

    const filename = md5(uuidv4()) + `.` + type
    fs.writeFileSync(`public/images/` + filename, image)
    return filename
  }

  module.exports = writeImage