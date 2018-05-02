// 使用casperjs截图web页面
// 使用方法：
//     casperjs capture.js 'http://www.sujunjie.cn'
var casper = require('casper').create({
    pageSettings: {
        javascriptEnabled: true,
        XSSAuditingEnabled: true,
        loadImages: true,
        loadPlugins: true,
        userAgent: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36"
    },
    onError: function(casper, m) {
        this.echo(m);
    },
    onLoadError: function(casper, url, stat) {
        this.echo(url);
    }
});

// 要请求的url
var url = casper.cli.raw.get(0);
// 可以指定一个延迟时间，防止一些js setTimeout跳转。单位：毫秒
var waitMilliSecond = parseInt(casper.cli.raw.get(1), 10);
casper.start(url);

casper.then(function() {
    this.wait(waitMilliSecond, function(){
        this.echo(this.page.url);
        this.echo(this.getTitle());
        //this.echo(this.getPageContent());
        //require('utils').dump(this.page.cookies);
        this.capture('c.png');
    });
});

casper.run();
