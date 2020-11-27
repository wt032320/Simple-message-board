var http = require('http')
var fs = require('fs')
var template = require('art-template')
var url = require('url')

// 注册request请求事件的简写
// 我们为了方便的统一处理这些静态资源，所以我们约定把所有的静态资源都存放在public目录中
// 那些资源能被用户访问，那些资源不能被用户访问 现在可以通过代码进行灵活的控制

var comment = [
  {
    name: '张三',
    message: 'goodgirl',
    dateTime: '2015-6-7'
  },
  {
    name: '里斯',
    message: 'goodaaa',
    dateTime: '2015-3-4'
  },
  {
    name: '张三风',
    message: 'goodaaaaaa',
    dateTime: '2015-4-2'
  },
  {
    name: '张二哈',
    message: 'badboy',
    dateTime: '2016-7-8'
  },
  {
    name: '李莉莉',
    message: 'goodweee',
    dateTime: '2014-5-6'
  }
]

// /pinglun?name=''&message=''
// 对于这种表单提交的请求路径，由于其具有用户动态填写的内容
// 所以你不可能通过去判断完整的 url 路径来处理这个请求
// 
// 结论: 对于我们来讲，只需要判定，如果你的请求路径是/pinglun的时候
// ，那我就认为你提交的表单的请求就过来了
http
  .createServer((request, response) => {
    // 使用url.parse 方法将路径解析为一个方便操作的对象，第二个参数为true 表示直接将查询字符
    // 串转为对象（通过query属性访问）
    var parseObj = url.parse(request.url, true)

    // 单独获取不包含查询字符串的路径部分
    var pathname = parseObj.pathname

    if (pathname === '/') {
      fs.readFile('./views/index.html', (err, data) => {
        if (err) {
          return response.end('404 Not Found')
        }
        var htmlStr = template.render(data.toString(), {
          comment
        })
        response.end(htmlStr)
      })
    } else if (pathname === '/post') {
      fs.readFile('./views/post.html', (err, data) => {
        if (err) {
          return response.end('404 Not Found')
        }
        response.end(data)
      })
    } else if (pathname.indexOf('/public/') === 0) {
      // 统一处理：
      //      如果请求路径是以 /public/ 开头的，则我认为你要获取 public 中的某个资源
      //      所以我们就直接可以把请求的路径当作文件路径直接进行读取
      fs.readFile('.' + pathname, (err, data) => {
        if (err) {
          return response.end('404 not Found')
        }
        response.end(data)
      })
    } else if (pathname === '/pinglun') {
      // response.end(JSON.stringify(parseObj.query))
      // 我们已经使用 url 模块的 parse 方法把请求路径中的查询字符串给解析成一个对象了
      // 所以接下来要做的就是：
      //      1. 获取表单提交的数据 parseObj.query
      //      2. 生成日期到数据对象中 然后存储到数组中
      //              statusCode
      //      3. 让用户重新定向跳转到首页
      //              setHeader
      //         当用户重新请求 / 的时候 我数组中的数据已经发生变化了 所以页面就会改变

      var date = new Date()
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var today = date.getDate()
      var hour = date.getHours()
      var minutes = date.getMinutes()
      var seconds = date.getSeconds()       
      var newcomment = parseObj.query
      newcomment.dateTime = year + "-" + month + "-" +  today + " " + hour + ":" + minutes + ":" + seconds
      comment.unshift(newcomment)
      // 如何通过服务器让客户端重定向
      // 1. 状态码设置为 302 临时重定向
      // 2. 在响应头中通过 Location 告诉客户端
      // 如果客户端发现收到的服务器的相应的状态码是302 就会自动去响应头中找 Loaction 然后对
      // 该地址发起新的请求
      response.statusCode = 302
      response.setHeader('Location', '/')
      response.end()
    } else {
      // 其他的都处理成 404 找不到
      fs.readFile('./views/404.html', (err, data) => {
        if (err) {
          return response.end('404 not found')
        }
        response.end(data)
      })
    }
  })
  .listen(3000, () => {
    console.log('Server is runing...')
  })
