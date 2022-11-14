"use strict";

// 綁定重新播放分享音訊說明按鈕動作
$("#share_audio_tutorial_replay").on("click", function () {
    $("#share_audio_tutorial_video")[0].currentTime = 0;
    $("#share_audio_tutorial_video")[0].play();
});

// 綁定關閉分享音訊說明按鈕動作
$("#share_audio_tutorial_close").on("click", function () {
    $("#share_audio_tutorial_video")[0].currentTime = 0;
    $("#share_audio_tutorial_video")[0].pause();
    $("#share_audio_tutorial").fadeOut();
});

// 綁定顯示分享音訊說明按鈕動作
$("#share_audio_tutorial_link").on("click", function () {
    $("#share_audio_tutorial").fadeIn();
    $("#share_audio_tutorial_video")[0].currentTime = 0;
    $("#share_audio_tutorial_video")[0].play();
});

// 綁定播放時隱藏重新播放按鈕
$("#share_audio_tutorial_video").on("playing", function () {
    if (isDevelopement === false) {
        $("#share_audio_tutorial_replay").hide();
    }
});

// 綁定播放後顯示重新播放按鈕
$("#share_audio_tutorial_video").on("ended", function () {
    $("#share_audio_tutorial_replay").show();
});
