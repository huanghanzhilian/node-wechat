'use strict'

var Koa = require('koa');
var path = require('path');
var util = require('./libs/util');
var wechat = require('./wechat/g'); //引入自定义中间件
var wechat_file = path.join(__dirname, './config/wechat.txt') //文本文件
//存储一些配置信息
var config = {
    wechat: {
        appID: 'wx1a2b42155c618d7a',
        appSecret: 'e20ea29de64febee0fbf4c1caf835279',
        token: 'weixin',
        getAccessToken: function() {
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken: function(data) {
        	data=JSON.stringify(data);
            return util.writeFileAsync(wechat_file,data);
        },
    }
}
var app = new Koa(); //实例化koa web服务器
app.use(wechat(config)) //服务器实例去use 使用中间件
app.listen(1234)
console.log('Listening: 1234')