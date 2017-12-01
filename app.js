'use strict'

var Koa = require('koa');
var koaStatic = require('koa-static');
var path = require('path');
var fs = require('fs');
var crypto=require('crypto');
var util = require('./libs/util');
var wechat = require('./wechat/g'); //引入自定义中间件
var config = require('./config');
var reply = require('./wx/reply');
var ejs = require('ejs');
var heredoc = require('heredoc');
var Wechat = require('./wechat/wechat');

var tpl = heredoc(function() {
    /*
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>微信测试</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui">
    </head>
    <body>
        hello
    </body>
    <script src="http://www.zeptojs.cn/zepto.js"></script>
    <script src="http://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
    <script>
        wx.config({
            debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx1a2b42155c618d7a', // 必填，公众号的唯一标识
            timestamp: '<%= timesstr %>', // 必填，生成签名的时间戳
            nonceStr: '<%= noncestr %>', // 必填，生成签名的随机串
            signature: '<%= signature %>', // 必填，签名，见附录1
            jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline','onMenuShareQQ','onMenuShareQZone'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
        wx.ready(function(){
            wx.onMenuShareAppMessage({ // 分享给朋友
                title: '测试', // 分享标题
                desc: '这是一个测试页面', // 分享描述
                link: '', // 分享链接 默认以当前链接
                imgUrl: 'http://static.samured.com/assets/images/video/cover/iQVBBrK_gEM.jpg', // 分享图标
                // 用户确认分享后执行的回调函数
                success: function() {
                    //alert('成功')
                },
                // 用户取消分享后执行的回调函数
                cancel: function() {
                    //alert('分享到朋友取消')
                    //console.log('分享到朋友取消');
                }
            });
            //分享到朋友圈
            wx.onMenuShareTimeline({
                title: '测试', // 分享标题
                desc: '这是一个测试页面', // 分享描述
                link: '', // 分享链接 默认以当前链接
                imgUrl: 'http://static.samured.com/assets/images/video/cover/iQVBBrK_gEM.jpg', // 分享图标
                // 用户确认分享后执行的回调函数
                success: function() {
                    //alert('成功')
                },
                // 用户取消分享后执行的回调函数
                cancel: function() {
                    //alert('分享到朋圈友取消')
                    //console.log('分享到朋圈友取消');
                }
            });
            //分享到qq
            wx.onMenuShareQQ({
                title: '测试', // 分享标题
                desc: '这是一个测试页面',
                link: '',
                imgUrl: 'http://static.samured.com/assets/images/video/cover/iQVBBrK_gEM.jpg',
                // 用户确认分享后执行的回调函数
                success: function() {
                    //alert('成功')
                },
                // 用户取消分享后执行的回调函数
                cancel: function() {
                    //alert('分享到朋圈友取消')
                    //console.log('分享到朋圈友取消');
                }
            });
            //分享到qq空间
            wx.onMenuShareQZone({
                title: '测试', // 分享标题
                desc: '这是一个测试页面',
                link: '',
                imgUrl: 'http://static.samured.com/assets/images/video/cover/iQVBBrK_gEM.jpg',
                // 用户确认分享后执行的回调函数
                success: function() {
                    //alert('成功')
                },
                // 用户取消分享后执行的回调函数
                cancel: function() {
                    //alert('分享到朋圈友取消')
                    //console.log('分享到朋圈友取消');
                }
            });
            
        });
    </script>
    </html>
    */
});
//生产随机字符串
var createNonce=function(){
    return Math.random().toString(36).substr(2,15);
}
//生成时间戳
var createTimestamp=function(){
    return parseInt(new Date().getTime()/1000,10)+'';
}
var _sign=function(noncestr,ticket,timesstr,url){
    var params=[
        'noncestr='+noncestr,
        'jsapi_ticket='+ticket,
        'timestamp='+timesstr,
        'url='+url
    ]
    var str=params.sort().join('&');
    var shasum=crypto.createHash('sha1');
    shasum.update(str);
    return shasum.digest('hex');
}
//生产签名
function sign(ticket,url){
    var noncestr=createNonce();
    var timesstr=createTimestamp();
    var signature=_sign(noncestr,ticket,timesstr,url);
    return {
        noncestr:noncestr,
        timesstr:timesstr,
        signature:signature
    }
}


var app = new Koa(); //实例化koa web服务器
app.use(koaStatic(path.join(__dirname,'./dist'))); // 将 webpack 打包好的项目目录作为 Koa 静态文件服务的目录
//console.log(config)
app.use(function* (next) {
    this.body=fs.readFileSync(path.resolve(__dirname, './dist/index.html'), 'utf-8')
    if (this.url.indexOf('/movie') > -1) {
        var wechatApi = new Wechat(config.wechat);
        var data=yield wechatApi.fetchAccessToken();
        var access_token=data.access_token;
        var ticketData=yield wechatApi.fetchTicket(access_token);
        var ticket=ticketData.ticket;
        var url=this.href;
        var params=sign(ticket,url)
        this.body = ejs.render(tpl,params);
    }
    if (this.url.indexOf('/test') > -1) {
        console.log(this.query.url)
        var wechatApi = new Wechat(config.wechat);
        var data=yield wechatApi.fetchAccessToken();
        var access_token=data.access_token;
        var ticketData=yield wechatApi.fetchTicket(access_token);
        var ticket=ticketData.ticket;
        var url=this.query.url;
        var params=sign(ticket,url)
        this.body=params;
    }
    /*if (this.url.indexOf('/my') > -1) {
        this.body=fs.readFileSync(path.resolve(__dirname, './dist/index.html'), 'utf-8')
    }*/

    return next;
})


app.use(wechat(config, reply.reply)) //服务器实例去use 使用中间件
/*app.get('/test', function(req, res) {
    console.log(req)
    const html = fs.readFileSync(path.resolve(__dirname, './dist/index.html'), 'utf-8')
    res.send(html)
})*/


app.listen(1234)
console.log('Listening: 1234')

