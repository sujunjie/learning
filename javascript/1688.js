/**
 * @File：阿里巴巴(https://s.1688.com/)供应商信息抓取
 * @Author: 苏俊杰
 * @Date：2018/1/12
 * @Usage: casperjs --cookies-file=/tmp/phantom/cookies.txt --ssl-protocol=ANY --ignore-ssl-errors=true 1688.js '岳阳柏奎电磁机械有限公司'
 * @Params: 
 *  $1  要查询的query，比如企业名称
 * @Exit:
 *  0   成功找到黄页
 *  1   抓取失败，需重试
 *  2   未找到query匹配的结果，不需要重试
 */

// casper对象初始化
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
        // phantomjs的坑，一些请求始终会loaderror，这里捕获到指定url loaderror时再open一次就好了...
        if (url.indexOf('login.taobao.com/jump') > 0
            || url.indexOf('corp.1688.com/page/index.htm') > 0
        ) {
            casper.open(url);
        }
    },
    onResourceRequested: function(casper, requestData, networkRequest) {
        // 跳过样式表和打点日志请求，跳过图片请求在pageSettings中已经设置，这里不需要重复设置
        if (/.css|log.mmstat.com/.test(requestData.url)) {
            networkRequest.abort();
            return true;
        } 
    },
    onResourceReceived: function(casper, resource) {
    }
});

// 脚本接受唯一参数：查询query
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
            // 尽量在当前页打开新页面，waitForPopup有坑
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
 * @param void
 * @return void
 */
function searchResultPage() {
    // 匹配到的结果条数
    this.waitForSelector(
        '#breadCrumbText .sm-navigatebar-count',
        function then() {
            var count = this.getElementInfo('#breadCrumbText .sm-navigatebar-count').text;
            if (0 == count) {
                this.echo('[没有匹配的结果]' + query);
                return this.exit(2);
            }

            // 遍历结果，取公司名精确匹配的
            for (var i = 1; i <= count && i <= 10; i++) {
                var resultTitle = this.getElementInfo('#offer' + i +' a[offer-stat="com"]').attributes.title;
                if (resultTitle == query) {
                    // 点击“更多公司信息”跳转到诚信档案页
                    this.evaluate(function(i) {
                        document.querySelector('#offer' + i + ' a[offer-stat="morecompany"]').target = '_self';
                    }, i);
                    this.click('#offer' + i + ' a[offer-stat="morecompany"]');
                    // 等待诚信档案页/黄页打开
                    this.waitForUrl(
                        /creditdetail\.htm|corp\.1688\.com/,
                        function then() {
                            creditDetailPage.call(this);
                        },
                        function timeout() {
                            this.echo('[等待诚信档案页/黄页打开超时]当前url:' + this.page.url);
                            this.exit(1);
                        },
                        3000
                    );
                    break;
                }
            }
            
            // 没有能精确匹配的结果
            if (i > count || i > 10) {
                this.echo('[结果未能精确匹配]' + query + ' != ' + resultTitle);
                return this.exit(2);
            }
        },
        function timeout() {
            this.echo('[没有匹配的结果]' + query);
        },
        3000
    );
}

/**
 * 诚信档案页/黄页处理
 * @param void
 * @return void
 */
function creditDetailPage() {
    // 如果直接是黄页，返回页面内容
    if (this.page.url.indexOf('corp.1688.com/page/index.htm') > 0) {
        this.echo('黄页抓取成功！');
        this.echo(this.getPageContent());
        this.exit(0);
    // 否则查看页面是否有黄页链接，点击
    } else {
        this.waitForSelector(
            'a#J_COMMON_GoToYellowPage',
            function then() {
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
            },
            function timeout() {
                this.echo('[档案页打开失败]当前url' + this.page.url);
                this.exit(1);
            },
            3000
        );
    }
}
