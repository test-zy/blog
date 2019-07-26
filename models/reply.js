const mongoose = require('./connect.js')

const replySchema = new mongoose.Schema({
	replyList: [
		{
			author: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			},
			content: String,
			time: String
		}
	]
})

module.exports = mongoose.model('Reply', replySchema)
