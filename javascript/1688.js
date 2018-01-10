/**
 * @File：阿里巴巴供应商信息抓取
 * @Date：2017/9/7
 */

// 设定输出编码
//phantom.outputEncoding = "gbk";
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

// 打开搜索页，输入query词，提交表单进行搜索
casper.start('https://s.1688.com/', function() {
    // 点选供应商tab，此操作会改变表单action
    this.clickLabel('供应商', 'a');
    // 等待一下，让表单action变更完，不然会跳转到登录页
    this.wait(2000, function(){
        // 填写表单并提交
        this.fillSelectors(
            'form#j_search_form',
            {
                'input#j_q': query
            },
            true // submit
        );
        // 等待搜索结果页打开，并切换到结果页
        waitForNewPage.call(this, 0, searchResultPage);
    });
});;
casper.run();

/**
 * 等待一个新窗口打开并切换到新窗口
 */
function waitForNewPage(index, callback) {
    this.waitForPopup(
        index, // 窗口信息，可以是整数，表示第几个打开的窗口，从0开始计数
        function() {
            // 切换到新开窗口
            this.withPopup(
                index,
                function() {
                    // 回调
                    callback.call(this);
                }
            );
        },
        function() {
            this.echo('[waitForPopup timeout:] waitForPopup超时啦！！！'); 
            this.exit(1);
        },
        10000
    );
}

/**
 * 搜索结果页处理
 */
function searchResultPage() {
    // 结果页打开失败
    if (this.page.url.indexOf('s.1688.com/company/company_search.htm') < 0) {
        this.echo('[结果页打开失败:] ' + this.page.url); 
        return this.exit(1);
    }

    // 匹配到的结果条数
    var count = this.getElementInfo('#breadCrumbText .sm-navigatebar-count').text;
    if (0 == count) {
        this.echo('[没有匹配的结果:]' + query);
        return this.exit(2);
    }
    
    // 第一条结果标题是公司名称，需要跟query精确匹配
    var result1_title = this.getElementInfo('#offer1 a[offer-stat="com"]').attributes.title;
    //require('utils').dump(result1_title);
    if (result1_title != query) {
        this.echo('[结果未能精确匹配:]' + result1_title);
        return this.exit(2);
    }

    // 点击“更多公司信息”跳转到诚信档案页
    this.wait(2000, function(){
        this.clickLabel('更多公司信息>', 'a');
        // 等待诚信档案页打开，并切换到诚信档案页
        waitForNewPage.call(this, 0, creditDetailPage);
    });
    // 截图
    // this.capture('1688_r.png');
}

/**
 * 诚信档案页处理
 */
function creditDetailPage() {

    this.capture('1688_c.png');
}
