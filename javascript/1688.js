/**
 * @File：阿里巴巴供应商信息抓取
 * @Date：2017/9/7
 */

// 设定输出编码
phantom.outputEncoding = "gbk";
// 清空cookie
//phantom.clearCookies();

var casper = require('casper').create({
    clientScripts: ["jquery.min.js"],
    pageSettings: {
        javascriptEnabled: true,
        XSSAuditingEnabled: true,
        loadImages: true, // 这里设置为false以后图片请求直接忽略，不会进入onResourceRequested
        loadPlugins: true,
        userAgent: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36"
    },
    onError: function(casper, m) {
        this.echo('[Error:] ' + m);
    },
    onLoadError: function(casper, url, stat) {
        this.echo('[LoadError:] ' + url + '|' + stat);
    },
    onResourceRequested: function(casper, requestData, networkRequest) {
    }
});

var query = casper.cli.raw.get(0);

casper.start('https://s.1688.com/', function() {
    // 点选供应商tab
    this.clickLabel('供应商', 'a');
    this.wait(1000,function(){
        // 填写表单并提交
        this.fillSelectors(
            'form#j_search_form',
            {
                'input#j_q': query
            },
            true // submit
        );
    });
});;

// 等待搜索结果页打开
casper.waitForPopup(
    0, // 第一个打开的页面
    function() {
        this.echo('[Popup:] url:' + this.popups[0]['url'] + ', title:' + this.popups[0]['title']);
        this.capture('1688_s.png');
        // 切换到新开窗口
        this.withPopup(
            0,
            function() {
                this.echo('[结果页url:] ' + this.page.url);
                // 截图
                this.capture('1688_r.png');
            }
        );
    },
    function() {
        this.echo('[Warning:] waitForPopup超时啦！！！'); 
    },
    10000
);

casper.run();
