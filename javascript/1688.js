/**
 * @File：阿里巴巴供应商信息抓取
 * @Date：2017/9/7
 */

var casper = require('casper').create({
    waitTimeout: 3000,
    timeout: 80000,
    exitOnError: false,
    pageSettings: {
        javascriptEnabled: true,
        XSSAuditingEnabled: true,
        loadImages: false, // 这里设置为false以后图片请求直接忽略，不会进入onResourceRequested
        loadPlugins: true,
        resourceTimeout: 20000,
        userAgent: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36"
    },
    onTimeout: function() {
        this.echo('[TIME OUT!]');
    },
    onError: function(casper, m) {
        this.echo('[Error:] ' + m);
    },
    onLoadError: function(casper, url, stat) {
        this.echo('[LoadError:] ' + url + '|' + stat);
        if (url.indexOf('login.taobao.com/jump') > 0
            || url.indexOf('corp.1688.com/page/index.htm') > 0
        ) {
            casper.open(url);
        }
    },
    onResourceRequested: function(casper, requestData, networkRequest) {
        //this.echo('Request: ' + requestData.url);
        if (/.css/.test(requestData.url)) {
            networkRequest.abort();
            return true;
        } 
    },
    onResourceReceived: function(casper, resource) {
        //require('utils').dump(resource);
    }
});


var query = casper.cli.raw.get(0);

// 打开搜索页，输入query词，提交表单进行搜索
casper.start('https://s.1688.com/', function() {
    // 点选供应商tab，此操作会改变表单action
    this.clickLabel('供应商', 'a');
    // 等待表单action变更，不然会跳转到登录页
    this.waitFor(
        function check() {
            var formAction = this.getElementInfo('form#j_search_form').attributes.action;   
            return formAction == '//s.1688.com/company/company_search.htm';
        }, 
        function then() {
            // 尽量在当前页打开新页面，waitForPopup感觉有坑
            this.evaluate(function() {
                document.querySelector('#j_search_form').target = '_self';
            });
            // 填写表单并提交
            this.fillSelectors(
                'form#j_search_form',
                {
                    'input#j_q': query
                },
                true // submit
            );
            // 等待搜索结果页打开
            this.waitForUrl(
                /company_search\.htm/, 
                function then() {
                    searchResultPage.call(this);
                },
                function timeout() {
                    this.echo('[表单提交超时！]');
                    this.exit(1);
                },
                3000
            );
        },
        function timeout() {
            this.echo('[等待表单action变更超时！]');
            this.exit(1);
        },
        3000
    );
});;
casper.run();

/**
 * 搜索结果页处理
 */
function searchResultPage() {
    // 匹配到的结果条数
    var count = this.getElementInfo('#breadCrumbText .sm-navigatebar-count').text;
    if (0 == count) {
        this.echo('[没有匹配的结果:]' + query);
        return this.exit(2);
    }
    
    // 第一条结果标题是公司名称，需要跟query精确匹配
    var resultTitle = this.getElementInfo('#offer1 a[offer-stat="com"]').attributes.title;
    if (resultTitle != query) {
        this.echo('[结果未能精确匹配:]' + query + ' != ' + resultTitle);
        return this.exit(2);
    }

    // 点击“更多公司信息”跳转到诚信档案页
    this.evaluate(function() {
        document.querySelector('#offer1 a[offer-stat="morecompany"]').target = '_self';
    });
    this.clickLabel('更多公司信息>', 'a');
    // 等待诚信档案页/黄页打开
    this.waitForUrl(
        /creditdetail\.htm|corp\.1688\.com/,
        function then() {
            creditDetailPage.call(this);
        },
        function timeout() {
            this.echo('[等待诚信档案页/黄页打开超时！]');
            this.exit(1);
        },
        3000
    );
}

/**
 * 诚信档案页/黄页处理
 */
function creditDetailPage() {
    this.echo(this.page.url);
    this.capture('1688_c.png');
    // 如果直接是黄页，返回页面内容
    if (this.page.url.indexOf('corp.1688.com/page/index.htm') > 0) {
        this.echo(this.getPageContent());
        this.exit(0);
    // 否则查看页面是否有黄页链接，点击
    } else {
        this.evaluate(function() {
            document.querySelector('a#J_COMMON_GoToYellowPage').target = '_self';
        });
        this.click('a#J_COMMON_GoToYellowPage'); 
        this.waitForUrl(
            /corp\.1688\.com/,
            function then() {
                creditDetailPage.call(this);
            },
            function timeout() {
                this.echo('[等待黄页打开超时！]');
                this.exit(1);
            },
            3000
        );
    }
}
