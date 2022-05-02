"use strict";

var isMacChrome = false;

// 偵測是否為 Mac 版 Chrome
if (isChrome === true) {
    if (navigator.userAgentData.platform.includes("mac")) {
        isMacChrome = true;
    }
}

if (isChrome === true) {
    // 設定 Chrome 說明界面
    $(".only_chrome").show();
} else if (isFirefox === true) {
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

// 排除 Safari
if (isSafari === true) {
    showMessage("不支援 Safari 瀏覽器<br>請改用 Windows 桌機版 Chrome、Firefox 瀏覽器");
    $(".not_supported").hide();
} else if (navigator.userAgent.match(["Mobile"])) {
    // 排除行動裝置
    showMessage("行動裝置無法使用螢幕錄影功能<br>請改用 Windows 桌機版 Chrome、Firefox 瀏覽器");
    $(".not_supported").hide();
}