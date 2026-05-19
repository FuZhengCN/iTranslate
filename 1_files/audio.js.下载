
function initAudioEvent(audio,audioPlayer,id,callback) {

    audio.addEventListener("loadedmetadata",function () {
        setTextDuration(this.duration)
    });
    /* add 2019/6/6 修复时长偶发不显示现象
     * 1 = HAVE_METADATA - 关于音频就绪的元数据
     * 2 = HAVE_CURRENT_DATA - 关于当前播放位置的数据是可用的，但没有足够的数据来播放下一帧/毫秒
     */
    if (audio.readyState >= 2) {
        setTextDuration(audio.duration)
    }
    function setTextDuration(duration){
        var duration=  transTime(duration);
        $('#'+id).find('.audio-length-total').text(duration);
    }
    // 点击播放/暂停图片时，控制音乐的播放与暂停
    audioPlayer.addEventListener('click', function () {
        callback();
        // 监听音频播放时间并更新进度条
        audio.addEventListener('timeupdate', function () {
            updateProgress(audio , id);
        }, false);

        // 监听播放完成事件
        audio.addEventListener('ended', function () {
            audioEnded(audio,id);
        }, false);

        // 改变播放/暂停图片
        if (audio.paused) {
            // 开始播放当前点击的音频
            audio.play();
        } else {
            audio.pause();
        }
    }, false);

    // 点击进度条跳到指定点播放
    // PS：此处不要用click，否则下面的拖动进度点事件有可能在此处触发，此时e.offsetX的值非常小，会导致进度条弹回开始处（简直不能忍！！）
    var progressBarBg = $('#'+id).find('.progressBarBg')[0];
    progressBarBg.addEventListener('mousedown', function (event) {
        // 只有音乐开始播放后才可以调节，已经播放过但暂停了的也可以
        if (!audio.paused || audio.currentTime != 0) {
            var pgsWidth = parseFloat(window.getComputedStyle(progressBarBg, null).width.replace('px', ''));
            var rate = event.offsetX / pgsWidth;
            audio.currentTime = audio.duration * rate;
            updateProgress(audio,id);
        }
    }, false);

    // 拖动进度点调节进度
    dragProgressDotEvent(audio,id);
}

/**
 * 鼠标拖动进度点时可以调节进度
 * @param {*} audio
 */
function dragProgressDotEvent(audio,id) {
    var dot=$('#'+id).find('.progressDot')[0];

    var position = {
        oriOffestLeft: 0, // 移动开始时进度条的点距离进度条的偏移值
        oriX: 0, // 移动开始时的x坐标
        maxLeft: 0, // 向左最大可拖动距离
        maxRight: 0 // 向右最大可拖动距离
    };
    var flag = false; // 标记是否拖动开始

    // 鼠标按下时
    dot.addEventListener('mousedown', down, false);
    dot.addEventListener('touchstart', down, false);

    // 开始拖动
    document.addEventListener('mousemove', move, false);
    document.addEventListener('touchmove', move, false);

    // 拖动结束
    document.addEventListener('mouseup', end, false);
    document.addEventListener('touchend', end, false);

    function down(event) {
        if (!audio.paused || audio.currentTime != 0) { // 只有音乐开始播放后才可以调节，已经播放过但暂停了的也可以
            flag = true;

            position.oriOffestLeft = dot.offsetLeft;
            position.oriX = event.touches ? event.touches[0].clientX : event.clientX; // 要同时适配mousedown和touchstart事件
            position.maxLeft = position.oriOffestLeft; // 向左最大可拖动距离
            position.maxRight =  $('#'+id).find('.progressBarBg')[0].offsetWidth - position.oriOffestLeft; // 向右最大可拖动距离

            // 禁止默认事件（避免鼠标拖拽进度点的时候选中文字）
            if (event && event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }

            // 禁止事件冒泡
            if (event && event.stopPropagation) {
                event.stopPropagation();
            } else {
                window.event.cancelBubble = true;
            }
        }
    }

    function move(event) {
        if (flag) {
            var clientX = event.touches ? event.touches[0].clientX : event.clientX; // 要同时适配mousemove和touchmove事件
            var length = clientX - position.oriX;
            if (length > position.maxRight) {
                length = position.maxRight;
            } else if (length < -position.maxLeft) {
                length = -position.maxLeft;
            }
            var progressBarBg = $('#'+id).find('.progressBarBg')[0];
            var pgsWidth = parseFloat(window.getComputedStyle(progressBarBg, null).width.replace('px', ''));
            var rate = (position.oriOffestLeft + length) / pgsWidth;
            audio.currentTime = audio.duration * rate;
            updateProgress(audio,id);
        }
    }

    function end() {
        flag = false;
    }
}

/**
 * 更新进度条与当前播放时间
 * @param {object} audio - audio对象
 */
function updateProgress(audio,id) {
    var value = audio.currentTime / audio.duration;
    var ele= $('#'+id);
    ele.find('.progressBar')[0].style.width = value * 100 + '%';
    ele.find('.progressDot')[0].style.left = value * 100 + '%';
    ele.find('.audioCurTime')[0].innerText = transTime(audio.currentTime);
}

/**
 * 播放完成时把进度调回开始的位置
 */
function audioEnded(audio,id) {
    var ele= $('#'+id);
    var imgEle=ele.find('.audio-play')[0];
    ele.find('.progressBar')[0].style.width = 0;
    ele.find('.progressDot')[0].style.left = 0;
    ele.find('.audioCurTime')[0].innerText = transTime(0);
    imgEle.src = imgEle.src.replace('icon2@x2','icon1@x2')
}

/**
 * 音频播放时间换算
 * @param {number} value - 音频当前播放时间，单位秒
 */
function transTime(value) {
    var time = "";
    var h = parseInt(value / 3600);
    value %= 3600;
    var m = parseInt(value / 60);
    var s = parseInt(value % 60);
    if (h > 0) {
        time = formatTime(h + ":" + m + ":" + s);
    } else {
        time = formatTime(m + ":" + s);
    }

    return time;
}

/**
 * 格式化时间显示，补零对齐
 * eg：2:4  -->  02:04
 * @param {string} value - 形如 h:m:s 的字符串
 */
function formatTime(value) {
    var time = "";
    var s = value.split(':');
    var i = 0;
    for (; i < s.length - 1; i++) {
        time += s[i].length == 1 ? ("0" + s[i]) : s[i];
        time += ":";
    }
    time += s[i].length == 1 ? ("0" + s[i]) : s[i];

    return time;
}