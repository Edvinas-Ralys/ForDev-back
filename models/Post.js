const mongoose = require(`mongoose`)
const AutoIncrement = require(`mongoose-sequence`)(mongoose)

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: String,
      require: true,
    },
    title: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    text: {
      type: String,
      required: true,
    },
    editedText: {
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
