"use strict";

$("body").on("click", function (e) {
    let targetObj = $(e.target);

    // 下載按鈕點其他地方會收起選單
    if (targetObj.is("#download_button") === false && $("#download_button").hasClass("pressed") === true) {
        $("#download_button").removeClass("pressed");
        $("#download_option").slideToggle(350);
    }
});
