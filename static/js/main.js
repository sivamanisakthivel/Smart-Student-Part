/* ==========================================================================
   Smart Student Part-Time Job Management System - Custom JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
    console.log('Smart Student Part-Time Job Management System initialized.');

    // Auto-dismiss alert notifications after 4 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(function (alert) {
        setTimeout(function () {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 4000);
    });

    // Real-time dynamic search filter for tables (e.g. Manage Jobs, Manage Students)
    const tableSearchInput = document.getElementById('tableSearch');
    if (tableSearchInput) {
        tableSearchInput.addEventListener('keyup', function () {
            const filterValue = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('.searchable-table tbody tr');

            tableRows.forEach(function (row) {
                const textContent = row.textContent.toLowerCase();
                if (textContent.includes(filterValue)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Real-time Job Grid Live Filter
    const jobSearchInput = document.getElementById('jobSearchInput');
    const categorySelect = document.getElementById('categorySelect');
    const jobTypeSelect = document.getElementById('jobTypeSelect');

    function filterJobCards() {
        const searchText = jobSearchInput ? jobSearchInput.value.toLowerCase() : '';
        const selectedCat = categorySelect ? categorySelect.value.toLowerCase() : '';
        const selectedType = jobTypeSelect ? jobTypeSelect.value.toLowerCase() : '';

        const jobCards = document.querySelectorAll('.job-card-item');

        jobCards.forEach(function (card) {
            const title = card.getAttribute('data-title') || '';
            const company = card.getAttribute('data-company') || '';
            const category = card.getAttribute('data-category') || '';
            const type = card.getAttribute('data-type') || '';

            const matchesSearch = title.includes(searchText) || company.includes(searchText);
            const matchesCategory = selectedCat === '' || category === selectedCat;
            const matchesType = selectedType === '' || type === selectedType;

            if (matchesSearch && matchesCategory && matchesType) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (jobSearchInput) jobSearchInput.addEventListener('keyup', filterJobCards);
    if (categorySelect) categorySelect.addEventListener('change', filterJobCards);
    if (jobTypeSelect) jobTypeSelect.addEventListener('change', filterJobCards);

    // Bootstrap Form Validation feedback initializer
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // ==========================================
    // OTP INPUT BOX AUTO-FOCUS & TIMER LOGIC
    // ==========================================
    const otpBoxes = document.querySelectorAll('.otp-box');
    const otpForms = document.querySelectorAll('#otpForm, #resetPasswordForm');

    if (otpBoxes.length === 6) {
        otpBoxes.forEach(function (box, index) {
            // Move to next input box automatically on keyup
            box.addEventListener('keyup', function (e) {
                const value = this.value;
                if (e.key >= '0' && e.key <= '9') {
                    if (value.length === 1 && index < 5) {
                        otpBoxes[index + 1].focus();
                    }
                } else if (e.key === 'Backspace') {
                    if (index > 0) {
                        otpBoxes[index - 1].focus();
                    }
                }
            });

            // Support Paste event for full 6-digit code
            box.addEventListener('paste', function (e) {
                e.preventDefault();
                const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
                if (/^\d{6}$/.test(pasteData)) {
                    pasteData.split('').forEach(function (char, i) {
                        if (otpBoxes[i]) {
                            otpBoxes[i].value = char;
                        }
                    });
                    otpBoxes[5].focus();
                }
            });
        });

        // Combine digit fields before form submission
        otpForms.forEach(function (form) {
            form.addEventListener('submit', function () {
                let code = '';
                otpBoxes.forEach(function (box) {
                    code += box.value;
                });
                const hiddenInput = form.querySelector('#combinedOtp');
                if (hiddenInput) {
                    hiddenInput.value = code;
                }
            });
        });

        // OTP Countdown Timer (5 Minutes)
        const timerDisplay = document.getElementById('otpTimer');
        if (timerDisplay) {
            let duration = 300; // 5 minutes in seconds
            const countdownInterval = setInterval(function () {
                const minutes = Math.floor(duration / 60);
                const seconds = duration % 60;
                const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
                const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

                timerDisplay.textContent = formattedMinutes + ':' + formattedSeconds;

                if (--duration < 0) {
                    clearInterval(countdownInterval);
                    timerDisplay.textContent = 'EXPIRED';
                    timerDisplay.classList.remove('text-danger');
                    timerDisplay.classList.add('text-muted');
                }
            }, 1000);
        }
    }
});

