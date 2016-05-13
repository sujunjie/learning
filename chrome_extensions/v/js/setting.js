$(document).ready(function(){

	// background js
	var bg = chrome.extension.getBackgroundPage(),
		top = window.screen.height / 2 - 270;
		left = window.screen.width / 2 - 240;

	$(".main").css({left:left,top:top});

	// 初始化样式
	chrome.cookies.get(
		{
			url:bg.params.userHabit.cookieDomain,
			name:bg.params.userHabit.userSetting
		},
		function(cookie) {console.log(cookie);
			if ('object' != typeof cookie || null === cookie || !('value' in cookie)) {
				$("#auto").addClass("selected");
			} else {
				switch (cookie.value) {
					case "1":
						$("#light").addClass("selected");
						break;
					case "3":
						$("#dark").addClass("selected");
						break;
					case "4":
						$("#off").addClass("selected");
						break;
					case "2":
					default:
						$("#auto").addClass("selected");
						break;
				}
			}
		}
	);

	// 设置偏好
	$(".radio").click(function() {
		$(".radio").attr('class', 'radio');
		$(this).addClass("selected");
	});
	$("#submit").click(function() {
		var id = $(".selected").attr('id'),
			habit = null;
		switch (id) {
			case "light":
				habit = '1';
				break;
			case "dark":
				habit = '3';
				break;
			case "off":
				habit = '4';
				break;
			case "auto":
				habit = '2';
				break;
			default:break;
		}
		if (null !== habit) {
			bg.functions.setUserHabit(habit);
			alert("偏好设置成功，感谢使用!");
		}
	});
	$("#cancel").click(function() {
		window.location.reload();
	});

});