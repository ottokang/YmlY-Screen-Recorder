"use strict";

var isDevelopement = 1;
var disalbeRecordLog = true;

if (isDevelopement === 1) {
    // 顯示測試用訊息
    $("#recorder_time").html("錄影時間測試").show();
    $("#countdown_time").html("倒數時間").show();
    $("#message").html("訊息測試").show();
    $("#recorder_time").html("錄影時間測試").show();
    $("#file_size").html("檔案大小").show();

    // 綁定測試函數
    $("#countdown_test").on("click", function() {
        recorderCountdown(3);
    });

    // 顯示測試選項
    $(".dev").show();

    // 設定 RecordRTC 開啟紀錄
    disalbeRecordLog = false;
} else {
    $(".dev").hide();
}