'use strict'
exports.reply=function* (next){
	var message=this.weixin;

	if(message.MsgType ==='event'){
		if(message.Event==='subscribe'){
			if(message.EventKey){
				console.log('扫码进来'+message.EventKey)
			}
			this.body='哈哈，你订阅了我的公众号'
		}
	}else if(message.Event==='unsubscribe'){
		console.log('无情取关')
	}else if(message.MsgType ==='text'){
		console.log(message)
		if(message.Content=='你好'){
			this.body='你好'
		}else if(message.Content=='李晗'){
			this.body='我永远爱你亲爱的'
		}else if(message.Content=='傻瓜'){
			this.body='你才是傻瓜'
		}else{
			this.body='哈哈，你订阅了我的公众号'
		}
		//this.body='哈哈，你订阅了我的公众号'
	}

	yield next
};