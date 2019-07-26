const mongoose = require('./connect.js')

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	gender: {
		type: String,
		enum: ['保密', '男', '女'],
		default: '保密'
	},
	introduction: {
		type: String,
		default: '这个人很懒，什么都没留下。'
	},
	avatar: {
		type: String,
		default: '/public/img/avatar-max-img.png'
	}
});

module.exports = mongoose.model('User', userSchema);
