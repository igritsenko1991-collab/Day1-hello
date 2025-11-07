/* Прелодер */
(function initPreloader() {
  const preloader = document.getElementById('preloader');
  const main = document.querySelector('main'); // можно изменить, если у тебя другой основной контейнер

  if (!preloader || !main) return;

  // Скрываем контент до загрузки
  main.classList.add('page-hidden');

  window.addEventListener('load', () => {
    // Hide preloader плавно
    preloader.classList.add('hidden');
    setTimeout(() => {
      main.classList.remove('page-hidden');
      main.classList.add('page-ready');
      preloader.remove();
    }, 450); // соответствует CSS transition
  });

  // если страница уже загружена (например при горячей перезагрузке)
  if (document.readyState === 'complete') {
    window.dispatchEvent(new Event('load'));
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // Бургер меню и навигация
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  const nav = document.querySelector('.nav');

  if (navToggle && navList) {
    // Инициализация ARIA-значений
    navToggle.setAttribute('aria-expanded', 'false');
    navList.setAttribute('aria-hidden', 'true');

    console.log('main.js: burger menu initialized');

    const openMenu = () => {
      navToggle.setAttribute('aria-expanded', 'true');
      navList.classList.add('active');
      navList.setAttribute('aria-hidden', 'false');
    };

    const closeMenu = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navList.classList.remove('active');
      navList.setAttribute('aria-hidden', 'true');
    };

    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
      console.log('main.js: toggled menu — expanded=', !expanded);
    });

    // Закрыть по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (navList.classList.contains('active')) {
          closeMenu();
          navToggle.focus();
        }
      }
    });

    // Закрыть при клике вне меню
       document.addEventListener('click', (e) => {
      if (!navList.classList.contains('active')) return;
      if (!nav || !nav.contains(e.target)) closeMenu();
    });

  } else {
    console.error('main.js: Navigation elements not found — skipping menu init');
  }

  // Кнопка "Наверх"
  const backToTopButton = document.querySelector('.back-to-top');
  if (backToTopButton) {
    // Показать/скрыть кнопку при прокрутке
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
        backToTopButton.style.display = 'block';
      } else {
        backToTopButton.classList.remove('show');
        // Скрываем после завершения анимации
        setTimeout(() => {
          if (!backToTopButton.classList.contains('show')) {
            backToTopButton.style.display = 'none';
          }
        }, 300);
      }
    });

    // Плавная прокрутка при клике
    backToTopButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    console.log('main.js: back-to-top button initialized');
    } else {
    console.warn('main.js: Navigation elements not found — skipping menu init');
  }


  // Intersection Observer для анимаций
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.08});

  const fadeElements = document.querySelectorAll('.fade-in');
  if (fadeElements.length > 0) {
    fadeElements.forEach(el => observer.observe(el));
    console.log(`main.js: observing ${fadeElements.length} fade-in elements`);
  }
});

// Contact form validation & fake submit
(function() {
  const form = document.getElementById('contact-form');
  if (!form) {
    console.log('main.js: contact form not found');
    return;
  }

  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit');
  let isSubmitting = false;

  // Вспомогательные функции
  const showError = (input, msg) => {
    const id = input.id + '-err';
    const el = document.getElementById(id);
    input.classList.add('input-invalid');
    if (el) {
      el.textContent = msg;
      el.classList.remove('visually-hidden');
    }
  };

  const clearError = (input) => {
    const id = input.id + '-err';
    const el = document.getElementById(id);
    input.classList.remove('input-invalid');
    if (el) {
      el.textContent = '';
      el.classList.add('visually-hidden');
    }
  };

  const validateField = (input) => {
    clearError(input);
    // Встроенная проверка
    if (!input.checkValidity()) {
      if (input.validity.valueMissing) {
        showError(input, 'Это поле обязательно');
      } else if (input.validity.typeMismatch && input.type === 'email') {
        showError(input, 'Введите корректный email');
      } else if (input.validity.tooShort) {
        showError(input, `Минимум ${input.minLength} символов`);
      } else if (input.validity.patternMismatch) {
        showError(input, 'Неправильный формат');
      }
      return false;
    }
    return true;
  };

  // Валидация в реальном времени (debounce)
  const debounce = (fn, wait = 250) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  };

  ['name', 'email', 'message'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', debounce(() => validateField(el), 300));
    el.addEventListener('blur', () => validateField(el));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Очистка статуса
    if (status) {
    status.className = 'visually-hidden';
    status.textContent = '';
    }
  
    // Проверка
    const fields = ['name', 'email', 'message'].map(id => document.getElementById(id)).filter(Boolean);
    let firstInvalid = null;
    let allValid = true;

    fields.forEach(f => {
      if (!validateField(f)) {
        allValid = false;
        if (!firstInvalid) firstInvalid = f;
      } else {
        clearError(f);
      }
    });

    if (!allValid && firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Подготовка к отправке
    isSubmitting = true;
    if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка…';
    }
    const payload = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
      ts: new Date().toISOString()
    };

    try {
      // Тестовый endpoint (jsonplaceholder) — можно заменить на реальный API
      const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Network response was not ok');

      // Успех
      if (status) {
      status.className = 'ok';
      status.textContent = 'Спасибо! Сообщение отправлено (демо).';
      status.classList.remove('visually-hidden');
      }
      // Сброс формы через небольшую задержку
      setTimeout(() => {
        form.reset();
        ['name', 'email', 'message'].forEach(id => {
          const field = document.getElementById(id);
          if (field) clearError(field);
        });
      }, 600);
    } catch (err) {
      if (status) {
      status.className = 'err';
      status.textContent = 'Ошибка отправки. Попробуйте позже.';
      status.classList.remove('visually-hidden');
      console.error('send error', err);
      }
    } finally {
      isSubmitting = false;
      if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить';
    }
  }
  });
})();