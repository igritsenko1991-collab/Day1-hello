
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
});