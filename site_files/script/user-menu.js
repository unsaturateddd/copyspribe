document.addEventListener('DOMContentLoaded', () => {
  // ======== Элементы UI ========
  const openBtn = document.querySelector('.dropdown-toggle.btn.btn-game.user-menu');
  const modal = document.getElementById('settings-modal');
  const cancelBtn = document.getElementById('cancel-settings');
  const applyBtn = document.getElementById('apply-settings');

  const currencySelect = document.getElementById('currency-select');
  const balanceInput = document.getElementById('balance-input');
  const languageSelect = document.getElementById('language-select');

  if (!openBtn || !modal) {
    console.warn('Не найдены элементы управления модальным окном');
    return;
  }

  // ======== Словарь переводов ========
  const translations = {
    en: {
      "Bet": "Bet",
      "Mines": "Mines",
      "How to Play?": "How to Play?",
      "Next:": "Next:",
      "Auto Game": "Auto Game",
      "Cash Out": "Cash Out",
      "RANDOM": "RANDOM",
    },
    hi: {
      "Bet": "शर्त",
      "Mines": "माइंस",
      "How to Play?": "कैसे खेलें?",
      "Next:": "अगला:",
      "Auto Game": "स्वचालित खेल",
      "Cash Out": "कैश आउट",
      "RANDOM": "रैंडम",
    },
    pt: {
      "Bet": "Aposta",
      "Mines": "Minas",
      "How to Play?": "Como Jogar?",
      "Next:": "Próximo:",
      "Auto Game": "Jogo Automático",
      "Cash Out": "Sacar",
      "RANDOM": "ALEATÓRIO",
    }
  };

  // ======== Селекторы для установки data-translate-key ========
  const translateSelectors = [
    '.note',
    '.centered-xy',       // здесь находится Mines: 3
    '.custom-control-label',
    '.btn-control .cashout-text',
    '.mr-1.ng-star-inserted',
    'button.btn.btn-control.btn-bet',
    'button.how span'
  ];

  // ======== Установка data-translate-key по текущему тексту ========
  function addDataTranslateKeys() {
    translateSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.hasAttribute('data-translate-key')) {
          if (el.classList.contains('btn-bet')) {
            const spanText = el.querySelector('.btn-text');
            if (spanText && !spanText.hasAttribute('data-translate-key')) {
              const key = spanText.textContent.trim();
              if (key) spanText.setAttribute('data-translate-key', key);
            }
          } else {
            const key = el.textContent.trim();
            if (key) el.setAttribute('data-translate-key', key);
          }
        }
      });
    });
  }

  // ======== Функция для перевода текста с динамическими числами (например "Mines: 3") ========
  function translateWithDynamicNumber(text, lang) {
    // Пример: разделить по ":"
    const parts = text.split(':');
    if (parts.length === 2) {
      const keyPart = parts[0].trim();
      const numberPart = ':' + parts[1]; // двоеточие + число и пробелы

      const translatedKey = (translations[lang] && translations[lang][keyPart]) || keyPart;
      return translatedKey + numberPart;
    }
    return text;
  }

  function translateElementsByDataKey(lang) {
  document.querySelectorAll('[data-translate-key]').forEach(el => {
    const key = el.getAttribute('data-translate-key');
    if (!key) return;

    // Проверяем, есть ли в тексте валюта
    const currencyMatch = key.match(/\b(USD|EUR|RUB|INR|TRY|KZT|TJS|BRL)\b/);

    let baseKey = key;
    let currency = '';

    if (currencyMatch) {
      currency = currencyMatch[0];
      // Отрезаем валюту с конца, но учитывая пробелы
      baseKey = key.replace(currency, '').trim();
    }

    let translatedBase = '';

    if (/^[A-Za-z]+\s*:\s*\d+/.test(baseKey)) {
      translatedBase = translateWithDynamicNumber(baseKey, lang);
    } else {
      translatedBase = (translations[lang] && translations[lang][baseKey]) || baseKey;
    }

    // Если элемент — кнопка с текстом, вставляем перевод + валюту
    if (el.classList.contains('btn-text')) {
      el.textContent = `${translatedBase} ${currency}`.trim();
      return;
    }

    // Если в элементе нет детей — заменяем текст с валютой
    if (el.children.length === 0) {
      el.textContent = `${translatedBase} ${currency}`.trim();
    }
  });
}



  // ======== MutationObserver для перевода динамически добавленных элементов ========
  function observeDynamicTranslations(lang) {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              translateSelectors.forEach(selector => {
                if (node.matches(selector) && !node.hasAttribute('data-translate-key')) {
                  if (node.classList.contains('btn-bet')) {
                    const spanText = node.querySelector('.btn-text');
                    if (spanText && !spanText.hasAttribute('data-translate-key')) {
                      const key = spanText.textContent.trim();
                      if (key) spanText.setAttribute('data-translate-key', key);
                    }
                  } else {
                    const key = node.textContent.trim();
                    if (key) node.setAttribute('data-translate-key', key);
                  }
                }
                node.querySelectorAll(selector).forEach(child => {
                  if (!child.hasAttribute('data-translate-key')) {
                    if (child.classList.contains('btn-bet')) {
                      const spanText = child.querySelector('.btn-text');
                      if (spanText && !spanText.hasAttribute('data-translate-key')) {
                        const key = spanText.textContent.trim();
                        if (key) spanText.setAttribute('data-translate-key', key);
                      }
                    } else {
                      const key = child.textContent.trim();
                      if (key) child.setAttribute('data-translate-key', key);
                    }
                  }
                });
              });
              translateElementsByDataKey(lang);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // ======== Обновление баланса на странице ========
  function updateBalanceDisplay(balance, currency) {
    const balanceBlock = document.querySelector('.balance.text-white');
    if (balanceBlock) {
      const span = balanceBlock.querySelector('span.text-white-50');
      balanceBlock.childNodes[0].nodeValue = `${balance.toFixed(2)} `;
      if (span) {
        span.textContent = currency;
      } else {
        const newSpan = document.createElement('span');
        newSpan.className = 'text-white-50';
        newSpan.textContent = currency;
        balanceBlock.appendChild(newSpan);
      }
    }
  }

  // ======== Обновление валюты в текстах ========
  function updateCurrencyDisplays(currency) {
    const elements = document.querySelectorAll('.text-white-50.ml-1, .note, .bet-win-indicator, .win-amount-box');

    elements.forEach(el => {
      let text = el.textContent.trim();

      // Удаляем старые коды валюты из текста
      text = text.replace(/\b(USD|EUR|RUB|INR|TRY|KZT|TJS|BRL)\b/g, '');
      text = text.replace(/\s+/g, ' ').trim();

      el.textContent = `${text} ${currency}`;
    });
  }

  // ======== Применяем язык и перевод ========
  function applyLanguage(lang) {
    document.documentElement.lang = lang;
    addDataTranslateKeys();
    translateElementsByDataKey(lang);
    observeDynamicTranslations(lang);
  }

  // ======== Применяем сохранённые настройки из localStorage ========
  function applySavedValues() {
    const savedBalance = parseFloat(localStorage.getItem('gameBalance'));
    const savedCurrency = localStorage.getItem('gameCurrency') || 'USD';
    const savedLanguage = localStorage.getItem('gameLanguage') || 'en';

    if (!isNaN(savedBalance)) {
      updateBalanceDisplay(savedBalance, savedCurrency);
      if (balanceInput) balanceInput.value = savedBalance;
    }
    if (currencySelect) currencySelect.value = savedCurrency;
    if (languageSelect) languageSelect.value = savedLanguage;

    updateCurrencyDisplays(savedCurrency);
    applyLanguage(savedLanguage);
  }

  // ======== Управление модальным окном ========
  openBtn.addEventListener('click', e => {
    e.stopPropagation();
    modal.style.display = 'block';
  });

  cancelBtn && cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  document.addEventListener('click', e => {
    if (!modal.contains(e.target) && e.target !== openBtn) {
      modal.style.display = 'none';
    }
  });

  // ======== Сохраняем настройки при нажатии на кнопку "Применить" и перезагружаем страницу ========
  applyBtn.addEventListener('click', () => {
    const newBalance = parseFloat(balanceInput.value);
    const newCurrency = currencySelect.value;
    const newLanguage = languageSelect.value;

    if (!isNaN(newBalance)) {
      localStorage.setItem('gameBalance', newBalance.toFixed(2));
    }
    if (newCurrency) {
      localStorage.setItem('gameCurrency', newCurrency);
    }
    if (newLanguage) {
      localStorage.setItem('gameLanguage', newLanguage);
    }

    modal.style.display = 'none';

    location.reload();
  });

  // ======== Переопределяем localStorage.setItem для мгновенного обновления интерфейса (на всякий случай) ========
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (key === 'gameCurrency' || key === 'gameBalance' || key === 'gameLanguage') {
      applySavedValues();
    }
  };

  // ======== Инициализация при загрузке ========
  applySavedValues();
});
