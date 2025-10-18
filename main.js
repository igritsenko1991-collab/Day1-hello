
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');
    const nav = document.querySelector('.nav');

    if (!navToggle) {
        console.error('main.js: .nav-toggle not found in DOM');
        return;
    }
    if (!navList) {
        console.error('main.js: .nav-list not found in DOM');
        return;
    }

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

  navToggle.addEventListener('click', (e) => {
    // переключаем меню
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
        navToggle.focus(); // вернуть фокус на кнопку
      }
    }
  });

  // Закрыть при клике вне меню (только если меню открыто)
  document.addEventListener('click', (e) => {
    if (!navList.classList.contains('active')) return;
    // если клик не внутри nav (ни кнопку, ни список) — закрыть
    if (!nav.contains(e.target)) {
      closeMenu();
    }
  });


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
  console.error('main.js: .back-to-top button not found in DOM');
}
});
// === Contact form validation & fake submit ===
(function(){
  const form = document.getElementById('contact-form');
  if (!form) return console.log('main.js: contact form not found');

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
    // встроенная проверка
    if (!input.checkValidity()) {
      if (input.validity.valueMissing) return showError(input, 'Это поле обязательно');
      if (input.validity.typeMismatch && input.type === 'email') return showError(input, 'Введите корректный email');
      if (input.validity.tooShort) return showError(input, `Минимум ${input.minLength} символов`);
      if (input.validity.patternMismatch) return showError(input, 'Неправильный формат');
      return true;
    }
    return true;
  };

  // Валидация в реальном времени (debounce)
  const debounce = (fn, wait=250) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  ['name','email','message'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', debounce(() => validateField(el), 300));
    el.addEventListener('blur', () => validateField(el));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Очистка статуса
    status.className = 'visually-hidden';
    status.textContent = '';

    // Проверим все поля и сконцентрируемся на первой ошибке
    const fields = ['name','email','message'].map(id => document.getElementById(id)).filter(Boolean);
    let firstInvalid = null;
    fields.forEach(f => {
      if (!f.checkValidity()) {
        validateField(f);
        if (!firstInvalid) firstInvalid = f;
      } else {
        clearError(f);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Подготовка к отправке
    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка…';

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
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Network response was not ok');

      // Успех
      status.className = 'ok';
      status.textContent = 'Спасибо! Сообщение отправлено (демо).';
      status.classList.remove('visually-hidden');

      // Сброс формы через небольшую задержку
      setTimeout(() => {
        form.reset();
        ['name','email','message'].forEach(id => clearError(document.getElementById(id)));
      }, 600);
    } catch (err) {
      status.className = 'err';
      status.textContent = 'Ошибка отправки. Попробуйте позже.';
      status.classList.remove('visually-hidden');
      console.error('send error', err);
    } finally {
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить';
    }
  });
})();
