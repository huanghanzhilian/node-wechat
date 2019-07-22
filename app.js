'use strict'

var Koa = require('koa');
//var koaStatic = require('koa-static');
var path = require('path'); 
var fs = require('fs');
var crypto=require('crypto');//sha1排序算法
var util = require('./libs/util');//读写token扩展
var wechat = require('./wechat/g'); //引入自定义中间件
var config = require('./config');//引入微信配置文件 读写方法
var reply = require('./wx/reply');//微信公众号智能呢个提示
var ejs = require('ejs');
var heredoc = require('heredoc');
var Wechat = require('./wechat/wechat');//微信方法

var tpl = heredoc(function() {
    /*
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>搜电影</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui">
    </head>
    <body>
        <h1>点击标题开始录音1</h1>
        <p id="title"></p>
        <div id="director"></div>
        <div id="year"></div>
        <div id="poster"></div>
    </body>
    <script src="http://zeptojs.com/zepto-docs.min.js"></script>
    <script src="http://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
    <script>
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx1a2b42155c618d7a', // 必填，公众号的唯一标识
            timestamp: '<%= timesstr %>', // 必填，生成签名的时间戳
            nonceStr: '<%= noncestr %>', // 必填，生成签名的随机串
            signature: '<%= signature %>', // 必填，签名，见附录1
            jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline','onMenuShareQQ','onMenuShareQZone','startRecord','stopRecord','translateVoice'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
        wx.ready(function(){
            var shareContent={
                title: '测试',
                desc: '这是一个测试页面',
                link: '',
                imgUrl: 'http://static.samured.com/assets/images/video/cover/iQVBBrK_gEM.jpg',
                success: function() {
                    window.alert('分享成功')
                },
                // 用户取消分享后执行的回调函数
                cancel: function() {
                    window.alert('分享失败')
                }
            }
            // 分享给朋友
            wx.onMenuShareAppMessage(shareContent);

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

            //点击标题开始录音
            var isRecording=false;
            var slides;
            $('#poster').on('click',function(){
                wx.previewImage(slides);
            })
                
            $('h1').on('click',function(){
                if(!isRecording){
                    isRecording=true;
                    wx.startRecord({
                        cancel:function(){
                            window.alert('不搜了')
                        }
                    });
                    return
                }
                isRecording=false;
                wx.stopRecord({
                    success: function (res) {
                        var localId = res.localId;
                        //识别音频
                        wx.translateVoice({
                            localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
                            isShowProgressTips: 1, // 默认为1，显示进度提示
                            success: function (res) {
                                //window.alert(res.translateResult); // 语音识别的结果
                                var result =res.translateResult;
                                $.ajax({
                                    type:'get',
                                    url:'https://api.douban.com/v2/movie/search?q='+result,
                                    dataType:'jsonp',
                                    jsonp:'callback',
                                    success:function(data){
                                        console.log(data)
                                        var subject=data.subjects[0];
                                        console.log(subject)
                                        $('#title').html(subject.title)
                                        $('#director').html(subject.directors[0].name)
                                        $('#poster').html('<img src="'+subject.images.large+'"/>')
                                        $('#year').html(subject.year);
                                        shareContent={
                                            title: subject.title,
                                            desc: '我搜出来了 '+subject.title,
                                            link: '',
                                            imgUrl: subject.images.large,
                                            success: function() {
                                                window.alert('分享成功')
                                            },
                                            // 用户取消分享后执行的回调函数
                                            cancel: function() {
                                                window.alert('分享失败')
                                            }
                                        }
                                        //预览图片接口
                                        slides={
                                            current:subject.images.large,
                                            urls:[subject.images.large]
                                        }
                                        data.subjects.forEach(function(item){
                                            slides.urls.push(item.images.large)
                                        })
                                        wx.previewImage({
                                            current: subject.images.large, // 当前显示图片的http链接
                                            urls: [] // 需要预览的图片http链接列表
                                        });
                                        wx.onMenuShareAppMessage(shareContent);
                                    }
                                    
                                    
                                })
                            }
                        });
                    }
                });
                
            })
            
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



// app.use(function* (next) {
//     if (this.url.indexOf('/movie') > -1) {
//         var wechatApi = new Wechat(config.wechat);
//         var data=yield wechatApi.fetchAccessToken();
//         var access_token=data.access_token;
//         var ticketData=yield wechatApi.fetchTicket(access_token);
//         var ticket=ticketData.ticket;
//         var url=this.href;
//         var params=sign(ticket,url)
//         this.body = ejs.render(tpl,params);
//     }
//     return next;
// })
app.use(wechat(config, reply.reply)) //服务器实例去use 使用中间件




app.listen(1234)
console.log('Listening: 1234')

