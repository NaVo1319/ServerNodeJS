const {Schema, model, ObjectId} = require("mongoose")
const File = new Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
    accessLink: {type:String},
    path: {type: String, default: ''},
    date: {type: Date, default: Date.now},
    size: {type: Number, default: 0},
    tags:{type: String, default:''},
    views:{type: Number, default:0},
    likes:{type: Number, default:0},
    user: {type: ObjectId, ref: "User"},
    status: {type: Number, default:0}
})
module.exports = model('File', File)