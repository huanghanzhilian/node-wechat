'use strict'

var xml2js=require('xml2js');//解析xml需要`xml2js`模块
var Promise = require('bluebird');

//导出方法
exports.parseXMLAsync=function(xml){
	//返回一个Promise对象
	return new Promise(function(resolve,reject){
		xml2js.parseString(xml,{trim:true},function(err,content){
			if(err)reject(err)
			else resolve(content)
		})//解析xml
	})
}