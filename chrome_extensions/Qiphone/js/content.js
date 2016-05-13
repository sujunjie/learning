/**
 * @file：wolegedaX
 * @version：1.0.0
 * @author：sujunjie@baidu.com
 * @date：2015/03/18
 */
  
(function(W, $, undefined){
    var i = null;	
    function wolegedaX() {
            //console.log($("a[class*='iphone6']").size());
            $(".hour-box").text('00');
            $(".minute-box").text('00');
             //console.log(" 那啥，这个插件会自动监测用户当前访问站点url，如果是 hold.baidu.com 域下页面，开跑辅助脚本！\n\n 辅助脚本功能如下：\n 1、获取倒计时中的‘时’和‘分’框，将其置为‘00’\n 2、用户等待现实时间到达抢购时间，掌握好时机，猛击按钮进入抢购页面，辅助脚本自动选中复选框、手机颜色，光标自动定位到验证码输入框，用户只需输入4位验证码，然后敲回车即可！\n\n\n ");
             //console.log("%c -----------------------------------------------------------------------------有没有那么一首隔-----------------------------------------------------------------------------", "color:red");
             //console.log("\n\n 人活着呢，最重要的是开心，这个插件就是玩的，万一不能用，不准以 谩骂、吐唾沫、殴打等方式攻击作者！！！！！！！\n 目前只支持抢iphone6，抢购其他机型手机，请联系我。最后的最后，让我们荡起双桨，一起开枪，祝君好运哦！！！！！！！\n\n\n\n\n                                                                                              --by  苏俊杰\n                                                                                              --@2015/3/18");
            i = setInterval(run, 1);           
     }
    
    function run() {
        
        // focus到验证框，输完回车直接提交
       $("#imgIpt").focus().bind('keydown', function(e){
           if (e.keyCode == '13'){
              $("a.submit-btn").trigger("click");
              clearInterval(i);            
           } 
       });
  
        // 颜色选择
       $("a[class*='iphone6']").trigger('click');
  
       /*
       // 土豪金  
       $("a.iphone6-gold_sprites").trigger('click');  
       // 东北银
       $("a.iphone6-silver_sprites").trigger('click');
       */
      
       // 勾选复选框
       $('#checkBox').attr("checked", true);
       
       //console.log("<- 你的帅气指数！");
    }
    
    W.functions = {
        wolegedaX: wolegedaX        
    }   
})(window, jQuery);