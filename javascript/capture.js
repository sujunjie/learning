// 使用casperjs截图web页面
// 使用方法：
//     casperjs capture.js 'www.sujunjie.cn'
var casper = require('casper').create({
    pageSettings: {
        javascriptEnabled: true,
        XSSAuditingEnabled: true,
        loadImages: true,
        loadPlugins: true,
        userAgent: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36"
    },
    onError: function(casper, m) {
    },
    onLoadError: function(casper, url, stat) {
    }
});

var url = casper.cli.raw.get(0);
casper.start(url);

casper.then(function() {
    this.wait(5000, function(){
        this.echo(this.page.url);
        this.echo(this.getTitle());
        this.capture('c.png');
    });
});

casper.run();
