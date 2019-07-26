// 登录、注册、退出相关路由

// 核心模块
const path = require('path')

// 第三方模块
const express = require('express')
const md5 = require('blueimp-md5')

// 自己的模块
const User = require('../models/user.js')

const router = express.Router()

// 登录
router.get('/login', (req, res) => {
	res.render('login.html')
})

router.post('/login', (req, res) => {
	const postData = req.body
	postData.password = md5(md5(postData.password))

	User.findOne(postData, (err, data) => {
		if (err) {
			return next(err)
		}

		// 数据不存在，为 null
		if (!data) {
			return res.status(200).json({
				err_code: 1,
				message: 'Username or password do not match.'
			})
		}

		// 登录成功
		req.session.user = data.username
		req.session.avatar = data.avatar // 头像
		res.status(200).json({
			err_code: 0,
			message: 'Everything is ok'
		})
	})
})

// 注册
router.get('/register', (req, res) => {
	res.render('register.html')
})

router.post('/register', (req, res) => {

	const postData = req.body // 防止后续多次读取嵌套层次更深的 req.body，提高性能
	postData.password = md5(md5(postData.password))

	User.findOne({
		username: postData.username
	}, (err, data) => {
		if (err) {
			return next(err)
		}

		if (data) { // 用户名已存在
			return res.status(200).json({
				err_code: 1,
				message: 'Username is already exist'
			})
		}

		new User(postData).save((err, data) => {
			if (err) {
				return next(err)
			}

			res.status(200).json({
				err_code: 0,
				message: 'Everything is ok'
			})

		})
	})
})

// 退出
router.get('/logout', (req, res) => {
	// 不要使用 req.session.user = null，这样 user 属性还在，不严谨
	delete req.session.user
	delete req.session.avatar
	res.redirect('/')
})

module.exports = router
