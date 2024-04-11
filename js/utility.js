"use strict";

var messageTimeoutID;

// 顯示訊息
function showMessage(text, countDown = null) {
    window.clearTimeout(messageTimeoutID);
    $("#message").html(text).show();

    if (countDown !== null) {
        messageTimeoutID = window.setTimeout(function () {
            $("#message").hide("slow");
        }, countDown * 1000);
    }
}

// 清除訊息
function clearMessage() {
    $("#message").html("").hide();
}

// 倒數計時
async function recorderCountdown(seconds) {
    if (seconds === "no_countdown") {
        return;
    } else {
        $("#countdown_time").show();
        let countdownSeconds = Number.parseInt(seconds);
        for (let i = 0; i < countdownSeconds; i++) {
            $("#countdown_time").html(countdownSeconds - i);
            playBeep(300);
            await sleep(1000);
        }
        $("#countdown_time").html("開始錄影");
        window.setTimeout(function () {
            $("#countdown_time").html("").hide();
        }, 2000);

        // 播放聲音
        await playBeep(800);
        await sleep(800);
    }
}

// 播放提示音（參考：https://github.com/kapetan/browser-beep）
async function playBeep(frequency = 440) {
    var audioContext = new window.AudioContext();
    var currentTime = audioContext.currentTime;
    var osc = audioContext.createOscillator();
    var gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    gain.gain.setValueAtTime(gain.gain.value, currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, currentTime + 1);

    osc.onended = function () {
        gain.disconnect(audioContext.destination);
        osc.disconnect(gain);
    };

    osc.type = "sine";
    osc.frequency.value = frequency;
    osc.start(currentTime);
    osc.stop(currentTime + 1);
}

// 等待一段時間，單位 ms
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 綁定測試錄音播放結束恢復測試按鈕
$("#mic_test_audio").on("ended ", function () {
    $("#mic_test").html("🎙️ 測試麥克風");
});

// 綁定麥克風測試
$("#mic_test").on("click", function () {
    navigator.mediaDevices
        .getUserMedia({
            video: false,
            audio: true,
        })
        .then(async function (micTestStream) {
            let micTestStreamBlobs = [];
            let micTestRecorderBlobs = [];

            $("#mic_test").html('🛑 錄音中...<span id="mic_test_countdown"></span>');
            const micTestRecorder = new MediaRecorder(micTestStream);

            // 設定有錄音資料處理函數、停止錄音處理函數
            micTestRecorder.ondataavailable = (e) => micTestStreamBlobs.push(e.data);
            micTestRecorder.onstop = async () => {
                micTestRecorderBlobs = new Blob(micTestStreamBlobs, {
                    type: "audio/webm",
                });

                $("#mic_test_audio").prop({
                    src: URL.createObjectURL(micTestRecorderBlobs),
                });
            };

            // 開始錄音
            micTestRecorder.start();
            let micTestLimit = 3;

            // 開始顯示麥克風音量指標
            $("#mic_test_meter").show();
            startMicVolumeMeter(micTestStream, "mic_test_meter");

            // 更新倒數秒數
            for (let i = 0; i < micTestLimit; i++) {
                $("#mic_test_countdown").html(micTestLimit - i);
                await sleep(1000);
            }

            micTestRecorder.stop();
            $("#mic_test").html("🔊 播放中...");
            if (isDevelopement === false) {
                $("#mic_test_meter").hide();
            }
        })
        .catch(function (e) {
            showMessage("沒有取得麥克風權限，請重新整理網頁，允許瀏覽器分享麥克風權限，或是插入麥克風", 5);
            console.log(e.message);
        });
});

// 開始麥克風音量偵測顯示
function startMicVolumeMeter(micStream, volumeMeterId) {
    const audioContext = new AudioContext();
    const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(micStream);
    const analyserNode = audioContext.createAnalyser();
    mediaStreamAudioSourceNode.connect(analyserNode);

    const pcmData = new Float32Array(analyserNode.fftSize);
    const onFrame = () => {
        analyserNode.getFloatTimeDomainData(pcmData);
        let sumSquares = 0.0;
        for (const amplitude of pcmData) {
            sumSquares += amplitude * amplitude;
        }
        $(`#${volumeMeterId}`).val(Math.sqrt(sumSquares / pcmData.length));
        window.requestAnimationFrame(onFrame);
    };
    window.requestAnimationFrame(onFrame);
}

// 綁定播放預覽時清除訊息
$("#preview_video").on("play", function () {
    if ($("#preview_video").attr("controls") === "controls") {
        clearMessage();
    }
});

// 處理播放時間為時：分：秒
String.prototype.toHHMMSS = function () {
    let secondsNumber = Number.parseInt(this, 10);
    let hours = Math.floor(secondsNumber / 3600);
    let minutes = Math.floor((secondsNumber - hours * 3600) / 60);
    let seconds = secondsNumber - hours * 3600 - minutes * 60;

    return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
};
