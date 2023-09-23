"use strict";

// 綁定顯示分享音訊說明按鈕動作
$("#share_audio_tutorial_show").on("click", function () {
    $("#share_audio_tutorial").fadeIn();
});

// 綁定關閉分享音訊說明按鈕動作
$("#share_audio_tutorial_close").on("click", function () {
    $("#share_audio_tutorial").fadeOut();
});
