var messageTimeoutID;

// 處理播放時間為時:分:秒
String.prototype.toHHMMSS = function() {
    let secondsNumber = Number.parseInt(this, 10);
    let hours = Math.floor(secondsNumber / 3600);
    let minutes = Math.floor((secondsNumber - (hours * 3600)) / 60);
    let seconds = secondsNumber - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = `0${hours}`;
    }
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    return hours + ":" + minutes + ":" + seconds;
}

// 顯示訊息
function showMessage(text, countDown = null) {
    window.clearTimeout(messageTimeoutID);
    $("#message").html(text);

    if (countDown !== null) {
        messageTimeoutID = window.setTimeout(function() {
            $("#message").html("");
        }, countDown * 1000);
    }
}

// 倒數計時
async function recorderCountdown(seconds) {
    const delay = (s) => {
        return new Promise(function(resolve) {
            setTimeout(resolve, s);
        });
    };

    if (seconds === "no_countdown") {
        return;
    } else {
        let countdownSeconds = Number.parseInt(seconds);
        for (let i = 0; i < countdownSeconds; i++) {
            $("#countdown_time").html(countdownSeconds - i);
            await delay(1000);
        }
        $("#countdown_time").html("開始錄影");
        window.setTimeout(function() {
            $("#countdown_time").html("");
        }, 2000);

        // 播放聲音（參考：https://github.com/kapetan/browser-beep）
        var audioContext = new window.AudioContext();
        var currentTime = audioContext.currentTime;
        var osc = audioContext.createOscillator();
        var gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        gain.gain.setValueAtTime(gain.gain.value, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, currentTime + 1);

        osc.onended = function() {
            gain.disconnect(audioContext.destination);
            osc.disconnect(gain);
        }

        osc.type = 'sine';
        osc.frequency.value = 440;
        osc.start(currentTime);
        osc.stop(currentTime + 1);
    }
}