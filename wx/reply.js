'use strict'

var path=require('path');
var config = require('../config');
var Wechat = require('../wechat/wechat');
var menu=require('./menu');
var wechatApi = new Wechat(config.wechat);


//删除菜单
wechatApi.deleteMenu().then(function(){
    wechatApi.createMenu(menu)
    console.log('删除成功')
})


exports.reply = function*(next) {
    var message = this.weixin;

    if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            if (message.EventKey) {
                console.log('扫码进来' + message.EventKey)
            }
            var data = yield wechatApi.getUserInfo(message.FromUserName);
            this.body = '您好'+data.nickname+'欢迎来到我的公众号';
        }
        //取消关注
        else if (message.Event === 'unsubscribe') {
            console.log('无情取关');
            this.body = ''
        }
        //地理位置
        else if (message.Event === 'LOCATION') {
            this.body = '您上报的位置是:' + message.Latitude + '/' + message.Longitude + '-' + message.Precision
        }
        //点击了菜单
        else if (message.Event === 'CLICK') {
            this.body = '您点击了菜单:' + message.EventKey
            if(message.EventKey==='V1001_GOOD'){
                this.body = '谢谢您的点赞'
            }
        }
        //扫描
        else if (message.Event === 'SCAN') {
            console.log('关注后二维码' + message.EventKey + ' ' + message.Ticket)
            this.body = '看到你扫了一下哦';
        }
        //点击菜单中的链接
        else if (message.Event === 'VIEW') {
            this.body = '您点击了菜单中的链接' + message.EventKey;
        }
    } else if (message.MsgType === 'text') {
        var content = message.Content;
        var reply = '额,您说的' + content + ' 太复杂了'
        console.log(message)

        if (content == '1') {
            reply = '天下第一吃大米111';
        } else if (content == '2') {
            reply = '天下第二吃豆腐';
        } else if (content == '3') {
            reply = '天下第三吃仙丹';
        }
        //回复图文
        else if (content == '4') {
            reply = [{
                title: '技术改变世界',
                description: '只是个描述而已',
                picUrl: 'http://blog.huanghanlian.com/uploads/article/3f4598b9-5df6-43e3-a5c1-8d9f2a10ea55.png',
                url: 'http://www.huangweixinccddee.cn/'
            }, {
                title: '游戏',
                description: '好玩',
                picUrl: 'http://blog.huanghanlian.com/uploads/article/3f4598b9-5df6-43e3-a5c1-8d9f2a10ea55.png',
                url: 'https://github.com/huanghanzhilian'
            }];
        } else if (content == '5') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname ,'../2.jpg'));
            //console.log(data)
            reply = {
                type: 'image',
                mediaId: data.media_id
            };
        }
        //视频上传
        else if (content == '6') {
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname,'../6.mp4'));
            //console.log(data)
            reply = {
                type: 'video',
                title: '回复视频',
                description: '描述',
                mediaId: data.media_id
            };
        }
        //音乐
        else if (content == '7') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname,'../2.jpg'));
            reply = {
                type: 'music',
                title: '回复音乐内容',
                description: '放松一下',
                musicUrl: 'http://96.f.1ting.com/5a1f988c/b755645dd872c6db0559cf9be27fe94d/zzzzzmp3/2017kNov/29X/29f_TizzyT/01.mp3',
                thumbMediaId: data.media_id
            };
        }
        //上传永久素材
        else if (content == '8') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname,'../2.jpg'), { type: 'image' });
            reply = {
                type: 'image',
                mediaId: data.media_id
            };
        }
        //上传永久素材 视频
        else if (content == '9') {
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname,'../6.mp4'), { type: 'video', description: '{"title":"我的永久视频", "introduction":"我的永久视频"}' });
            reply = {
                type: 'video',
                title: '回复视频',
                description: '永久上传视频',
                mediaId: data.media_id
            };
        }
        //获取图片对象
        else if (content == '10') {
            var picData = yield wechatApi.uploadMaterial('image', path.join(__dirname,'../2.jpg'), {});
            var meida={
                articlse:[{
                    title:'tututut',
                    thumbMediaId:picData.media_id,
                    author:'Scott',
                    digest:'没有摘要',
                    show_cover_pic:1,
                    content:'没有内容',
                    content_source_url:'https://github.com/huanghanzhilian'

                }]
            }
            var data = yield wechatApi.uploadMaterial('video',meida,{});
            data = yield wechatApi.fetchMaterial(data.media_id);
            console.log(data)
            var item = data.news.item;
            var news=[];
            item.forEach(function(item){
                news.push({
                    title:item.title,
                    description:item.description,
                    picUrl: picData.url,
                    url: item.url
                })
            })
            reply = {
                type: 'video',
                title: '回复视频',
                description: '永久上传视频',
                mediaId: data.media_id
            };
        }
        //新建分组
        else if (content == '12') {
            var group = yield wechatApi.createGroup('aawechat1');
            console.log('新分组 wechat1')
            console.log(group)
            /*reply = {
                type: 'image',
                mediaId: data.media_id
            };*/
        }
        //获取用户信息
        else if (content == '13') {
            var data = yield wechatApi.getUserInfo(message.FromUserName);
            console.log(data)
            reply = '您好'+data.nickname+'欢迎来到我的公众号'
        }
        this.body = reply;
    }

    yield next
};