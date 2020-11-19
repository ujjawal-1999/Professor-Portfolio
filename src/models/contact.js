const mongoose = require('mongoose');
const {
    ObjectId
} = mongoose.Schema.Types;

const mailSchema = new mongoose.Schema({
	email:{
		type:String,
	},
	phone:{
		type:String,
	},
	facebook:{
		type:String,
	},
	linkedin:{
		type:String
	}
});

const Mail = new mongoose.model('Mail',mailSchema);

module.exports = Mail;