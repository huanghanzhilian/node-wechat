'use strict'

var Koa = require('koa');
var path = require('path');
var util = require('./libs/util');
var wechat = require('./wechat/g'); //引入自定义中间件
var config=require('./config');
var reply=require('./wx/reply');


var app = new Koa(); //实例化koa web服务器
//console.log(config)
app.use(wechat(config,reply.reply)) //服务器实例去use 使用中间件
app.listen(1234)
console.log('Listening: 1234')