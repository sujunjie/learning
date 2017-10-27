/**
 * @File：页脚搜狗广告点击
 * @Date：2017/9/7
 */

// 清空cookie
phantom.clearCookies();

var adUrl = '';
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
        //if (requestData.url.indexOf('sogou.com/ct?id=900194&h=90&w=728&') != -1) {
        if (requestData.url.indexOf('sogou.com/ct?id=902847&h=90&w=728&') != -1) {
            adUrl = requestData.url;
        }
    }
});

var click = casper.cli.raw.get(0);

casper.start('http://sujunjie.cn/everyonelikestoeat/');


casper.waitFor(
    function check() {
        return adUrl != '';
    },
    function then() {
        this.evaluate(function() {
            $(document).scrollTop(window.document.body.scrollHeight);   
        });
        if (0 == click) {
            this.echo('[Click is 0:] exit!');
            this.exit(0);
        }

        // 切换到广告窗口，点击广告
        casper.withFrame(0, function(){
            // this.echo(this.getPageContent());
            this.click('#div_ad a');
        });

    },
    function () {
        this.echo('[Warning:] waitFor超时啦！！！'); 
    },
    10000
);


// 等待第一个新窗口打开
casper.waitForPopup(
    0, 
    function() {
        this.echo('[Popup:] url:' + this.popups[0]['url'] + ', title:' + this.popups[0]['title']);
    },
    function() {
        this.echo('[Warning:] waitForPopup超时啦！！！'); 
    },
    10000
);

// 切换到第一个子窗口
/*
casper.withPopup(
    0,
    function() {
        // 截图
        // this.capture('sogou.png');
    }
);
*/

casper.run();
