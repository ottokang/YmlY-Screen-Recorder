if (navigator.userAgent.indexOf("Chrome") != -1) {
    // 設定 Chrome 聲音模式界面
    $("#audio_mode option[value='mic_system']").attr("selected", "selected");

    // 設定 Chrome 聲音模式界面
    $("#video_format option[value='mp4']").attr("selected", "selected");

    // 設定 Chrome 說明界面
    $(".only_chrome").show();

} else if (navigator.userAgent.indexOf("Firefox") != -1) {
    // 設定 Firefox 聲音模式界面
    $("#audio_mode option[value='mic_system']").attr("disabled", "disabled").html(function() {
        $(this).html($(this).html() + "（僅限 Chrome）");
    });
    $("#audio_mode option[value='only_system']").attr("disabled", "disabled").html(function() {
        $(this).html($(this).html() + "（僅限 Chrome）");
    });
    $("#audio_mode option[value='only_mic']").attr("selected", "selected");

    // 設定 Firefox 錄影格式界面
    $("#video_format option[value='mp4']").attr("disabled", "disabled").html(function() {
        $(this).html($(this).html() + "（僅限 Chrome）");
    });
    $("#video_format option[value='webm']").attr("selected", "selected");

    // 設定 Firefox 說明界面
    $(".only_chrome").hide();
}