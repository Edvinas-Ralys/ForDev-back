const mongoose = require(`mongoose`)
const AutoIncrement = require(`mongoose-sequence`)(mongoose)

const commentScheme = new mongoose.Schema(
  {
    commentContent: {
      type: String,
      required: true,
    },
    postId: {
      type: String,
      required: true,
    },
    postTitle: {
      type: String,
      required: true,
    },

    commenterUsername: {
      type: String,
      required: true,
    },
    commenterId: {
      type: Number,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    created: {
      type: String,
      require: true,
    },
    originalComment: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model(`Comment`, commentScheme)
