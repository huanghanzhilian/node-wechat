'use strict'

module.exports = {
    "button": [{
            "type": "view",
            "name": "博客首页",
            "url": "http://www.huanghanlian.com/"
        },
        {
            "name": "菜单",
            "sub_button": [{
                    "type": "view",
                    "name": "博客首页",
                    "url": "http://www.huanghanlian.com/"
                },
                {
                    "type": "scancode_push",
                    "name": "扫码推事件",
                    "key": "qr_scan",
                    "sub_button": []
                },
                {
                    "type": "click",
                    "name": "赞一下我们",
                    "key": "V1001_GOOD"
                }
            ]
        }
        // ,{
        //     "type": "click",
        //     "name": "点击事件2",
        //     "key": "menu_click2"
        // }
    ]
};