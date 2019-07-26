const mongoose = require('./connect.js')

const blogSchema = new mongoose.Schema({
	author: String,
	title: String,
	content: String,
	tags: Array,
	pageviews: {
		type: Number,
		default: 0
	},
	reply: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Reply'
	},
	time: String
})

module.exports = mongoose.model('Blog', blogSchema)
