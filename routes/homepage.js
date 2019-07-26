// 主页相关路由

const fs = require('fs')
const path = require('path')

const express = require('express')
const multer = require('multer')

const Blog = require('../models/blog.js')
const User = require('../models/user.js')
const { paging } = require('../public/js/paging.js')

const router = express.Router()

// 配置 multer
const upload = multer({
	storage: multer.diskStorage({
		destination (req, file, cb) {
			cb(null, './public/uploads/avatars')
		},
		filename (req, file, cb) {
			const nameArr = file.originalname.split('.')
			const name = nameArr.slice(0, -1).join('') + Date.now() + '.' + nameArr.slice(-1)[0]
			cb(null, name)
		}
	})
})

// 渲染主页
router.get('/', (req, res, next) => {
	const curPage = req.query.page

	Blog
		.find()
		.populate('reply')
		.exec((err, data) => {
			if (err) return next(err)
			
			let blogs = JSON.parse(JSON.stringify(data))
			blogs.reverse()

			showData = paging(blogs, 5, curPage)

			res.render('index.html', {
				user: req.session.user,
				avatar: req.session.avatar,
				blogs: showData.showData,
				curPage: showData.curPage,
				totalPage: showData.totalPage
			})
		})
})

// 个人主页
router.get('/profile', (req, res, next) => {
	User.findOne({
		username: req.session.user
	}, (err, data) => {
		if (err) return next(err)

		res.render('profile.html', {
			user: req.session.user,
			avatar: req.session.avatar,
			userInfo: JSON.parse(JSON.stringify(data))
		})
	})
})

// 头像提交
router.post('/profile/avatar', upload.single('avatar'), (req, res, next) => {
	if (req.session.avatar !== '/public/img/avatar-max-img.png') {
		fs.unlink(path.join(__dirname, '../', req.session.avatar), err => {
			if (err) return next(err)

			req.session.avatar = '\\' + req.file.path

			User.findOneAndUpdate({
				username: req.session.user
			}, {
				avatar: '\\' + req.file.path
			}, (err, data) => {
				if (err) return next(err)

				res.redirect('/profile')
			})
		})
	} else {
		req.session.avatar = '\\' + req.file.path

		User.findOneAndUpdate({
			username: req.session.user
		}, {
			avatar: '\\' + req.file.path
		}, (err, data) => {
			if (err) return next(err)

			res.redirect('/profile')
		})
	}
	
})

// 搜索框搜索
router.get('/search', (req, res, next) => {
	const keyword = req.query.keyword
	const curPage = req.query.page
	
	Blog
		.find({
			$or: [
				{ title: { $regex: keyword, $options: '$i' } },
				{ content: { $regex: keyword, $options: '$i' } },
				{ tags: new RegExp(keyword, 'i') }
			]
		})
		.populate('reply')
		.exec((err, data) => {
			if (err) return next(err)
			
			let blogs = JSON.parse(JSON.stringify(data))
			blogs.reverse()

			showData = paging(blogs, 5, curPage)

			res.render('search.html', {
				user: req.session.user,
				avatar: req.session.avatar,
				blogs: showData.showData,
				curPage: showData.curPage,
				totalPage: showData.totalPage,
				keyword
			})
		})
})

// 根据标签搜索
router.get('/tags/search', (req, res, next) => {
	const keyword = req.query.tag
	const curPage = req.query.page

	Blog
		.find({
			tags: new RegExp(keyword, 'i')
		})
		.populate('reply')
		.exec((err, data) => {
			if (err) return next(err)
			
			let blogs = JSON.parse(JSON.stringify(data))
			blogs.reverse()

			showData = paging(blogs, 5, curPage)

			res.render('tag_search.html', {
				user: req.session.user,
				avatar: req.session.avatar,
				blogs: showData.showData,
				curPage: showData.curPage,
				totalPage: showData.totalPage,
				keyword
			})
		})
})

// 标签
router.get('/tags', (req, res, next) => {
	Blog.find((err, data) => {
		if (err) return next(err)
		
		const tags = []

		data.forEach(item => { // 遍历数据对象的 tags 属性，将不重复且不为空串的值添加到 tags 中
			item.tags.forEach(v => {
				if (v !== '') {
					v = v.toLocaleLowerCase()
					tags.includes(v) ? tags.push() : tags.push(v)
				}
			})
		})

		res.render('tags.html', {
			tags,
			user: req.session.user,
			avatar: req.session.avatar,
		})
	})
})

module.exports = router
