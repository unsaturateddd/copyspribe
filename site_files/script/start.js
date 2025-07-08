window.addEventListener('DOMContentLoaded', () => {

  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    if (!cell.querySelector('.mask')) {
      const maskDiv = document.createElement('div');
      maskDiv.classList.add('mask');
      cell.appendChild(maskDiv);
    }
  });

  console.log('Page loaded, DOMContentLoaded fired');


  const coeffController = new CoefficientsController(
  '.cell',
  '#minesSelectBtn',
  '.next-tile > span.ng-star-inserted:nth-of-type(2)',
  window.modeCoefficients,
  '.btn.btn-control.btn-bet.btn-green',
  '.balance',
  () => { /* сброс UI ставки */ },
  () => { if (inactivityTimer) clearTimeout(inactivityTimer); },
  '.win-display'
);




const minesSelectBtn = document.querySelector('#minesSelectBtn');
const dropdownMenu = document.querySelector('.dropdown-list-number');
console.log('minesSelectBtn:', minesSelectBtn);
console.log('dropdownMenu:', dropdownMenu);



dropdownMenu.addEventListener('click', e => {
  if (e.target.classList.contains('dropdown-item')) {
    const selectedValue = parseInt(e.target.textContent.trim(), 10);
    if (!isNaN(selectedValue)) {
      coeffController.selectMinesCount(selectedValue);
      coeffController.updateMinesSelectBtn(selectedValue);
    }
    dropdownMenu.classList.remove('show');
  }
});





const betButton = document.querySelector('.btn.btn-control.btn-bet.btn-green.w-100.ml-2.text-uppercase.ng-star-inserted');
console.log('betButton:', betButton);
const betAmountElement = document.querySelector('.bet-spinner .input > div') || document.querySelector('.input > div');
const inputDiv = document.querySelector('.input.roboto-font-b');
const balanceElement = document.querySelector('.balance.text-white.mr-2.d-flex.align-items-center.ml-auto');

console.log('betButton:', betButton);
console.log('betAmountElement:', betAmountElement);
console.log('inputDiv:', inputDiv);
console.log('balanceElement:', balanceElement);
console.log('minesSelectBtn:', minesSelectBtn);

if (!betButton || !betAmountElement || !inputDiv || !balanceElement || !minesSelectBtn) {
  console.log('Не найдены необходимые элементы');
  return;
}



let inactivityTimer = null;
let prevValue = betAmountElement.textContent.trim();


inputDiv.setAttribute('contenteditable', 'true');
inputDiv.style.outline = 'none';
inputDiv.addEventListener('focus', () => inputDiv.style.outline = 'none');

function saveCaretPosition(context) {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(context);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  return preSelectionRange.toString().length;
}

function restoreCaretPosition(context, pos) {
  if (pos === null) return;
  const selection = window.getSelection();
  const range = document.createRange();
  let currentPos = 0;

  function traverseNodes(node) {
    if (!node) return null;
    if (node.nodeType === 3) {
      const nextPos = currentPos + node.length;
      if (pos <= nextPos) return { node, offset: pos - currentPos };
      currentPos = nextPos;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        const res = traverseNodes(node.childNodes[i]);
        if (res) return res;
      }
    }
    return null;
  }

  const found = traverseNodes(context);
  if (found) {
    range.setStart(found.node, found.offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

 inputDiv.addEventListener('input', () => {
  let text = inputDiv.textContent.trim();
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  prevValue = text;
  betAmountElement.textContent = text;
  restoreCaretPosition(inputDiv, saveCaretPosition(inputDiv));
});


document.querySelectorAll('.dropdown-toggle.btn.btn-game').forEach(button => {
  const dropdownMenu = button.nextElementSibling;
  if (!dropdownMenu || !dropdownMenu.classList.contains('dropdown-list-number')) return;

  document.body.appendChild(dropdownMenu);

  button.addEventListener('click', e => {
    e.stopPropagation();

    document.querySelectorAll('.dropdown-list-number.show').forEach(menu => {
      if (menu !== dropdownMenu) menu.classList.remove('show');
    });

    dropdownMenu.classList.toggle('show');

    if (dropdownMenu.classList.contains('show')) {
      const rect = button.getBoundingClientRect();
      dropdownMenu.style.position = 'fixed';
      dropdownMenu.style.top = `${rect.bottom}px`;
      dropdownMenu.style.left = `${rect.left}px`;
      dropdownMenu.style.zIndex = '99999';
    }
  });

  dropdownMenu.addEventListener('click', e => {
    if (e.target.classList.contains('dropdown-item')) {
      const selectedValue = parseInt(e.target.textContent.trim(), 10);
      if (!isNaN(selectedValue)) {
        coeffController.selectMinesCount(selectedValue);
        coeffController.updateMinesSelectBtn(selectedValue);
        dropdownMenu.classList.remove('show');
      }
    }
  });
});



document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-list-number.show').forEach(menu => {
    menu.classList.remove('show');
  });
});


