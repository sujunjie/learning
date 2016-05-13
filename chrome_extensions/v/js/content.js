/**
 * @file：百度浏览器插件“诚信照妖镜”注入页content.js
 * @version：1.0.0
 * @author：sujunjie@baidu.com
 * @date：2014/12/23
 */
  
(function(W, $, undefined){

	/**
	 * 变量初始化
	 */
	var
	/* 偏好设置接口 */
	userHabitSetUrl = 'http://tag.baidu.com/bird/vplugin/riskLevelAjax',

	/* 获取插件中图片路径 */
	redMarkPngUrl = chrome.extension.getURL('../icons/red_w.png'),
	yellowMarkPngUrl = chrome.extension.getURL('../icons/yellow_w.png'),
	greenMarkPngUrl = chrome.extension.getURL('../icons/green_w.png'),
	redAlertUrl = chrome.extension.getURL('../icons/red_alert.png'),
	leftWPngUrl = chrome.extension.getURL('../icons/left_w.png'),
	xPngUrl = chrome.extension.getURL('../icons/x.png'),

	/* 当前url */
	currentUrl = W.location.href;
	
	/**
	 * 添加请求监听函数，根据act进行不同操作
	 */
	chrome.extension.onRequest.addListener(
		/**
		 * @event
		 * @param object request            request对象
		 * @param object sender             sender对象
		 * @param function sendResponse     sendResponse函数
		 */
	  	function(request, sender, sendResponse) {
	  		switch (request.act) {
	  			case 'getReferrer':
	  				var referrer = document.referrer;
	  				if (!referrer) {
	  					referrer = null;
	  				}
	  				sendResponse({referrer:referrer});
	  				break;
	  			default:
	  				break;
	  		}
		}
	);

	/**
	 * 页面横框提示
	 * @param url               插件传递过来的url，跟当前页面url对比，访问页面快速跳转引起的弹出多个相同横框
	 * @param color             横框的颜色
	 * @param warnWord          横框的内容
	 * @return void
	 */
	function showWarning(url, color, warnWord) {
		if (url != currentUrl) {
			return false;
		}
		$(".bd-cxzyj-" + color).remove();

		var backgroundUrl = null,
			displayTime = 3000, // 横框展示持续时间，单位为毫秒
			hideTime = 500, // 横框隐藏动画持续时间，单位为毫秒
			top = 0, // warning横框top值
			warningHeight = 50, // warning横框高度
			icon = '',
			warnings = $(".bd-cxzyj-warning");

		// 页面最多会出2个横幅提示，如果页面上已经有横幅，需要修改当前横幅的top和展现时间
		if (warnings) {
			top = warningHeight * warnings.size();
			displayTime = displayTime - hideTime * warnings.size();
		}

		switch (color) {
			case "green":
			case "blue":
				backgroundUrl = greenMarkPngUrl;
				break;
			case "red":
				backgroundUrl = redMarkPngUrl;
				break;
			case "yellow":
				backgroundUrl = yellowMarkPngUrl;
				break;
			default:
				break;
		}
		if ('' != backgroundUrl) {
			icon = '<span class="icon" style="background-image:url(' + backgroundUrl + ')"></span>';
		}
		$("body").append(
				"<div class = 'bd-cxzyj-warning bd-cxzyj-" + color + "' style='top:" + top + "px;background-image:url(" + leftWPngUrl + ")'>"
					+ icon + '<span>' + warnWord + '</span>'
					+'<span class="close-x" style="background-image: url(' + xPngUrl + ')"></span>'
				+ "</div>"
		);

		// 关闭按钮
		$(".close-x").click(
			function(){
				$(this).parent().remove();
			}
		);

		// 横框自动隐藏
		$(".bd-cxzyj-warning").delay(displayTime).animate({height:'0px',opacity:0}, hideTime, function(){
			$(this).remove();
		});
	}

	/**
	 * 高危站点弹框提示
	 * @param desc              高危描述
	 * @return void
	 */
	function showDanger(desc) {
		if (!desc) {
			desc = '该网站存在风险，不建议访问';
		}
		var left = document.body.clientWidth / 2 - 200;
		var top = document.body.clientHeight / 2 - 160;

		var dangerDiv = ''
			+ "<div class='bd-cxzyj-hinder'></div>"
			+ "<div class='bd-cxzyj-danger'style='top:" + top + "px; left:" + left
			+ "px;background-image:url(" + redAlertUrl + ")'>"
				+ "<div class='danger-desc'>"+ desc +"</div>"
				+ "<span class='bd-cxzyj-btn' id='bd-cxzyj-close-btn'>关闭页面</span>"
				+ "<span class='bd-cxzyj-btn' id='bd-cxzyj-keep-btn'>继续访问</span>"
			+ "</div>";

		$("body").css({'overflow':'hidden'}).append(dangerDiv);

		// 关闭页面
		$("#bd-cxzyj-close-btn").click(
			function() {
				// 调用偏好设置接口，偏好值减1
				$.get(
					userHabitSetUrl,
					{type:'decr'}
				);
				W.location.href = 'http://www.baidu.com';
			}
		);

		// 继续访问
		$("#bd-cxzyj-keep-btn").click(
			function() {
				// 调用偏好设置接口，偏好值加1
				$.get(
					userHabitSetUrl,
					{type:'incr'}
				);
				$(".bd-cxzyj-hinder").remove();
				$(".bd-cxzyj-danger").remove();
				$("body").css({'overflow': 'auto'});
			}
		);
	}
	
	/**
	 * 需要暴露出去的方法，供bg.js调用
	 */
	W.functions = {
		showWarning:showWarning,
		showDanger:showDanger
	};

})(window, jQuery);