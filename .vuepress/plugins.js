module.exports = [
    [
        "@vuepress-reco/vuepress-plugin-rss",
        {
            site_url: "https://yzhe819.github.io/", //网站地址
            copyright: "Tsanfer", //版权署名
            name: "yzhe819", // 使用名称
            desc: "yzhe819's Blog", // 描述
            repo: 'yzhe819.github.io', // Github 项目名称
            feature: 'feature', // 类型：style（优化主题效果），feature（扩展主题功能）
            scenes: 'independent' // 使用场景：develop（为主题开发提供组件或方法），independent（单纯扩展主题功能）
        }

    ],
    // 留言插件
    ['@vuepress-reco/comments', {
        solution: 'valine',
        options: {
            appId: '716a147b5d7019b5e16a', // appId
            appKey: 'b1151b58a8afe3103683026c4e844e235ad02c7f', // appKey
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