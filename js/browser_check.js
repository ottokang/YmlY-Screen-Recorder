"use strict";

var isMacChrome = false;
var isMacFirefox = false;

// 偵測是否為 Mac 版 Chrome
if (isChrome === true) {
    if (navigator.userAgentData.platform.includes("mac")) {
        isMacChrome = true;
    }
}

// 偵測是否為 Mac 版 Firefox（navigator.platform 預計快棄用，之後修正為 Chrome 版的方式）
if (isFirefox === true) {
    if (navigator.platform.includes("Mac")) {
        isMacFirefox = true;
    }
}

// 顯示 Mac 版說明
if (isMacChrome === true || isMacFirefox === true) {
    $(".only_mac").show();
} else {
    $(".only_mac").hide();
}

if (isChrome === true) {
    // 顯示 Chrome 說明界面
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

    // 隱藏 Chrome 說明界面
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