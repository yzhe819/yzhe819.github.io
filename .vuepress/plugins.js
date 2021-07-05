module.exports = [
    [
        "@vuepress-reco/vuepress-plugin-rss",
        {
            site_url: "https://yzhe819.github.io", //网站地址
            copyright: "yzhe819", //版权署名
            name: "yzhe819", // 使用名称
            desc: "yzhe819's Blog", // 描述
            feature: 'feature', // 类型：style（优化主题效果），feature（扩展主题功能）
            scenes: 'independent' // 使用场景：develop（为主题开发提供组件或方法），independent（单纯扩展主题功能）
        }

    ],
    // 留言插件
    ['@vuepress-reco/comments', {
        solution: 'valine',
        options: {
            appId: 'RAlP9rWo1QHs374uTzUOWVbO-MdYXbMMI', // appId
            appKey: 'y9HIy1Ovkn4AsYPlGyEVtBfH', // appKey
            placeholder: '来都来了，不说点什么吗...', // 评论框占位提示符
        }
    }],
    ['vuepress-plugin-code-copy', true], // 代码复制插件
    // 动态网页标签
    [
        'dynamic-title',
        {
            showIcon: "/favicon.ico",
            showText: "(❁´◡`❁) Welcome! ",
            hideIcon: "/favicon.ico",
            hideText: "(●'◡'●) 404",
            recoverTime: 2000
        }
    ]
]