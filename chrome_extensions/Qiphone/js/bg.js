/**
 * @file：wolegedaX
 * @version：1.0.0
 * @author：苏俊杰 sujunjie@baidu.com
 * @date：2015/03/18
 */

(function(W, undefined){

	/**
	 * 变量初始化
	 */
	var
	pa = chrome.pageAction,
	tabs = chrome.tabs;
		
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
			//if (tabStatus.status == 'complete' && info.url &&  /^https?:\/\/hold\.baidu\.com/.test(info.url)) {
			if (tabStatus.status == 'complete' && info.url) {
				tabs.executeScript(
                    			tabId,
                    			{
                    				code: "functions.wolegedaX();"
                    			}
                    		);
			}
		}
	);
	
})(window);