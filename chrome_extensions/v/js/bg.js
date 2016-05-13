/**
 * @file：百度浏览器插件“诚信照妖镜”主程序 bg.js
 * @version：1.0.0
 * @author：苏俊杰 sujunjie@baidu.com
 * @date：2014/12/23
 */

(function(W, $, undefined){

	/**
	 * 变量初始化
	 */
	var
	pa = chrome.pageAction,
	tabs = chrome.tabs,

	/* ajax接口信息 */
	ajaxUrl = 'http://tag.baidu.com/bird/vplugin/getMiddPageInfoAjax',

	/* icons编号和路径 */
	icons = {
		1: '../icons/greenicon.png', // 低风险、绿标
		2: '../icons/redicon.png', // 高风险、红标
		3: '../icons/yellowicon.png' // 中风险、黄标
	},

	/* 用户使用偏好 */
	userHabit = {
		'ajaxKey': 'riskAppetite', // ajax 接口端表示用户使用偏好分析结果的字段
		'cookieDomain': 'http://baidu.com', // 设置cookie时使用的url
		'userSetting': 'BAIDU_CXZYJ_USERHB', // cookie中用来存储用户使用偏好的字段
		'values': { // 偏好值
			'default': 2, // 缺省：高危红弹；中危黄横；低危不显示；官网蓝横；
			'light': 1, // 增强：高危红弹；中危黄横；低危绿横；官网蓝横；
			'dark': 3, // 减弱：高危红横；
			'off': 4	 // 关闭：所有情况都不显示横框或弹框
		}
	},

	/* 大搜搜索query词wd以及用来匹配的正则表达式 */
	wd = null,
	searchQueryP = /baidu\.com.*(?:\?|&)wd=([^&#]*)/i,

	/* 横框提示内容 */
	warningStr = {
		'green': '该网站主体信息已备案且经过核验，请放心访问',
		'yellow': '未查验到该网站的信誉信息，请谨慎访问'
	},

	/* 忽略不进行处理的url列表。支持字符串精确匹配和正则表达式模糊匹配两种方式 */
	arrIgnoreUrl = [
		/^(?!https?:\/\/).*/i // 所有非http://*或https://*形式的url
	];

	/**
	 * 注册标签页变更时的监听函数
	 */
	tabs.onUpdated.addListener(
		/**
		 * @event
		 * @param int tabId         发生变更的标签页id
		 * @param tabStatus         发生变更的标签页状态，有两个可能的值：loading和complete
		 * @param info              变更信息
		 */
		function(tabId, tabStatus, info) {
			// tab更新经历loading和complete两个阶段，在loading阶段，且url发生变化、且url不在忽略列表时检查url安全信誉信息
			if (tabStatus.status == 'loading' && info.url && !inIgnoreUrl(info.url)) {
				check(tabId, info.url);
			}
		}
	);

	/**
	 * 判断url是否在忽略列表中
	 * @param string url 				url
	 * @return boolean					true：在忽略列表中，false：不在忽略列表中。
	 */
	function inIgnoreUrl(url) {
		for (var i = 0; i<arrIgnoreUrl.length; i++) {
			var strType = (typeof arrIgnoreUrl[i]).toLowerCase();
			if ( 'string' == strType && arrIgnoreUrl[i] == url) {
				return true;
			} else if ('object' == strType && arrIgnoreUrl[i].test(url)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 检查网站安全信誉信息。
	 * 发送请求到url有更新的tab页的content.js，获取该tab页的referrer，和url一起传递给数据检查接口
	 * @param int tabId 				地址发生变化的tab页id
	 * @param string url 				url地址
	 * @return void
	 */
	function check(tabId, url) {
		tabs.sendRequest(
			tabId,
			{ act: 'getReferrer' },
			function (response) {
				var referrer = null;
	    		if ('object' == typeof(response) && ('referrer' in response)) {
	    			referrer = response.referrer;
	    		}
	    		ajaxCheck(tabId, url, referrer);
	  		}
	  	);
	}

	/**
	 * 发送ajax请求，检查url安全信誉信息
	 * @param int tabId 				地址发生变化的tab页id
	 * @param string url 				url地址
	 * @param null|string referrer 		referrer
	 * @return void
	 */
	function ajaxCheck(tabId, url, referrer) {
		/* 获取百度搜索query词 */
		var matches = url.match(searchQueryP);
		if (matches && matches[1]) {
			wd = matches[1];
		}

		/* baidu三级域处理 */
		if (/https?:\/\/([^?&/:]*)\.baidu.com/.test(url)) {
			url = 'www.baidu.com';
		}

		/* ajax请求获取站点安全信誉信息 */
		$.ajax({
			url: ajaxUrl,
			dataType: 'json',
			data: {
				url: url,
				referrer: referrer,
				wd: wd
			},
			success:function(json){
				// 接口返回失败
				if (
					!('status' in json)
					|| json.status != 0
					|| !('data' in json)
					|| 'object' != typeof json.data
				) {
					return false;
				}

				// 根据level展示不同颜色插件icon
				var vlevel = parseInt(json.data.vLevel);
				selectIcon(tabId, vlevel);

				// popup页初始化
				setPopup(tabId, json);

				// 根据用户偏好设置或后台分析出的用户偏好展示横框提示或弹框警告
				showWarningOrDangerByUserHabit(tabId, json.data, vlevel, url);
			}
		});

	}

	/**
	 * 根据vlevel选择要展示的icon，并进行展示
	 * @param int tabId 			标签页id
	 * @param int vlevel			vlevel
	 * @return void
	 */
	function selectIcon(tabId, vlevel) {
		var iconId = 3;
		switch (vlevel) {
			// 有V信息，低风险，绿标
			case 1:
			case 2:
			case 3:
				iconId = 1;
				break;
			// 高风险，红标
			case -2:
				iconId = 2;
				break;
			// 中等风险，黄标
			default:
				iconId = 3;
				break;
		}
		showIcon(tabId, iconId);
	}

	/**
	 * 显示icon
	 * @param int tabId 			标签页id
	 * @param int iconId 			要显示的图标id
	 * @return void
	 */
	function showIcon(tabId, iconId) {
		pa.setIcon(
			{
				path: icons[iconId],
				tabId: tabId
			}
		);
		pa.show(tabId);
	}

	/**
	 * 初始化 popup 页
	 * @param int tabId				标签页id
	 * @param object json			ajax 接口返回的 json 对象
	 * @return void
	 */
	function setPopup(tabId, json) {
		var strJson = JSON.stringify(json);
		pa.setPopup({
			tabId: tabId,
			popup: '../html/popup.html?' + strJson
		});
	}

	/**
	 * 根据用户设置或用户偏好分析结果在页面显示横框或弹框提示网站安全信誉相关信息
	 * @param int tabId				标签页id
	 * @param object json			ajax接口返回数据
	 * @param int vlevel            vlevel
	 * @param string url            当前url
	 * @return void
	 */
	function showWarningOrDangerByUserHabit(tabId, data, vlevel, url) {
		// 获取用户设置的使用偏好
		chrome.cookies.get(
			{
				url: userHabit.cookieDomain,
				name: userHabit.userSetting
			},
			function(cookie) {
				var habit = userHabit.values.default;
				// 用户未设置偏好，从ajax接口获取后台分析出的用户偏好
				if ('object' != typeof cookie
					|| null === cookie
					|| !('value' in cookie)
					|| cookie.value == userHabit.values.default
				) {
					habit = data[userHabit.ajaxKey] ? data[userHabit.ajaxKey] : userHabit.values.default;
				// 用户设置了偏好，直接取设置的偏好
				} else if (cookie.value) {
					habit = cookie.value;
				}

				// 用户偏好有效性检查
				var isHabitValid = chechIsHabitValid(habit);
				if (false == isHabitValid) {
					habit = userHabit.values.default;
				}

				var labelDesc = data.labelDesc; // 官网

				if (habit == userHabit.values.light) {
					switch (vlevel) {
						case -2:
							showDanger(tabId, data.descTitle);
							break;
						case 1:
						case 2:
						case 3:
							showWarning(url, tabId, 'green');
							break;
						default:
							showWarning(url, tabId, 'yellow');
							break;
					}

					if (labelDesc) {
						showWarning(url, tabId, 'blue', labelDesc);
					}
				} else if (habit == userHabit.values.default) {
					switch (vlevel) {
						case -2:
							showDanger(tabId, data.descTitle);
							break;
						case 1:
						case 2:
						case 3:
							break;
						default:
							// showWarning(url, tabId, 'yellow');
							break;
					}

					if (labelDesc) {
						showWarning(url, tabId, 'blue', labelDesc);
					}
				} else if (habit == userHabit.values.dark) {
					switch (vlevel) {
						case -2:
							showWarning(url, tabId, 'red', data.descTitle);
							break;
						default:
							break;
					}
				}
			}
		);
	}

	/**
	 * 执行content js中functions.showWarning方法展示横框提示
	 * @param string url            当前url
	 * @param int tabId             tab 页id
	 * @param string color          横框颜色
	 */
	function showWarning(url, tabId, color, str) {
		if (!str) {
			str = warningStr[color];
		}
		if (!str) {
			return false;
		}
		tabs.executeScript(
			tabId,
			{
				code: "functions.showWarning('" + url + "','" + color + "','" + str + "');"
			}
		);
	}

	/**
	 * 执行content js中functions.showDanger方法展示红色弹框提升
	 * @param int tabId             tab 页id
	 * @param string desc           危险描述
	 * @param string descTitle      危险标题
	 * @param string descBott       危险弹框底部文字
	 */
	function showDanger(tabId, desc) {
		if (!desc) {
			return false;
		}
		tabs.executeScript(
			tabId,
			{
				code: "functions.showDanger('"+desc+"');"
			}
		);
	}

	/**
	 * 设置用户使用偏好
	 * @param int userHabit         用户使用偏好
	 * @return void
	 */
	function setUserHabit(habit) {
		habit = habit.toString();
		var expirationDate = (new Date().getTime() / 1000) + (365 * 24 * 60 * 60);
		chrome.cookies.set(
			{
				url: userHabit.cookieDomain,
				name: userHabit.userSetting,
				value: habit,
				expirationDate: expirationDate
			}
		);
	}

	/**
	 * 判断用户偏好有效性
	 * @param int habit             用户偏好
	 * @return boolean              true：有效；false：无效。
	 */
	function chechIsHabitValid(habit) {
		var isHabitValid = false;
		$.each(
			userHabit.values,
			function(habitKey, habitValue){
				if (habit == habitValue) {
					isHabitValid = true;
					return false;
				}
			}
		);
		return isHabitValid;
	}

	/**
	 * 需要暴露出去的变量，供设置页使用
	 */
	W.params = {
		userHabit : userHabit
	};

	/**
	 * 需要暴露出去的方法，供设置页面调用
	 */
	W.functions = {
		setUserHabit : setUserHabit
	};

})(window, jQuery);