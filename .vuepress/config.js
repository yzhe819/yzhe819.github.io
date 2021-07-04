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
        // smoothScroll: true,
        // 导航栏配置
        "nav": require("./nav"),
        // 侧边栏配置
        "sidebar": require("./sidebar"),
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
        "friendLink": require("./links"),
        // 是否开启搜索
        "search": true,
        "searchMaxSuggestions": 10,
        "lastUpdated": "Last Updated",
        "author": "yzhe819",
        "authorAvatar": "avatar.png",
        "startYear": "2020",
        "smooth": "true", //平滑滚动
        "editLinks": true, // 开启编辑链接功能
        "editLinkText": '帮助我们改善此页面', // 自定义超链接的文本内容
    },
    // 代码行数是否显示
    "markdown": {
        "lineNumbers": true
    },
    // 插件配置
    "plugins": require("./plugins"),

}