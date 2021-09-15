"use strict";

if (isChrome) {
    // 設定 Chrome 聲音模式界面
    $("#audio_mode option[value='mic_system']").attr("selected", "selected");

    // 設定 Chrome 說明界面
    $(".only_chrome").show();
} else if (isFirefox) {
    // 設定 Firefox 聲音模式界面
    $("#audio_mode option[value='mic_system']").attr("disabled", "disabled").html(function() {
        $(this).html($(this).html() + "（僅限 Chrome）");
    });
    $("#audio_mode option[value='only_system']").attr("disabled", "disabled").html(function() {
        $(this).html($(this).html() + "（僅限 Chrome）");
    });
    $("#audio_mode option[value='only_mic']").attr("selected", "selected");

    // 設定 Firefox 說明界面
    $(".only_chrome").hide();
}

// 檢查是否支援錄影功能（排除行動裝置）
if (navigator.userAgent.match(["Mobile"])) {
    showMessage("行動裝置無法使用螢幕錄影功能<br>請使用桌機版 Chrome、Firefox 瀏覽器");
    $(".not_supported").hide();
}