document.addEventListener('DOMContentLoaded', function() {
    const languageRadios = document.querySelectorAll('input[name="language"]');
    const formContainer = document.getElementById('form-container');
    const languageSelection = document.getElementById('language-selection');
    const next1 = document.getElementById('next-1');
    const next2 = document.getElementById('next-2');
    const next3 = document.getElementById('next-3');
    const reviewDataButton = document.getElementById('review-data'); // Кнопка для проверки данных
    const back1 = document.getElementById('back-1');
    const back2 = document.getElementById('back-2');
    const back3 = document.getElementById('back-3');
    const step1 = document.getElementById('form-step-1');
    const step2 = document.getElementById('form-step-2');
    const step3 = document.getElementById('form-step-3');
    const step4 = document.getElementById('form-step-4');

    const submitButton = document.getElementById('save');
    const loadingSpinner = document.getElementById('loading-spinner');
    let isSubmitting = false;

    languageRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateLanguage(this.value);
            formContainer.style.display = 'block'; // Показать форму
            languageSelection.style.display = 'none'; // Скрыть выбор языка
            switchStep(step1, null); // Показать первый шаг
        });
    });

    next1.addEventListener('click', function() {
        switchStep(step2, step1, true);  // Проверка при переходе вперед
    });
    next2.addEventListener('click', function() {
        switchStep(step3, step2, true);  // Проверка при переходе вперед
    });
    next3.addEventListener('click', function() {
        switchStep(step4, step3, true);  // Проверка при переходе вперед
    });

    reviewDataButton.addEventListener('click', function() {
        // Показать сообщение для проверки данных
        Swal.fire({
            title: "Проверьте ваши данные",
            text: "Пожалуйста, проверьте все введенные данные и подтвердите.",
            icon: "info",
            confirmButtonText: "OK"
        }).then(() => {
            // Возвращаемся на первый шаг
            switchStep(step1, step4, false);
        });
    });

    back1.addEventListener('click', function() {
        switchStep(step1, step2, false);  // Без проверки при возврате
    });
    back2.addEventListener('click', function() {
        switchStep(step2, step3, false);  // Без проверки при возврате
    });
    back3.addEventListener('click', function() {
        switchStep(step3, step4, false);  // Без проверки при возврате
    });

    function switchStep(showStep, hideStep, requireValidation = true) {
        if (hideStep && requireValidation) {
            const firstInvalidInput = validateStep(hideStep);
            if (firstInvalidInput) {
                scrollToInvalidInput(firstInvalidInput);
                firstInvalidInput.focus();
                return;
            }
            hideStep.style.opacity = '0';
            setTimeout(() => {
                hideStep.style.display = 'none';
            }, 500);
        } else if (hideStep) {
            hideStep.style.opacity = '0';
            setTimeout(() => {
                hideStep.style.display = 'none';
            }, 500);
        }

        setTimeout(() => {
            showStep.style.display = 'block';
            setTimeout(() => {
                showStep.style.opacity = '1';
            }, 10);
            updateProgressIndicator(showStep.id);
        }, 510);
    }

    function validateStep(step) {
        let firstInvalidInput = null;
        const elements = step.querySelectorAll('input, select, textarea');

        elements.forEach(elem => {
            if (isVisible(elem)) {
                elem.removeEventListener('input', handleInput);

                if ((elem.type === 'radio' || elem.type === 'checkbox') && !isGroupValid(elem.name)) {
                    if (!firstInvalidInput) firstInvalidInput = elem;
                    elem.classList.add('error');
                    elem.addEventListener('change', handleInput);
                } else if (!elem.value.trim()) {
                    if (!firstInvalidInput) firstInvalidInput = elem;
                    elem.classList.add('error');
                    elem.addEventListener('input', handleInput);
                } else {
                    elem.classList.remove('error');
                }
            }
        });

        return firstInvalidInput;
    }

    function isVisible(elem) {
        return !!elem && (elem.offsetWidth > 0 || elem.offsetHeight > 0);
    }

    function handleInput(event) {
        event.target.classList.remove('error');
    }

    function isGroupValid(name) {
        const group = document.querySelectorAll(`input[name="${name}"]`);
        return Array.from(group).some(input => input.checked);
    }

    function isMobileDevice() {
        return /Mobi|Android/i.test(navigator.userAgent);
    }

    function scrollToInvalidInput(input) {
        if (isMobileDevice()) {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function updateLanguage(lang) {
        document.querySelectorAll('[data-en], [data-ru], [data-bg], [data-ro]').forEach(el => {
            switch (lang) {
                case 'english':
                    el.textContent = el.dataset.en;
                    break;
                case 'russian':
                    el.textContent = el.dataset.ru;
                    break;
                case 'bulgarian':
                    el.textContent = el.dataset.bg;
                    break;
                case 'romanian':
                    el.textContent = el.dataset.ro;
                    break;
                default:
                    el.textContent = el.dataset.en;
            }
        });

        // Обновить текст сообщения в соответствии с выбранным языком
        Swal.update({
            confirmButtonText: lang === 'russian' ? 'ОК' :
                               lang === 'bulgarian' ? 'Добре' :
                               lang === 'romanian' ? 'OK' :
                               'OK'
        });
    }

    let form = document.querySelector("#form");
    let url = "https://script.google.com/macros/s/AKfycbwB5vGl8QSeH9gUuu4dBT4xjqmW0nJyd1Y_f1gKdlxD0zisqyEGFTJ8XaWuWaHIbBlzKw/exec";

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        isSubmitting = true;

        let formData = new FormData(form);
        const selectedLanguage = document.querySelector('input[name="language"]:checked').value;
        formData.append('LANGUAGE', selectedLanguage);

        // Преобразование всех дат в формат DD-MM-YYYY
        form.querySelectorAll('input[type="date"]').forEach((dateField) => {
            const dateValue = dateField.value;
            if (dateValue) {
                const dateParts = dateValue.split('/');
                if (dateParts.length === 3) {
                    const formattedDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
                    formData.set(dateField.name, formattedDate);
                }
            }
        });

        disableSubmitButton();
        showLoadingSpinner();

        fetch(url, {
            method: "POST",
            body: formData,
        })
        .then((res) => res.json())
        .then((data) => {
            DataSaved(data);
        })
        .catch((error) => {
            console.error("Error:", error);
            Swal.fire({
                title: "Error",
                text: "There was an issue submitting the form. Please try again later.",
                icon: "error"
            });
            enableSubmitButton();
            hideLoadingSpinner();
            isSubmitting = false;
        });
    });


    function DataSaved(data) {
        if (data.success) {
            const lang = document.querySelector('input[name="language"]:checked').value;
            window.location.href = `success.html?lang=${lang}`;
        } else {
            Swal.fire({
                title: "Error",
                text: data.message || "Form couldn't be submitted to database",
                icon: "error"
            });
            enableSubmitButton();
            hideLoadingSpinner();
            isSubmitting = false;
        }
    }

    function disableSubmitButton() {
        submitButton.disabled = true;
        submitButton.classList.add('disabled-button');
    }

    function enableSubmitButton() {
        submitButton.disabled = false;
        submitButton.classList.remove('disabled-button');
    }

    function showLoadingSpinner() {
        loadingSpinner.classList.remove('hidden');
    }

    function hideLoadingSpinner() {
        loadingSpinner.classList.add('hidden');
    }

    const steps = document.querySelectorAll('.progress-step');
    const formSteps = document.querySelectorAll('.form-step');

    function updateProgressBar() {
        let activeStep = 1;
        formSteps.forEach((formStep, index) => {
            if (formStep.style.display !== 'none' && formStep.style.display !== '') {
                activeStep = index + 1;
            }
        });
        steps.forEach((stepEl, index) => {
            if (index + 1 <= activeStep) {
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
            }
        });
    }

    function checkStepVisibility() {
        formSteps.forEach((formStep, index) => {
            if (getComputedStyle(formStep).display !== 'none') {
                updateProgressBar(index + 1);
            }
        });
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'style') {
                checkStepVisibility();
            }
        });
    });

    formSteps.forEach((formStep) => {
        observer.observe(formStep, { attributes: true });
    });

    checkStepVisibility();




    document.addEventListener('DOMContentLoaded', function() {
        submitButton.addEventListener('touchstart', function(event) {
            event.preventDefault();
            form.dispatchEvent(new Event('submit'));
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const thirdDriverYes = document.getElementById('thirdDriverYes');
    const thirdDriverNo = document.getElementById('thirdDriverNo');
    const thirdDriverDetailsAll = document.getElementById('thirdDriverDetailsAll');
    const thirdDriverDetailsNonTemporary = document.getElementById('thirdDriverDetailsNonTemporary');

    function toggleThirdDriverDetails() {
        const vehicleType = document.querySelector('input[name="VehicleType"]:checked') ? document.querySelector('input[name="VehicleType"]:checked').value : null;
        const isTemporary = vehicleType === 'Car-Temporary' || vehicleType === 'Van-Temporary';

        if (thirdDriverYes.checked) {
            thirdDriverDetailsAll.style.display = 'block';
            if (!isTemporary) {
                thirdDriverDetailsNonTemporary.style.display = 'block';
            } else {
                thirdDriverDetailsNonTemporary.style.display = 'none';
            }
        } else {
            thirdDriverDetailsAll.style.display = 'none';
            thirdDriverDetailsNonTemporary.style.display = 'none';
        }
    }

    thirdDriverYes.addEventListener('change', toggleThirdDriverDetails);
    thirdDriverNo.addEventListener('change', toggleThirdDriverDetails);

    // Also add event listeners for vehicle type changes
    const vehicleTypeRadios = document.querySelectorAll('input[name="VehicleType"]');
    vehicleTypeRadios.forEach(radio => {
        radio.addEventListener('change', toggleThirdDriverDetails);
    });

    // Initialize the visibility based on default selection
    toggleThirdDriverDetails();
});



