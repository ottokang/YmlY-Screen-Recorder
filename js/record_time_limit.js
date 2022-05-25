"use strict";

// 綁定時間限制是否啟用動作
$("#is_record_limit_time").on("change", function() {
    if (this.checked === true) {
        $("#record_limit_time").removeClass("disabled");
        $("#record_limit_mins").removeAttr("disabled");
    } else {
        $("#record_limit_time").addClass("disabled");
        $("#record_limit_mins").attr("disabled", "disabled");
    }
});

// 綁定時間限制分鐘改變時檢查數字是否正確
$("#record_limit_mins").on("change", function() {
    // 變更為整數
    let record_limit_mins = Number.parseInt($(this).val());

    // 檢查是否為 NaN
    if (Number.isNaN(record_limit_mins) === true) {
        record_limit_mins = 60;
    } else if (record_limit_mins < Number.parseInt($(this).attr("min"))) {
        // 檢查是否過小
        record_limit_mins = Number.parseInt($(this).attr("min"));
    } else if (record_limit_mins > Number.parseInt($(this).attr("max"))) {
        // 檢查是否過大
        record_limit_mins = Number.parseInt($(this).attr("max"));
    }

    $(this).val(record_limit_mins);
});

// 綁定點擊時間限制分鐘時選取整個輸入欄位
$("#record_limit_mins").on("click", function() {
    $(this).select();
});