# 项目功能

1. 使用nodejs。开发微信公众号
2. 通过接口配置公众号菜单栏
3. 开发公众号输入关键字对话聊天功能
4. 扫码事件等公众号API调用
5. 贯通整个微信公众号ticket机制，为前端后期登录授权工作做好后端知识铺垫
6. 使用node为前端微信分享，分享朋友圈调用api，做好api对接工作


#### 运行

node --harmony app


#### 代理

./ngrok -config ngrok.cfg -subdomain node-wechat 1234


启动路径
g:/开发工具/ngrok国内版/ngrok国内版/windows_386/windows_386

线上地址：http://wx.huangweixinccddee.cn/wx

隧道代理测试地址： http://node-wechat.tunnel.qydev.com/wx/


此例子已经上线(例子很简单，后期会添加新功能)

### 微信扫描下方二维码进入公众号

<img src="http://blog.huanghanlian.com/uploads/article/82aa168b-9943-488d-8c2b-c462a8a577d9.png" width="250" height="250"/>




# 项目部署


cd /etc/nginx/conf.d
sudo vi short-huanghanlian-com-1234.conf

```
upstream node_wechat {
        server 127.0.0.1:1234;
}



server {
        listen 80;
        server_name wx.huangweixinccddee.cn;

        location / {
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forward-For $proxy_add_x_forwarded_for;
                proxy_set_header Host $http_host;
                proxy_set_header X-Nginx-Proxy true;

                proxy_pass http://node_wechat;
                proxy_redirect off;
        }
}
```

检测配置文件有没有错误
sudo nginx -t

nginx重启
sudo nginx -s reload