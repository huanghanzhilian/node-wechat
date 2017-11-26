'use strict'

var sha1 = require('sha1'); //引入加密模块
var Wechat = require('./wechat');
var getRawBody=require('raw-body');
var util = require('./libs/util');

//暴露出去的函数
module.exports = function(opts) {
    //var wechat = new Wechat(opts.wechat);
    return function*(next) {
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
	        var content=yield util.parseXMLAsync(data);
	        console.log(data.content);
        }
    }
}