betButton.addEventListener('click', () => {
  if (coeffController.gameActive) {

    coeffController.cashOut();
    return;
  }

  if (coeffController.isResettingGame) {
    console.log('Игра только что завершилась, подождите перед новой ставкой');
    return;
  }

  const betAmountText = betAmountElement.textContent.trim();
  const betAmount = parseFloat(betAmountText.replace(',', '.'));
  if (isNaN(betAmount) || betAmount <= 0) {
    alert('Введите ставку больше 0');
    return;
  }

  const balanceText = balanceElement.textContent.trim();
  const balanceNumberMatch = balanceText.match(/[\d,]+\.?\d*/);
  if (!balanceNumberMatch) {
    console.error('Не удалось получить число баланса');
    return;
  }
  const rawBalanceStr = balanceNumberMatch[0];
  const normalizedBalanceStr = rawBalanceStr.replace(/,/g, '');
  const balance = parseFloat(normalizedBalanceStr);
  if (isNaN(balance)) {
    console.error('Неверный формат баланса');
    return;
  }

  if (balance < betAmount) {
    alert('Недостаточно средств для ставки!');
    return;
  }

  coeffController.currentBet = betAmount;
  coeffController.placeBet();
  coeffController.updateBetButtonToCashOut();

  replaceMinesImages();

  betButton.disabled = true;
  betButton.style.opacity = '0.5';
  betButton.style.backgroundImage = 'radial-gradient(44% 44% at 49.36% 52%, #dba355 0%, #c4872e 100%)';


  resetInactivityTimer();

  cells.forEach((cell, idx) => {
    cell.onclick = () => {
      if (!coeffController.gameActive) return;
      resetInactivityTimer();
      coeffController.onCellClick(idx);
      openCellWithMaskAnimation(cell);
    };
  });
});







function updateBalance(newBalance) {
  const usdSpan = balanceElement.querySelector('span.text-white-50.ml-1');
  const formattedNumber = newBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  balanceElement.innerHTML = '';
  balanceElement.appendChild(document.createTextNode(formattedNumber + ' '));
  if (usdSpan) {
    balanceElement.appendChild(usdSpan);
  }
}

function replaceMinesImages() {
  const cells = document.querySelectorAll('.cell.mines-default');
  cells.forEach(cell => {
    cell.classList.remove('mines-default');
    cell.classList.add('mines-active');
  });
}

function openCellWithMaskAnimation(cell) {
  const mask = cell.querySelector('.mask');
  if (!mask) return;

  mask.classList.add('open');

  function handler(event) {
    if (event.propertyName !== 'transform') return;

    cell.classList.add('transparent');

    mask.removeEventListener('transitionend', handler);
  }

  mask.addEventListener('transitionend', handler);
}




function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => endGame(), 15000);
}


function endGame() {
  console.log('Игра завершена по таймауту бездействия');
  restoreMinesImages();
  betButton.disabled = false;
  betButton.style.opacity = '1';
  coeffController.gameActive = false;
  translateBetButton(currentLang);

  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.onclick = null;
  });
}

function restoreMinesImages() {
  const cells = document.querySelectorAll('.cell.mines-active');
  cells.forEach(cell => {
    cell.classList.remove('mines-active');
    cell.classList.add('mines-default');
    delete cell.dataset.coefficient;
    cell.title = '';
  });
}
});