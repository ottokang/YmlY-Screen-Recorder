"use strict";

let screenStream;
let micStream;
let stream;
let streamBlobs = [];
let recorder;


// 綁定動作
$("#start_recorder_button").on("click", async () => {
    getPermissions();
});

//
$("#stop_recorder_button").on("click", () => {
    recorder.stop();
});
// 取得錄影、錄音權限
async function getPermissions() {
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
        $("#message").html("請允許瀏覽器分享畫面");
    }

    try {
        if (isMicAudio === true) {
            micStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true
            });
        }
    } catch (e) {
        $("#message").html("請允許瀏覽器分享麥克風");
    }

    // 混合系統聲音和麥克風聲音
    const streamTracks = [
        ...screenStream.getVideoTracks(),
        ...mergeAudioStreams(screenStream, micStream)
    ];

    // 顯示預覽
    stream = new MediaStream(streamTracks);
    $("#preview").prop("srcObject", stream);

    // 設定錄影格式
    let recorderOptions = {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000
    };

    switch ($("#video_format").val()) {
        case "h264":
            recorderOptions.mimeType = 'video/webm;codecs=H264';
            break;
        case "vp9":
            recorderOptions.mimeType = "video/webm;codecs=vp9";
            break;
        case "vp8":
            recorderOptions.mimeType = "video/webm";
            break;
    }

    // 建立錄影物件
    recorder = new MediaRecorder(stream, recorderOptions);
    recorder.ondataavailable = (e) => streamBlobs.push(e.data);
    recorder.onstop = async () => {
        let blob = new Blob(streamBlobs, {
            type: 'video/webm'
        });
        $("#download").prop("href", window.URL.createObjectURL(blob));
        $("#download").prop("download", "a.webm");
    }
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

// 開始錄影