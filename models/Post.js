const mongoose = require(`mongoose`)
const AutoIncrement = require(`mongoose-sequence`)(mongoose)

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: `User`,
    },
    createdBy: {
      type: String,
      require: true,
    },
    title: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: true,
    },
    post: {
      type: String,
      required: true,
    },
    originalPost: {
      type: String,
      required: false,
      default:null,
    },
    comments: {
      type: Array,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

postSchema.plugin(AutoIncrement, {
  inc_field: `postId`,
  id: `postIdNumb`,
  start_seq: 0,
})

module.exports = mongoose.model(`Post`, postSchema)
