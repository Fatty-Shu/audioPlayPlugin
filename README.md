# audioPlayPlugin
&emsp;&emsp;使用DOM Audio 对象实现背景音乐播放。支持链式操作。

## 特点
&emsp;&emsp;1. 使用HTML DOM Audio对象实现音频控制,不需要在HTML文档中添加auido标签。  
&emsp;&emsp;2. supportAutoPlay检测是否支持自动播放。

## 示例

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>audioPlugin Demo</title>
</head>
<body>
	<script type="text/javascript" src="src/audioPlayPlugin.js"></script>
	<script>
	/**
	*新建一个Audio对象并立即播放
	*src设置为“file/test1.mp3”
	*loop:true表示循环播放，volume:0.1设置音量为0.1（默认1）
	*监听play事件（当音频已开始或不再暂停时触发）
	*/
            var bgAudio=new audioController({
            		     src:"file/test1.mp3",
            		     attr:{
            		         loop:true,
            		         volume:0.1
            		     },
            		     events:{
                			 play:function(){
                			       console.log("开始播放了")
                			  }
            		     }
            		})
            		.play();
	</script>
</body>
</html>
```

## 构造函数

名称|说明  
--- |---
**audoController(/\*options\*/)**| 实例化一个Audio对象，参数缺省     
            

## audiController 参数详情
>实参必需是一个对象   

属性|数据类型|说明   
---|--|---  
src|string|*可选*，指定音频文件路径。  
attr|object|*可选*,指定音频标签属性。*[Audio所拥有的属性](http://www.runoob.com/tags/ref-av-dom.html)*  
events|object|*可选*，为Audio对象添加事件绑定。*[支持事件](http://www.runoob.com/tags/ref-av-dom.html)*   

## 方法
### play(/\*src\*/)
>{string} src    &emsp;*可选*,音频路径。如Audio对象实例化时未设置音频路径，则执行该方法必需传入音频路径。   

&emsp;&emsp;开始播放音频。参数缺省表示*播放/继续播放*音频，参数不缺少表示*播放新传入的音频*    

### pause()  
&emsp;&emsp;暂停音频播放。

### events(/\*optional\*/)  
> {string}    eventName 事件名称  
{function}    backFun  事件响应执行的函数  
{Object}      eventObject 事件绑定对象，事件名和函数键值对.  
可以传入eventName、backFun两个参数，绑定/修改单个事件。或传入eventObject，绑定/修改多个事件  

&emsp;&emsp;添加/修改事件监听。*[所支持事件](http://www.runoob.com/tags/ref-av-dom.html)*

```javaScript
//示例
var bgAudio=new audioController(),process;
bgAudio.events("play",function(){console.log("开始播放了。")});
bgAudio.events({
    "timeupdate":function(){
        process=bgAudio.getAttr("currentTime")/bgAudio.getAttr("duration");
        console.log("当前播放进度："+(process*100||0).toFixed(2)+"%")
    },
    "ended":function(){
        console.log("播放结束了！")
    }
});
bgAudio.play("file/test1.mp3");
```

### delectEvents(eventName)  
>{string} eventName 需要删除的事件名称或名称数组    

&emsp;&emsp;删除事件监听
```javaScript
//示例
bgAudio.delectEvents("play");
bgAudio.delectEvents(["timeupdate","ended"]);
```
### getAttr(eventName)  
> {string} agr [需要获取的属性名称]  
根据传入的参数:单个返回string/object,多个返回object，缺省返回audio标签所属性。  
*[Audio所拥有的属性](http://www.runoob.com/tags/ref-av-dom.html)* 

&emsp;&emsp;获得Audio对象的属性 
```javaScript
//示例
bgAudio.getAttr("currentTime");  // 返回音频频中的当前播放位置（以秒计）
bgAudio.getAttr("duration","ended"); //返回{duration:当前音频的长度（以秒计）,ended:音频播放是否已结束}
bgAudio.getAttr();//{音频所有属性}
```
### setAttr(/\*optional\*/)  
>  {string} attrName 属性名称  
   {string} value 属性值   
   {Object}  attrObject 音频属性修改，属性名称和属性值的键值对。  
    可以传入attrName、value两个参数，绑定/修改单个属性值。或传入attrObject，绑定/修改多个属性值。   
    *[Audio可设置的属性](http://www.runoob.com/tags/ref-av-dom.html)* 

&emsp;&emsp;设置音频属性 
```javaScript
//示例
bgAudio.setAttr("currentTime","70");  // 设置音频当前播放位置到70s处
bgAudio.setAttr({currentTime:270,volume:0.1}); //设置音频当前播放位置到270s处,音量为0.1
```

### supportAutoPlay(obj)
>{obejct}  obj   
 {string} obj.src       *必需*,音频路径，用于测试是否支持自动播放  
 {function} obj.support *必需*,支持自动播放时执行的回调函数
 {function} obj.nonsupport *必需*,不支持自动播放时执行的回调函数
 该方法为异步方法
 

&emsp;&emsp;验证是否支持自动播放（iphone不支持自动播放，必需用户操作页面后才能播放音频）。验证完成后不管当前设备是否自动播放，都不会播放测试音频。需在回调中控制播放。

```javaScript
//示例
var bgAudio=new audioController();
bgAudio.supportAutoPlay({
    src:"file/test1.mp3",
    support:playAudio,//支持自动播放，则立即播放音频
    nonsupport:function(){ //不支持自动播放，监听到用户点击之后播放音频
        document.addEventListener("click",playAudio)
    }
})
function playAudio(){
	bgAudio.play("file/test1.mp3");
	document.removeEventListener("click",playAudio);
}
```
