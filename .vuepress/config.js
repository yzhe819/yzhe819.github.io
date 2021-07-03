module.exports = {
    "title": "yzhe819",
    "description": "走出心灵要比走进心灵更难",
    "dest": "public",
    "head": [
        [
            "link",
            {
                "rel": "icon",
                // 网页头的图标
                "href": "/favicon.ico"
            }
        ],
        [
            "meta",
            {
                "name": "viewport",
                "content": "width=device-width,initial-scale=1,user-scalable=no"
            }
        ]
    ],
    "theme": "reco",
    // 主题配置文件
    "themeConfig": {
        smoothScroll: true,
        // 导航栏配置
        "nav": [{
                "text": "Home",
                "link": "/",
                "icon": "reco-home"
            },
            {
                "text": "TimeLine",
                "link": "/timeline/",
                "icon": "reco-date"
            },
            // 原用于导向theme-repo文档
            // {
            //     "text": "Docs",
            //     "icon": "reco-message",
            //     "items": [{
            //         "text": "vuepress-reco",
            //         "link": "/docs/theme-reco/"
            //     }]
            // },
            {
                "text": "Contact",
                "icon": "reco-message",
                "items": [{
                    "text": "GitHub",
                    "link": "https://github.com/yzhe819",
                    "icon": "reco-github"
                }, {
                    "text": "Bilibili",
                    "link": "https://space.bilibili.com/81079806",
                    "icon": "reco-message"
                }]
            }
        ],
        "sidebar": {
            // 指定sidebar，没什么大用
            // "/docs/theme-reco/": [
            //     "",
            //     "theme",
            //     "plugin",
            //     "api"
            // ]
        },
        // 风格
        "type": "blog",
        "blogConfig": {
            "category": {
                "location": 2,
                "text": "Category"
            },
            "tag": {
                "location": 3,
                "text": "Tag"
            }
        },
        // 友链配置
        "friendLink": [{
            "title": "向晚大魔王",
            "desc": "今夜我们都是顶碗人嗷💜",
            "logo": "/wanwan.jpg",
            "link": "https://space.bilibili.com/672346917?from=search&seid=4668280302037161640",
        }, {
            "title": "嘉然今天吃什么",
            "desc": "兄弟们反转了，我也是嘉心糖🤤🤤🤤",
            "logo": "/ranran.jpg",
            "link": "https://space.bilibili.com/672328094?from=search&seid=12849214525199858120",
        }],
        // 左上角图标 - 通常直接关了
        // "logo": "/logo.png",
        // 是否开启搜索
        "search": true,
        "searchMaxSuggestions": 10,
        "lastUpdated": "Last Updated",
        "author": "",
        "authorAvatar": "/img/avatar.png",
        "record": "MIT License",
        "startYear": "2020"
    },
    // 代码行数是否显示
    "markdown": {
        "lineNumbers": true
    },
    "plugins": [
        [
            "@vuepress-reco/vuepress-plugin-rss",
            {
                name: '@vuepress-reco/rss', // 使用名称
                desc: '生成 RSS 页面', // 描述
                user: 'yzhe819', // Github 用户名称
                repo: 'yzhe819.github.io', // Github 项目名称
                feature: 'feature', // 类型：style（优化主题效果），feature（扩展主题功能）
                scenes: 'independent' // 使用场景：develop（为主题开发提供组件或方法），independent（单纯扩展主题功能）
            }

        ],
    ],

}