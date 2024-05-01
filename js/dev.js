"use strict";

if (isDevelopement === true) {
    // 顯示測試用訊息
    $("#recorder_time").html("錄影時間測試").show();
    $("#countdown_time").html("倒數時間").show();
    $("#message").html("訊息測試").show();
    $("#file_size").html("檔案大小").show();
    //$("#has_system_audio").show();
    $("#no_system_audio").show();
    $("#mic_volume").show();
    //$("#no_mic").show();

    // 綁定倒數計時測試函數
    $("#countdown_test").on("click", function () {
        recorderCountdown(3);
    });

    // 顯示各瀏覽器專用項目
    $("[class*=only_]").show();

    // 顯示下載按鈕按下狀態
    $("#download_button").addClass("pressed");

    // 顯示測試選項
    $(".dev").show();
} else {
    $(".dev").hide();
}
