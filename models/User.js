const mongoose = require(`mongoose`)
const AutoIncrement = require(`mongoose-sequence`)(mongoose)

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email:{
    type:String,
    required:true
  },
  picture:{
    type: String,
    default:null,
  },
  posts:{
    type: Array,
    default:null
  },
  comments:{
    type: Array,
    default:null
  },
  notifications:{
    type: Array,
    default:null
  },
  bio:{
    type:String,
    required:false
  },
  interests:{
    type:Array,
    required:false
  },
  roles: [
    {
      type: String,
      default: "user",
    },
  ],
})

userSchema.plugin(AutoIncrement, {
  inc_field: `userId`,
  id:`idNumb`,
  start_seq:0
})

module.exports = mongoose.model(`User`, userSchema)
