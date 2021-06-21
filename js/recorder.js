"use strict";

var screenStream;
var micStream;
var stream;
var streamBlobs;
var recorder;
var recorderBlobs;

$("#stop_recorder_button").hide();
$("#download_button").hide();
$("#recorder_time").hide();

// 綁定開始錄影動作
$("#start_recorder_button").on("click", async () => {
    startRecord();
});

// 綁定停止錄影動作
$("#stop_recorder_button").on("click", () => {
    recorder.stop();
    $("#start_recorder_button").html("重新錄影").show();
    $("#stop_recorder_button").hide();
    $("#download_button").show();
    $("#recorder_time").hide();
});

// 綁定預覽畫面時間改變動作
$("#preview_video").on("timeupdate", function() {
    // 設定顯示錄影時間
    $("#recorder_time").html("錄影時間：" + Number.parseInt($("#preview_video").prop("currentTime")).toString().toHHMMSS());
});


// 開始錄影
async function startRecord() {
    recorderBlobs = [];
    streamBlobs = [];

    // 判斷聲音模式
    let isSystemAudio, isMicAudio
    switch ($("#audio_mode").val()) {
        case "mic_system":
            isSystemAudio = true;
            isMicAudio = true;
            break;
        case "only_mic":
            isSystemAudio = false;
            isMicAudio = true;
            break;
        case "only_system":
            isSystemAudio = true;
            isMicAudio = false;
            break;
        case "no_sound":
            isSystemAudio = false;
            isMicAudio = false;
            break;
    }

    // 建立螢幕錄影、錄音物件
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: isSystemAudio
        });
    } catch (e) {
        showMessage("請重新整理網頁，允許瀏覽器分享畫面");
        return;
    }

    try {
        if (isMicAudio === true) {
            micStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true
            });
        } else {
            micStream = null;
        }
    } catch (e) {
        showMessage("請重新整理網頁，請允許瀏覽器分享麥克風權限");
        return;
    }

    // 混合系統聲音和麥克風聲音
    const streamTracks = [
        ...screenStream.getVideoTracks(),
        ...mergeAudioStreams(screenStream, micStream)
    ];

    // 設定預覽畫面
    $("#preview_video").prop({
        "controls": "",
        "muted": "muted",
        "autoplay": "autoplay"
    })

    // 顯示預覽
    stream = new MediaStream(streamTracks);
    $("#preview_video").prop("srcObject", stream);

    // 開始倒數計時
    await recorderCountdown($("#recorder_countdown").val());

    // 設定按鈕
    $("#start_recorder_button").hide();
    $("#stop_recorder_button").show();
    $("#download_button").hide();
    $("#recorder_time").show();

    // 設定錄影格式
    let recorderOptions = {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000
    };

    switch ($("#video_format").val()) {
        case "h264":
            recorderOptions.mimeType = 'video/webm;codecs=H264';
            break;
        case "vp8":
            recorderOptions.mimeType = "video/webm";
            break;
    }

    // 建立錄影物件
    recorder = new MediaRecorder(stream, recorderOptions);
    recorder.ondataavailable = (e) => streamBlobs.push(e.data);
    recorder.onstop = async () => {
        recorderBlobs = new Blob(streamBlobs, {
            type: 'video/webm'
        });

        $("#preview_video").prop({
            "srcObject": null,
            "src": URL.createObjectURL(recorderBlobs),
            "controls": "controls",
            "muted": "",
            "autoplay": ""
        })

        $("#download").prop({
            "href": URL.createObjectURL(recorderBlobs),
            "download": "a.webm"
        });
    }

    // 開始錄影
    recorder.start();
}

// 混合系統聲音和麥克風聲音
function mergeAudioStreams(screenStream, micStream) {
    const context = new AudioContext();
    const mergeDestination = context.createMediaStreamDestination();

    if (screenStream && screenStream.getAudioTracks().length > 0) {
        const source1 = context.createMediaStreamSource(screenStream);
        const systemAudioGain = context.createGain();
        systemAudioGain.gain.value = 0.75;
        source1.connect(systemAudioGain).connect(mergeDestination);
    }

    if (micStream && micStream.getAudioTracks().length > 0) {
        const source1 = context.createMediaStreamSource(micStream);
        const micAudioGain = context.createGain();
        micAudioGain.gain.value = 0.75;
        source1.connect(micAudioGain).connect(mergeDestination);
    }

    return mergeDestination.stream.getAudioTracks();
}