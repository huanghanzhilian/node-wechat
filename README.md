#### 运行

node --harmony app


#### 代理

./ngrok -config ngrok.cfg -subdomain node-wechat 1234


启动路径
g:/开发工具/ngrok国内版/ngrok国内版/windows_386/windows_386

线上地址：http://wechat.huanghanlian.com/wx/

隧道代理测试地址： http://node-wechat.tunnel.qydev.com/wx/


此例子已经上线(例子很简单，后期会添加新功能)

### 微信扫描下方二维码进入公众号

<img src="https://upload-images.jianshu.io/upload_images/3877962-84187ee34aa5008d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240" width="250" height="250"/>


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