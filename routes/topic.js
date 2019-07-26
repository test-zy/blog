// 和博客相关的路由

const express = require('express')
const moment = require('moment')

const Blog = require('../models/blog.js')
const Reply = require('../models/reply.js')
const User = require('../models/user.js')

const { paging } = require('../public/js/paging.js')

const router = express.Router()

// 发表博客
router.get('/publish', (req, res, next) => {
	res.render('publish.html', {
		user: req.session.user,
		avatar: req.session.avatar
	})
})

router.post('/publish', (req, res, next) => {
	const postData = req.body

	new Reply({
		replyList: []
	}).save((err, data) => {
		if (err) return next(err)

		new Blog({
			author: req.session.user,
			title: postData.title,
			content: postData.content,
			reply: data._id,
			tags: postData.tag,
			time: moment().format('YYYY年MM月DD日 HH:mm')
		}).save((err, data) => {
			if (err) return next(err)

			res.redirect('/')
		})
	})
})

// 博客详情
router.get('/blog/:id', (req, res, next) => {
	const id = req.params.id
	Blog
		.findOne({
			_id: id
		})
		.populate('reply')
		.exec((err, data) => {
			if (err) return next(err)

			if (!data) { // 用户通过 url 地址栏输入，可能出现不存在的情况
				return next()
			}

			Blog
				.findOneAndUpdate({
					_id: id
				}, {
					pageviews: data.pageviews + 1
				}, (err) => {
					if (err) return next(err)

					const blog = data
					blog.pageviews++

					Reply
						.findOne({
							_id: data.reply
						})
						.populate('replyList.author')
						.exec((err, reply) => {
							if (err) return next(err)

							blog.reply.replyList = reply.replyList
							res.render('show.html', {
								blog: JSON.parse(JSON.stringify(blog)),
								user: req.session.user,
								avatar: req.session.avatar
							})
						})
				})
				
		})
})

// 博客回复
router.post('/blog/:id/reply', (req, res, next) => {
	const postData = req.body
	postData.time = moment().format('YYYY年MM月DD日 HH:mm')
	console.log('heh')

	/* 作用：通过登录的用户名找到该用户的 id
	 * 目的：将该 id 保存在 reply 的 author 中
	 */
	User
		.findOne({
			username: req.session.user
		})
		.exec((err, data) => {
			if (err) return next(err)

			if (data) { // 找到用户才能发表评论
				postData.author = data._id
				
				/* 作用：通过 blog 的 id 找到 reply 的 id
				 * 目的：只有找到 blog 所关联的 reply，才知道该往哪个 reply 中放评论数据
				 */
				Blog
					.findOne({
						_id: req.params.id
					})
					.exec((err, data) => {
						if (err) return next(err)
						if (data) {

							/* 作用：找到 reply 之后向其中添加评论数据
							 * 
							 */
							Reply
								.findOne({
									_id: data.reply._id
								})
								.exec((err, data) => {
									data.replyList.push(postData)

									Reply.findOneAndUpdate({
										_id: data._id
									}, {
										replyList: data.replyList
									}, {
										useFindAndModify: false
									}, (err, data) => {
										if (err) return next(err)

										res.redirect('/blog/' + req.params.id)
									})
								})
						}
					})
			}
		})
})

// 编辑博客
router.get('/blog/:id/edit', (req, res, next) => {
	const id = req.params.id

	// 根据 id 找到该 blog 对应的数据
	Blog.findOne({
		_id: id
	}, (err, data) => {
		if (err) return next(err)

		if (data) {
			res.render('edit.html', {
				data: JSON.parse(JSON.stringify(data)),
				user: req.session.user,
				avatar: req.session.avatar
			})
		}
	})
})

router.post('/blog/:id/edit', (req, res, next) => {
	const postData = req.body

	Blog.findOneAndUpdate({
		_id: req.params.id
	}, {
		title: req.body.title,
		tags: req.body.tag,
		content: req.body.content
	}, (err, data) => {
		if (err) return next(err)

		res.redirect('/blog/' + data._id)
	})
})

// 删除博客
router.get('/blog/:id/delete', (req, res, next) => {
	Blog.findOneAndDelete({
		_id: req.params.id
	}, (err, data) => {
		if (err) return next(err)

		if (data) {
			res.redirect('/')
		}
	})
})

module.exports = router
