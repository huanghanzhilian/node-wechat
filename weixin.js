'use strict'

var config=require('./config');
var Wechat=require('./wechat/wechat');
var wechatApi=new Wechat(config.wechat);

exports.reply = function*(next) {
    var message = this.weixin;

    if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            if (message.EventKey) {
                console.log('扫码进来' + message.EventKey)
            }
            this.body = '哈哈，你订阅了我的公众号'
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
            reply = '天下第一吃大米';
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
                picUrl: 'http://static.samured.com/assets/images/video/cover/iQVBBrK_gEM.jpg',
                url: 'http://www.huanghanlian.com/'
            }, {
                title: '游戏',
                description: '好玩',
                picUrl: 'http://static.samured.com/assets/images/video/cover/Dnnq9FDEubI.jpg',
                url: 'https://github.com/huanghanzhilian'
            }];
        } else if (content == '5') {
        	var data =yield wechatApi.uploadMaterial('image',__dirname +'/2.jpg');
        	//console.log(data)
            reply = {
            	type:'image',
            	mediaId:data.media_id
            };
        }
        //视频上传
        else if (content == '6') {
        	var data =yield wechatApi.uploadMaterial('video',__dirname +'/6.mp4');
        	//console.log(data)
            reply = {
            	type:'video',
            	title:'回复视频',
            	description: '描述',
            	mediaId:data.media_id
            };
        }
        //音乐
        else if (content == '7') {
        	var data =yield wechatApi.uploadMaterial('image',__dirname +'/2.jpg');
            reply = {
            	type:'music',
            	title:'回复音乐内容',
            	description: '放松一下',
            	musicUrl:'http://96.f.1ting.com/5a1f988c/b755645dd872c6db0559cf9be27fe94d/zzzzzmp3/2017kNov/29X/29f_TizzyT/01.mp3',
            	thumbMediaId:data.media_id
            };
        }
        this.body = reply;
    }

    yield next
};