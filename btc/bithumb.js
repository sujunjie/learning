/**
 * @File：
 * @Author: 苏俊杰
 * @Date：2018/1/12
 * @Usage: casperjs --cookies-file=/tmp/phantom/cookies.txt --ssl-protocol=ANY --ignore-ssl-errors=true bithumb.js
 * @Params: 
 * @Exit:
 *  0   成功
 *  1   抓取失败
 */

// casper对象初始化
var casper = require('casper').create({
    waitTimeout: 3000,
    timeout: 20000,
    exitOnError: false,
    pageSettings: {
        javascriptEnabled: true,
        XSSAuditingEnabled: true,
        loadImages: false, // 这里设置为false以后图片请求直接忽略，不会进入onResourceRequested
        loadPlugins: true,
        resourceTimeout: 10000,
        userAgent: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36"
    },
    onTimeout: function() {
        this.echo('[TIME OUT]');
    },
    onError: function(casper, m) {
        this.echo('[Error] ' + m);
    },
    onDie: function() {
        this.echo('[Die]');
    },
    onLoadError: function(casper, url, stat) {
        this.echo('[LoadError] ' + url + '|' + stat);
    },
    onResourceRequested: function(casper, requestData, networkRequest) {
        // 跳过样式表
        if (/\.css|\.json|googleads\.g\.doubleclick\.net|\.google-analytics\.com|\.facebook\.net|wcs\.naver\.net|\.googleadservices\.com|adimg\.daumcdn\.net/.test(requestData.url)) {
            networkRequest.abort();
            return true;
        } 
        this.echo('[Request] ' + requestData.url);
    },
    onResourceReceived: function(casper, resource) {
        //require('utils').dump(resource);
    }
});

// 打开搜索页，输入query词，提交表单进行搜索
casper.start('https://www.bithumb.com/', function() {
    this.waitFor(
        function check() {
            // 等待最后一行第3列显示值
            return this.evaluate(
                function() {
                    var tr = document.querySelectorAll('#tableAsset tr');
                    var lastPrice = tr[tr.length-1].querySelectorAll('td')[2].innerHTML;
                    return tr && lastPrice != '';
                }
            );
        },
        function then() {
            this.echo(this.getHTML('#tableAsset'));
            this.exit(0);
        },
        function timeout() {
            this.echo('[Timeout]');
            this.exit(1);
        },
        3000
    );
});
casper.run();
