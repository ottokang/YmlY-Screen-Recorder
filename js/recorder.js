"use strict";

// 宣告錄影物件、錄影檔案大小
var recorder = null;
var blobSize = 0;

// 綁定開始錄影動作
$("#start_recorder_button").on("click", startRecord);

// 綁定停止錄影動作
$("#stop_recorder_button").on("click", onStopRecording);

// 綁定下載按鈕動作
$("#download_button").on("click", function() {
    $(this).toggleClass("pressed");
    $("#download_option").slideToggle(350);
});

// 綁定直接下載按鈕動作
$("#download_direct").on("click", function() {
    // 設定下載檔案日期時間資訊
    if ($("#download_filename").val() === "") {
        const date = new Date();
        let yearString = date.getFullYear();
        let monthString = String(date.getMonth() + 1).padStart(2, "0");
        let dateString = String(date.getDate()).padStart(2, "0");
        let hourString = String(date.getHours()).padStart(2, "0");
        let minuteSring = String(date.getMinutes()).padStart(2, "0");
        let fileDateString = `${yearString}-${monthString}-${dateString} ${hourString}-${minuteSring}`
        $("#download_direct").prop("download", `螢幕錄影 ${fileDateString}.webm`)
    } else {
        // 下載修改過檔名的檔案
        $("#download_direct").prop("download", `${$("#download_filename").val().trim()}.webm`)
    }
});

// 綁定重新命名下載動作
$("#download_rename").on("click", function() {
    $("#download_rename_dialog")[0].showModal();
});

// 綁定下載重新命名的檔名
$("#download_rename_button").on("click", function() {
    // 驗證檔名
    let fileName = $("#download_filename").val().trim();
    let error_massage = null;

    if (fileName === "") {
        // 是否空白
        error_massage = "檔名不可空白";
    } else if (fileName.length > 255) {
        // 是否超過 255 個字元
        error_massage = "檔名不可過長";
    } else if (/^[^\\/:\*\?"<>\|]+$/.test(fileName) === false) {
        // 請勿使用 \ / : * ? " < > |
        error_massage = `請勿使用 \ / : * ? " < > | 字元`;
    }

    // 處理錯誤訊息
    if (error_massage !== null) {
        $("#download_filename_error_message").html(error_massage);
        $("#download_filename")[0].focus();
        return;
    }

    $("#download_direct")[0].click();
    // 下載後結束對話框，清除內容
    $("#download_rename_cancel")[0].click();
});

// 綁定取消重新命名下載動作
$("#download_rename_cancel").on("click", function() {
    $("#download_filename").val("");
    $("#download_filename_error_message").html("");
    $("#download_rename_dialog")[0].close();
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

    // 設定螢幕錄影預覽畫面
    $("#preview_video").prop({
        "controls": "",
        "muted": "muted",
        "autoplay": "autoplay"
    })

    // 顯示螢幕錄影預覽畫面
    $("#preview_message").hide();
    let stream = new MediaStream(streamTracks);
    $("#preview_video").prop("srcObject", stream);

    // 隱藏開始錄影按鈕、下載按鈕、檔案大小
    $("#start_recorder_button, #download, #file_size").hide();

    // 開始錄影倒數
    await recorderCountdown($("#recorder_countdown").val());

    // 開始錄影時間計時
    startRecordTimeCounter();

    // 顯示停止錄影按鈕、顯示錄影時間、顯示錄影檔案大小
    $("#stop_recorder_button").show().css("display", "inline-block");
    window.setTimeout(function() {
        $("#file_size").show();
        $("#recorder_time").show();
    }, 1000);

    // 初始化錄影檔案大小
    blobSize = 0;

    // 設定錄影選項
    let recorderOptions = {
        mimeType: 'video/webm',
        recorderType: MediaStreamRecorder,
        disableLogs: false,
        timeSlice: 1000,
        ondataavailable: function(blob) {
            // 累加檔案大小
            blobSize += blob.size;
            $("#file_size").html("檔案大小：" + bytesToSize(blobSize));
        }
    };

    // 開發模式使用設定的錄影格式
    if (isDevelopement === true) {
        switch ($("#video_format").val()) {
            case "vp8":
                recorderOptions.mimeType = "video/webm;codecs=vp8";
                break;
            case "vp9":
                recorderOptions.mimeType = "video/webm;codecs=vp9";
                break;
            case "h264":
                recorderOptions.mimeType = 'video/webm;codecs=H264';
                break;
        }
    }

    // 初始化錄影物件
    recorder = new RecordRTCPromisesHandler(stream, recorderOptions);

    // 是否設定時間限制
    if ($("#is_record_limit_time").prop("checked") === true) {
        let durationMS = Number.parseInt($("#record_limit_mins").val()) * 60 * 1000;

        // 測試模式設定7秒結束錄影
        if (isDevelopement === true) {
            durationMS = 7000;
        }

        // 開始錄影、時間限制計時
        recorder.startRecording();
        await sleep(durationMS);

        // 到達時間限制，還在錄影則停止錄影
        if (recorder.recordRTC.getState() === "recording") {
            onStopRecording();
            showMessage("到達時間限制，停止錄影");
        }
    } else {
        // 開始錄影
        recorder.startRecording();
    }
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

// 停止錄影動作
async function onStopRecording() {
    await recorder.stopRecording();
    let blob = await recorder.getBlob();
    recorder.destroy();
    getSeekableBlob(blob, function(seekableRecorderBlobs) {
        $("#preview_video").prop({
            "srcObject": null,
            "src": URL.createObjectURL(seekableRecorderBlobs),
            "controls": "controls",
            "muted": "",
            "autoplay": ""
        });

        $("#download_direct").prop({
            "href": URL.createObjectURL(seekableRecorderBlobs)
        });

        $("#file_size").html("檔案大小：" + bytesToSize(seekableRecorderBlobs.size)).show();
    });

    $("#start_recorder_button").html("重新錄影").show();
    $("#stop_recorder_button, #recorder_time").hide();
    $("#download").show();
}