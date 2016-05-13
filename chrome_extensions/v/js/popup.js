$(document).ready(function(){
	var pageType,
		kbUrlPre = 'http://koubei.baidu.com/s/';
	var jsonStr = location.href.substring(location.href.indexOf('?') + 1);
	var json = JSON.parse(decodeURI(jsonStr));
	var vlevel = parseInt(json.data.vLevel);
	switch (vlevel) {
		case 1:
		case 2:
		case 3:
			pageType = 0;
			break;
		case -2:
			pageType = 2;
			break;
		default:
			pageType = 1;
			break;
	}
	pageInit(pageType, json.data);
	
	function pageInit(pageType, data) {
		switch (pageType) {
			// 低风险
			case 0:
				$("#head").attr("class","green");
				$("#company").html(decode(data.compName));
				$("#vIcon").addClass('v' + data.vLevel);
				var kbUrl = kbUrlPre + data.url;
				var kbStr = '';
				if (data.kbComtCount > 0) {
					kbStr = '<p>网民评价：<a target="_blank" href="' + kbUrl + '">' + data.kbRate+ '%好评</a>&nbsp;&nbsp;'
						+ '<a target="_blank" href="' + kbUrl + '">' + data.kbComtCount + '评论</a></p>';
				}
				$("#levelInfo").html('<p>' + data.desc + '</p><p>累计时间：' + data.authMonth + '个月</p>' + kbStr);
				$("#icp").html(decode(data.icpNum));
				$("#custType").html(decode(data.custType));
				$("#siteName").html(decode(data.siteName));

				if (!data.isRealnameAuth) {
					$("#isRealNameAuth").hide();
				}
				if (!data.isFieldAuth) {
					$("#isFieldAuth").hide();
				}
				if (!data.isSafeSite) {
					$("#isSafeSite").hide();
				}
				if (!data.tradeAuthInfo) {
					$("#tradeAuthInfo").hide();
				}

				$("#greenMain").removeClass("hide");
				break;

			// 中风险
			case 1:
				$("#head").attr("class","yellow");
				$(".head-title").text('未查验到该网站的信誉信息，请谨慎访问');
				$("#yellowMain").removeClass("hide");
				break;

			// 高风险
			case 2:
				$("#head").attr("class","red");
				$(".head-title").text('该网站存在风险，不建议访问');
				$("#redInfo p").html(data.descTitle);
				$("#redMain").removeClass("hide");
				break;
		}
		$("#jubao").attr('href', 'http://jubao.baidu.com/jubao/accu/?surl=' + data.url);
	}

	function decode(s) {
	    return unescape(s.replace(/\\(u[0-9a-fA-F]{4})/gm, '%$1'));
	}
});