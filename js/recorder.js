"use strict";

var recorder;

// 隱藏停止錄影、下載、錄影時間、訊息
$("#stop_recorder_button, #download, #recorder_time, #file_size, #message").hide();

// 綁定開始錄影動作
$("#start_recorder_button").on("click", async () => {
    startRecord();
});

// 綁定停止錄影動作
$("#stop_recorder_button").on("click", async () => {
    await recorder.stopRecording(function() {
        getSeekableBlob(recorder.getBlob(), function(seekableRecorderBlobs) {
            $("#preview_video").prop({
                "srcObject": null,
                "src": URL.createObjectURL(seekableRecorderBlobs),
                "controls": "controls",
                "muted": "",
                "autoplay": ""
            });

            $("#download_link").prop({
                "href": URL.createObjectURL(seekableRecorderBlobs),
                "download": "螢幕錄影.webm"
            });
        });

        $("#file_size").html("檔案大小：" + bytesToSize(recorder.getBlob().size)).show();
    });

    $("#start_recorder_button").html("重新錄影").show();
    $("#stop_recorder_button, #recorder_time").hide();
    $("#download").show();
});

// 綁定下載按鈕動作
$("#download_button").on("click", function() {
    if ($("#download_file_name").val().trim() === "") {
        $("#download_link").prop("download", "螢幕錄影.webm");
    } else {
        $("#download_link").prop("download", $("#download_file_name").val().trim() + ".webm");
    }
});

// 綁定預覽畫面錄影時間改變動作
$("#preview_video").on("timeupdate", function() {
    let recorderTime = Math.floor((Date.now() - startTime) / 1000);
    $("#recorder_time").html("錄影時間：" + recorderTime.toString().toHHMMSS());
});

// 開始錄影
async function startRecord() {
    // 建立螢幕串流物件、麥克風物件、是否有麥克風音訊、是否有系統音訊
    let screenStream = null,
        micStream = null,
        hasMicAudio = false,
        hasSystemAudio = false;

    // 清除訊息
    clearMessage();

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

    // 同步聲音模式判斷
    hasMicAudio = isMicAudio;
    hasSystemAudio = isSystemAudio;

    // 建立螢幕錄影、錄音物件
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: isSystemAudio
        });
    } catch (e) {
        if (e.message.includes("audio source")) {
            showMessage("沒有音訊裝置，請選擇聲音模式為無聲音後重新錄影");
        } else {
            showMessage("請重新整理網頁，允許瀏覽器分享畫面");
        }
        console.log(e.message);
        return;
    }

    // 判斷是否為視窗模式、是否有勾選錄製系統聲音
    if (isSystemAudio === true) {
        if (screenStream.getVideoTracks()[0].label.includes("window:")) {
            showMessage("你有勾選錄製系統聲音，但是選擇了視窗模式，此模式下無法錄製系統聲音<br><br>請重新選擇分享整個畫面或者分頁，才能錄製聲音", 10);
            hasSystemAudio = false;
        } else if (isMacChrome) {
            showMessage("你有勾選錄製系統聲音，但是 MacOS 版 Chrome 分享整個螢幕畫面無法分享系統聲音<br><br>如果要錄製系統聲音，請重新選擇分享分頁，才能錄製聲音", 10);
            hasSystemAudio = false;
        } else if (screenStream.getAudioTracks().length === 0 && isSystemAudio === true) {
            showMessage("沒有勾選分享系統音訊，請重新點選錄影後勾選");
            return;
        }
    }

    try {
        if (isMicAudio === true) {
            micStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true
            });
        }
    } catch (e) {
        showMessage("沒有取得麥克風權限，請重新整理網頁，允許瀏覽器使用麥克風<br><br>或是插入麥克風後重啟瀏覽器");
        console.log(e.message);
        return;
    }

    // 混合系統聲音和麥克風聲音
    let streamTracks;

    if (hasMicAudio === true || hasSystemAudio === true) {
        streamTracks = [
            ...screenStream.getVideoTracks(),
            ...mergeAudioStreams(screenStream, micStream)
        ];
    } else {
        streamTracks = screenStream.getVideoTracks();
    }

    // 設定預覽畫面
    $("#preview_video").prop({
        "controls": "",
        "muted": "muted",
        "autoplay": "autoplay"
    })

    // 顯示預覽
    $("#preview_message").hide();
    let stream = new MediaStream(streamTracks);
    $("#preview_video").prop("srcObject", stream);

    // 先隱藏開始錄影、下載按鈕、檔案大小
    $("#start_recorder_button").hide();
    $("#download, #file_size").hide();

    // 開始倒數計時
    await recorderCountdown($("#recorder_countdown").val());

    // 開始錄影計時
    startRecordTime();

    // 顯示停止錄影按鈕、顯示錄影時間
    $("#stop_recorder_button").show();
    window.setTimeout(function() {
        $("#recorder_time").show();
    }, 1000);

    // 設定錄影格式
    let recorderOptions = {
        mimeType: 'video/webm',
        recorderType: MediaStreamRecorder,
        disableLogs: false,
    };

    switch ($("#video_format").val()) {
        case "vp8":
            recorderOptions.mimeType = "video/webm";
            break;
        case "h264":
            recorderOptions.mimeType = 'video/webm;codecs=H264';
            break;
    }

    // 開始錄影
    recorder = RecordRTC(stream, recorderOptions);
    recorder.startRecording();
}

// 混合系統聲音和麥克風聲音
function mergeAudioStreams(screenStream, micStream) {
    const context = new AudioContext();
    const mergeDestination = context.createMediaStreamDestination();

    if (screenStream.getAudioTracks().length > 0) {
        const source1 = context.createMediaStreamSource(screenStream);
        const systemAudioGain = context.createGain();
        systemAudioGain.gain.value = 0.75;
        source1.connect(systemAudioGain).connect(mergeDestination);
    }

    if (micStream !== null && micStream.getAudioTracks().length > 0) {
        const source2 = context.createMediaStreamSource(micStream);
        const micAudioGain = context.createGain();
        micAudioGain.gain.value = 1.5;
        source2.connect(micAudioGain).connect(mergeDestination);
    }

    return mergeDestination.stream.getAudioTracks();
}