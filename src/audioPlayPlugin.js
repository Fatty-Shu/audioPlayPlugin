(function() {


    /**
     * 一些Audio标签相关的变量
     */
    var supportAuto = false;
        audioSuportEvents = ["abort", "canplay", "canplaythrough", "durationchange", "emptied", "ended", "error", "loadeddata", "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "seeked", "seeking", "stalled", "suspend", "timeupdate", "volumechange", "waiting"], //audio标签支持的事件
        audioSuportAttr = ["audioTracks", "autoplay", "buffered", "controller", "controls", "crossOrigin", "currentSrc", "currentTime", "defaultMuted", "defaultPlaybackRate", "duration", "ended", "error", "loop", "mediaGroup", "muted", "networkState", "paused", "playbackRate", "played", "preload", "readyState", "seekable", "seeking", "src", "startDate", "textTracks", "videoTracks", "volume"],
        inListener = {}; //保存已监听事件，用于取消事件监听

    /**
     * 将一些原生的系统变量和方法使用变量保存起来
     */

    var win = window,
        doc = document,
        aSlice = function(arg) {
            return Array.prototype.slice.call(arg)
        },
        logError = console.error;


    /**
     * 音频控制器构造函数，初始化相关参数
     * @param  {object} options [初始化参数]
     * options={
          src:"",//音频路径
       }
     *
     */
    function audioController(options) {

        if (!(this instanceof audioController)) {
            return new audioController(options)
        }

        var options = options || {};
        this.audio = new Audio(options.src||"");
        if(options.attr){
           this.setAttr(options.attr);
        };
        if (options.events) {
            eventsObjectValid.call(this, options.events)
        }


    }

    /**
     * 开始播放音频
     * @param  {string} src 需要播放的音频路径，缺省者为初始化时的音频路径
     */
    audioController.prototype.play = function( /*optional*/ src) {

        var audio = this.audio;

        if (!(src || audio.src)) { //没有设置URL，错误提示

            logError("SyntaxError:audio src not set");


        }

        if (!src && audio.paused && this.audio.src) { //暂停状态且没有传入新的URL,继续播放

            audio.play();


        }

        if (src) { //传入URL
        	if(src!=audio.src){ //传入新的URL,表示播放新的音频
        		audio.src = src;
        		audio.load();
        	}
            audio.play()

        }
        return this;

    }

    /**
     * 暂停播放
     */
    audioController.prototype.pause = function() {
        this.audio.pause();
        return this;
    }

    /**
     * 验证是否支持自动播放
     * @return {[type]} [description]
     */
    audioController.prototype.supportAutoPlay=function(obj){
        var obj=obj||{};
        if(supportAuto) {
            obj.support&&obj.support();
            return supportAuto;
        };
        var autoPlayTestAudio=new audioController({
            src:obj.src,
            attr:{
                volume:0
            },
            events:{
                "timeupdate":suportTrue,
                "suspend":function(){
                    
                    if(autoPlayTestAudio.getAttr("currentTime")!==0&&autoPlayTestAudio.getAttr("duration")){
                        obj.nonsupport&&obj.nonsupport();
                        supportAuto=false;    
                    }
                    
                                   
                    
                }
            }
        });
        function suportTrue(){
            if(obj.support&&!supportAuto){
                obj.support();
                supportAuto=true;                
                autoPlayTestAudio.pause(); 
            }
        };
        autoPlayTestAudio.play();  
    }


    /**
     * 获得audio标签的属性 
     * @param  {[string]} agr [需要获取的属性名称]
     * @return {[object/string]}     [根据传入的参数:单个返回string/object,多个返回object，缺省返回audio标签所属性]
     */
    audioController.prototype.getAttr = function() {
        var attributes = aSlice(arguments),
            attrObj = {},
            i = 0,
            len;
        attributes.length === 0 && (attributes = audioSuportAttr);
        len = attributes.length;

        if (len === 1) {

            return getAudioAttribute.call(this, attributes[0]);

        } else {

            for (; i < len; i++) {
                attrObj[attributes[i]] = getAudioAttribute.call(this, attributes[i]);
            }

            return attrObj;
        }
    }

    /*
     * 设置音频属性
     * @param  {string} attrName 属性名称
     * @param  {string} value 属性值 
     * @param {Object}  attrObject 音频属性修改，属性名称和属性值的键值对.
     * 可以传入attrName、value两个参数，绑定/修改单个属性值。或传入attrObject，绑定/修改多个属性值。
     */
    audioController.prototype.setAttr = function() {
        var attributes = aSlice(arguments),
            attrObj = {},
            i = 0,
            len;
        len = attributes.length;

        if (len === 1) {
            for(var key in attributes[0]){
                attributes[0].hasOwnProperty(key)&&(this.audio[key]=attributes[0][key])
            }

        } else {

            this.audio[attributes[0]]=attributes[1];
          
        }

        return this;
    }

    /*
     * 添加/修改事件监听
     * @param  {string} eventName 事件名称
     * @param  {function} backFun  事件响应执行的函数
     * @param {Object}  eventObject 事件绑定对象，事件名和函数键值对.
     * 可以传入eventName、backFun两个参数，绑定/修改单个事件。或传入eventObject，绑定/修改多个事件
     */
    audioController.prototype.events = function( /*optional*/ eventName, backFun, /*optional*/ eventObject) {
        var arg = aSlice(arguments, 0),
            eventObj = {};
        if (arg.length === 1) {
            eventsObjectValid.call(this, arg[0]);
            return true;
        }
        if (arg.length === 2) {
            eventObj[arg[0]] = arg[1];
            eventsObjectValid.call(this, eventObj);
            return true;
        }
        logError("SyntaxError:arguments must be a Object or eventName & listener pairing")
    }

    /**
     * 删除事件监听
     * @param  {string} eventName 需要删除的事件名称或名称数组
     * @return {object}           [this]
     */
    audioController.prototype.delectEvents=function(eventName){
        var eventName=eventName||[];
        if(typeof(eventName)==="string"&&inListener[eventName])
            removeAudioEventListener.call(this, eventName);

        if(eventName instanceof Array){
            for(var i=0,len=eventName.length;i<len;i++)
              typeof(eventName)==="string"&&
              inListener[eventName]&&
              removeAudioEventListener.call(this, eventName);
        }
        return this;
    }




    /**
     * 给audio标签添加事件绑定
     * @param {string} eventName 要绑定的事件名称
     * @param {function} backFun 事件响应执行的函数
     */
    function addAudioEventListener(eventName, backFun) {
        var audio = this.audio;
        if (audioSuportEvents.indexOf(eventName) < 0) {
            logError("SyntaxError:audio don't support " + eventName + " event")
            return false;
        }
        if (typeof backFun !== "function") {
            logError("SyntaxError:Event listener must be a function")
            return false;
        }
        inListener[eventName] && (removeAudioEventListener.call(this, eventName))
        inListener[eventName] = backFun;
        if (doc.addEventListener) {
            audio.addEventListener(eventName, backFun);
            return true;
        }

        if (doc.attachEvent) {
            audio.attachEvent("on" + eventName, backFun);
            return true;
        }

        audio["on" + eventName] = backFun;


    }



    /**
     * 解除audio标签的事件绑定
     * @param  {string} eventName 事件名称
     * @param  {function} backFun   事件响应执行的函数
     */
    function removeAudioEventListener(eventName) {
        var audio = this.audio;
        if (doc.removeEventListener) {
            audio.removeEventListener(eventName, inListener[eventName]);
            return true;
        }

        if (doc.attachEvent) {
            audio.attachEvent("on" + eventName, inListener[eventName]);
            return true;
        }

        audio["on" + eventName] = null;

    }


    /**
     * 事件绑定参数验证，验证通过则遍历绑定事件
     * @param  {[type]} eventsObject [description]
     * @return {[type]}              [description]
     */
    function eventsObjectValid(eventsObject) {
        if (eventsObject instanceof Object) {
            for (var key in eventsObject) {
                eventsObject.hasOwnProperty(key)&&addAudioEventListener.call(this, key, eventsObject[key]);
            }
        } else {
            logError("TypeError: events is not a Object")
        }
    }

    /**
     * 获取audio指定属性
     * @param  {string}   arg 属性名称
     * @return {variable}     [直接返回属性值]
     */
    function getAudioAttribute(arg) {

        if (audioSuportAttr.indexOf(arg) >= 0) {
            return this.audio[arg];
        } else {
            logError("TypeError: audio element don't have " + arg + " attributes!")
        }

    }




    win.audioController = audioController;


})()
