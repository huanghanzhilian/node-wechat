'use strict'


var path = require('path');
var util = require('./libs/util');
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
module.exports=config;