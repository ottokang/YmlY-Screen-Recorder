"use strict";

var isMacChrome = false;
var isMacFirefox = false;

// 偵測是否為 Mac 版 Chrome
if (isChrome === true) {
    if (navigator.userAgentData.platform.includes("mac")) {
        isMacChrome = true;
    }
}

// 偵測是否為 Mac 版 Firefox（navigator.platform 預計棄用，之後修正為 Chrome 版的方式）
if (isFirefox === true) {
    if (navigator.platform.includes("Mac")) {
        isMacFirefox = true;
    }
}

// 顯示 Mac 版說明介面
if (isMacChrome === true || isMacFirefox === true) {
    $(".only_mac").show();
} else {
    $(".only_mac").hide();
}

// 顯示 Chrome 說明介面
if (isChrome === true) {
    $(".only_chrome").show();
} else if (isFirefox === true) {
    // 顯示 Firefox 說明介面
    $("#audio_mode option[value='mic_system']")
        .attr("disabled", "disabled")
        .html(function () {
            $(this).html($(this).html() + "（僅限 Chrome）");
        });
    $("#audio_mode option[value='only_system']")
        .attr("disabled", "disabled")
        .html(function () {
            $(this).html($(this).html() + "（僅限 Chrome）");
        });
    $("#audio_mode option[value='only_mic']").attr("selected", "selected");

    // 隱藏 Chrome 說明介面
    $(".only_chrome").hide();
}

// 顯示不支援 Safari、行動裝置瀏覽器
if (isSafari === true) {
    showMessage("不支援 Safari 瀏覽器<br>請改用 Windows、MacOS 版 Chrome、Firefox 瀏覽器");
    $(".not_supported").hide();
} else if (navigator.userAgent.match(["Mobile"])) {
    showMessage("不支援行動裝置瀏覽器<br>請改用 Windows、MacOS 版 Chrome、Firefox 瀏覽器");
    $(".not_supported").hide();
}

// 偵測裝置記憶體（僅限 Chrome）
if (navigator.deviceMemory !== undefined) {
    if (navigator.deviceMemory <= 6) {
        $("#memory_below_8GB").show();
    }
}
