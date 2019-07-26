// 用户管理相关路由

const express = require('express')

const User = require('../models/user.js')
const Blog = require('../models/blog.js')

const { paging } = require('../public/js/paging.js')

const router = express.Router()

// 我的博客
router.get('/myblog', (req, res, next) => {
	const curPage = req.query.page

	Blog.find({
		author: req.session.user
	}, (err, data) => {
		if (err) return next(err)

		let blogs = JSON.parse(JSON.stringify(data))
		blogs.reverse()

		showData = paging(blogs, 5, curPage)

		res.render('myblog.html', {
			user: req.session.user,
			avatar: req.session.avatar,
			blogs: showData.showData,
			curPage: showData.curPage,
			totalPage: showData.totalPage
		})
	})
})

// 各个用户的博客
router.get('/userblog', (req, res, next) => {
	const user = req.query.author
	const curPage = req.query.page

	Blog.find({
			author: user
		}, (err, data) => {
			if (err) return next(err)

			let blogs = JSON.parse(JSON.stringify(data))
			blogs.reverse()

			showData = paging(blogs, 5, curPage)

			res.render('user_blog.html', {
				user: req.session.user,
				avatar: req.session.avatar,
				blogs: showData.showData,
				curPage: showData.curPage,
				totalPage: showData.totalPage,
				author: user
			})
		})
})

module.exports = router
