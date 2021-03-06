'use strict'


var path = require('path');
var util = require('./libs/util');
var wechat_file = path.join(__dirname, './config/wechat.txt') //文本文件
var wechat_ticket_file=path.join(__dirname, './config/wechat_ticket.txt') //文本文件

//存储一些配置信息  
var config = {
    wechat: {
        appID: 'wxad5ccef5463f8361',
        appSecret: 'ce7021db17f3473b1df0f7a0ed969320',
        // appID: 'wx83c153a1e9477fe9',
        // appSecret: 'cac2526167107eb5129145141fc7e4c8',
        token: 'weixin',
        getAccessToken: function() {
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken: function(data) {
        	data=JSON.stringify(data);
            return util.writeFileAsync(wechat_file,data);
        },
        getTicket: function() {
            return util.readFileAsync(wechat_ticket_file);
        },
        saveTicket: function(data) {
            data=JSON.stringify(data);
            return util.writeFileAsync(wechat_ticket_file,data);
        },
    }
}
module.exports=config;