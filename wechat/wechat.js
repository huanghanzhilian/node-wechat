'use strict'

var Promise = require('bluebird');
var request = Promise.promisify(require('request'))
var util = require('./util');
var fs = require('fs');
var prefix = 'https://api.weixin.qq.com/cgi-bin/'; //前缀
var api = {
    accessToken: prefix + 'token?grant_type=client_credential',
    upload: prefix + 'media/upload?', //上传零时素材
}


function Wechat(opts) {
    var that = this;
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken; //获取票据的方法
    this.saveAccessToken = opts.saveAccessToken; //存储票据的方法
    /*this.getAccessToken()
        .then(function(data) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                //更新票据
                return that.updateAccessToken()
            }
            if (that.isValidAccessToken(data)) { //拿到票据判断票据是否在有效期内
                Promise.resolve(data); //将data传下去
                return data;
            } else {
                //更新票据
                return that.updateAccessToken()
            }
        })
        .then(function(data) {
            //拿到最终票据结果
            that.access_token = data.access_token; //挂载到实例上
            that.expires_in = data.expires_in; //过期字段
            that.saveAccessToken(data); //调用存储票据的方法
        })*/
    this.fetchAccessToken()
}

Wechat.prototype.fetchAccessToken = function(data) {
    var that = this;
    if(this.access_token && this.expires_in){
        if(this.isValidAccessToken(this)){
            return Promise.resolve(this);
        }
    }
    this.getAccessToken()
        .then(function(data) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                //更新票据
                return that.updateAccessToken()
            }
            if (that.isValidAccessToken(data)) { //拿到票据判断票据是否在有效期内
                return Promise.resolve(data); //将data传下去
                //return data;
            } else {
                //更新票据
                return that.updateAccessToken()
            }
        })
        .then(function(data) {
            //拿到最终票据结果
            that.access_token = data.access_token; //挂载到实例上
            that.expires_in = data.expires_in; //过期字段
            that.saveAccessToken(data); //调用存储票据的方法

            return Promise.resolve(data)
        })
}


//判断是否过期
Wechat.prototype.isValidAccessToken = function(data) {
    if (!data || !data.access_token || !data.expires_in) {
        return false;
    }
    var access_token = data.access_token; //拿到票据
    var expires_in = data.expires_in; //拿到过期字段
    var now = (new Date().getTime()); //拿到当前时间
    //判断当前时间是否小于过期时间
    if (now < expires_in) {
        //还没过期
        return true;
    } else {
        return false;
    }
}
//票据更新方法
Wechat.prototype.updateAccessToken = function() {
    var appID = this.appID;
    var appSecret = this.appSecret;
    var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;

    return new Promise(function(resolve, response) {
        //request 向某个服务器发请求
        request({ url: url, json: true }).then(function(response) {
            var data = response['body'];
            var now = (new Date().getTime()); //拿到当前时间
            var expires_in = now + (data.expires_in - 20) * 1000;
            data.expires_in = expires_in;

            resolve(data)
        })
    })
}

Wechat.prototype.reply = function() {
    var content = this.body;
    var massage = this.weixin;
    /*console.log(content)
    console.log(1111)*/
    //console.log(massage)
    var xml = util.tpl(content, massage);

    this.status = 200; //设置回复状态为200
    this.type = 'application/xml'; //设置类型xml格式
    this.body = xml;
}



//上传方法
Wechat.prototype.uploadMaterial = function(type, filepath) {
    var that = this;
    var form = {
        media: fs.createReadStream(filepath)
    }

    var appID = this.appID;
    var appSecret = this.appSecret;


    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data) {
                var url = api.upload + 'access_token=' + data.access_token + '&type=' + type;
                //request 向某个服务器发请求
                request({ method: 'POST', url: url, formData: form, json: true }).then(function(response) {
                    var _data = response['body'];

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Upload material fails')
                    }
                })
                .catch(function(err){
                    reject(err)
                })
            })
    })

}

module.exports = Wechat;

