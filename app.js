// 核心模块
const path = require('path')

// 第三方模块
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const favicon = require('serve-favicon')

// 自己的模块
const sessionRouter = require('./routes/session.js') // 注册登录相关路由
const topicRouter = require('./routes/topic.js') // 博客相关路由
const manageRouter = require('./routes/manage.js') // 管理相关路由
const homeRouter = require('./routes/homepage.js') // 主页功能相关路由

const app = express()

// 配合 post 请求
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 配置 session
app.use(session({
  secret: 'this is a secret option', // 配置加密字符串
  resave: false,
  saveUninitialized: true, // 无论是否使用 session，都默认分配一把钥匙
  store: new MongoStore({ url: 'mongodb://127.0.0.1/blog' })
}))

// 配置模板引擎
app.engine('html', require('express-art-template'))

// 配置静态资源
app.use('/node_modules/', express.static(path.join(__dirname, 'node_modules')))
app.use('/public/', express.static(path.join(__dirname, 'public')))

// 配置 icon 中间件
app.use(favicon(path.join(__dirname, './public/img/icon.png')))

// 路由中间件
app.use(sessionRouter)
app.use(topicRouter)
app.use(manageRouter)
app.use(homeRouter)

// 404处理中间件
app.use((req, res) => {
	res.render('404.html')
})

// 全局错误处理中间件
app.use((err, req, res, next) => {
	res.status(500).json({
		err_code: 500,
		message: err.message
	})
})

app.listen(3000, () => console.log('the blog server is on'))
