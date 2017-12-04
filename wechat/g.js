'use strict'

var sha1 = require('sha1'); //引入加密模块
var Wechat = require('./wechat');
var getRawBody=require('raw-body');
var util = require('./util');

//暴露出去的函数
module.exports = function(opts,handler) {
    var wechat = new Wechat(opts.wechat);
    console.log(1)
    return function*(next) {
        var that = this;
        var token = opts.wechat.token; //拿到token
        var signature = this.query.signature; //拿到一个签名
        var nonce = this.query.nonce; //拿到nonce
        var timestamp = this.query.timestamp; //拿到时间戳
        var echostr = this.query.echostr; //拿到echostr
        //进行字典排序
        var str = [token, timestamp, nonce].sort().join('');
        //进行加密
        var sha = sha1(str);
        //请求方法的判断
        if(this.method==='GET'){
        	//判断加密值是否等于签名值
	        if (sha === signature) {
	            this.body = echostr + '';
	        } else {
	            this.body = '错误';
	        }
        }else if(this.method==='POST'){
        	//微信推送信息
        	if (sha !== signature) {
	            this.body = '错误post';
	            return false;
	        }
	        var data =yield getRawBody(this.req,{
	        	length:this.length,
	        	limit:'1mb',
	        	encoding:this.charset
	        })
	        // console.log(data.toString());
	        var content=yield util.parseXMLAsync(data);//初步解析xml

            var message=util.formatMessage(content.xml);
	        
            this.weixin=message;
            //console.log(this.weixin)

            yield handler.call(this,next)

            wechat.reply.call(this)




            /*if(message.MsgType==='text'){//push过来是一个事件
                    var now=new Date().getTime();//获取当前时间戳
                    that.status=200;//设置回复状态为200
                    that.type='application/xml';//设置类型xml格式
                    //回复主体 
                    var reply='<xml>'+
                     '<ToUserName><![CDATA['+message.FromUserName+']]></ToUserName>'+
                     '<FromUserName><![CDATA['+message.ToUserName+']]></FromUserName>'+
                     '<CreateTime>'+now+'</CreateTime>'+
                     '<MsgType><![CDATA[text]]></MsgType>'+
                     '<Content><![CDATA[hello 欢迎你的到来]]></Content>'+
                     '</xml>';
                     console.log(reply)
                     that.body=reply;
                     return;
            }*/
        }
    }
}