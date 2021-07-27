"use strict";

var messageTimeoutID;
var startTime;

// 顯示訊息
function showMessage(text, countDown = null) {
    window.clearTimeout(messageTimeoutID);
    $("#message").html(text).show();

    if (countDown !== null) {
        messageTimeoutID = window.setTimeout(function() {
            $("#message").hide("slow");
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

        // 播放聲音
        await playBeep();
        await delay(800);
    }
}

// 播放提示音（參考：https://github.com/kapetan/browser-beep）
async function playBeep() {
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

// 開始計算錄影時間
function startRecordTime() {
    startTime = Date.now();
}

// 綁定測試錄音播放結束恢復測試按鈕
$("#mic_test_audio").on("ended ", function() {
    $("#mic_test").html("🎙️ 測試麥克風");
});

// 綁定麥克風測試
$("#mic_test").on("click", function() {
    navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
        })
        .then(async function(micTestStream) {
            let micTestStreamBlobs = [];
            let micTestRecorderBlobs = [];

            $("#mic_test").html('🛑 錄音中...<span id="mic_test_countdown"></span>');
            const micTestRecorder = new MediaRecorder(micTestStream);
            micTestRecorder.ondataavailable = (e) => micTestStreamBlobs.push(e.data);
            micTestRecorder.onstop = async () => {
                micTestRecorderBlobs = new Blob(micTestStreamBlobs, {
                    type: 'audio/webm'
                });

                $("#mic_test_audio").prop({
                    "src": URL.createObjectURL(micTestRecorderBlobs)
                });
            };

            micTestRecorder.start();
            let micTestLimit = 3;
            const delay = (s) => {
                return new Promise(function(resolve) {
                    setTimeout(resolve, s);
                });
            };

            for (let i = 0; i < micTestLimit; i++) {
                $("#mic_test_countdown").html(micTestLimit - i);
                await delay(1000);
            }

            micTestRecorder.stop();
            $("#mic_test").html("🔊 播放中...");


        })
        .catch(function(error) {
            showMessage("沒有取得麥克風權限，請重新整理網頁，允許瀏覽器分享麥克風權限，或是插入麥克風", 5);
        });
});

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