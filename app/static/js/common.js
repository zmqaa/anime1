// 增强日期输入框的交互
document.addEventListener('DOMContentLoaded', function() {
    // 为所有日期输入框添加点击事件
    const dateInputs = document.querySelectorAll('.date-input-wrapper');
    dateInputs.forEach(wrapper => {
        wrapper.addEventListener('click', function(e) {
            const input = this.querySelector('input[type="date"]');
            if (input && e.target !== input) {
                input.showPicker();
                // 如果浏览器不支持 showPicker()，则触发点击事件
                if (!input.showPicker) {
                    input.click();
                }
            }
        });
    });
});