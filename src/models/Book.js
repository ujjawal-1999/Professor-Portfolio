const mongoose = require("mongoose");
const {
    ObjectId
} = mongoose.Schema.Types;

const BookSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    author:{
        type:String
    },
    cover: {
        type: String,
        default: "https://cdn-images-1.medium.com/max/800/1*fDv4ftmFy4VkJmMR7VQmEA.png",
    },
    book: {
        type: String,
    },
    isDeleted:{
        type:Boolean,
        default: false
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model("Book", BookSchema);