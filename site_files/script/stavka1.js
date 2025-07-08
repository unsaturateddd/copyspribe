class CoefficientsController {
  /**
   * @param {string} cellsSelector
   * @param {string} minesSelectBtnSelector
   * @param {string} coeffDisplaySelector
   * @param {Array} modeCoefficients
   * @param {string} betButtonSelector
   * @param {string} balanceDisplaySelector
   * @param {function} resetBetCallback
   * @param {function} clearInactivityTimer
   * @param {string} winDisplaySelector
   */
  constructor(
  cellsSelector,
  minesSelectBtnSelector,
  coeffDisplaySelector,
  modeCoefficients,
  betButtonSelector,
  balanceDisplaySelector,
  resetBetCallback,
  clearInactivityTimer,
  winDisplaySelector
) {
  this.cells = document.querySelectorAll(cellsSelector);
  this.minesSelectBtn = document.querySelector(minesSelectBtnSelector);
  this.coeffDisplay = document.querySelector(coeffDisplaySelector);
  this.betButton = document.querySelector(betButtonSelector);
  this.balanceDisplay = document.querySelector(balanceDisplaySelector);
  this.winDisplay = document.querySelector(winDisplaySelector);
  this.isResettingGame = false;


  this.resetBetCallback = resetBetCallback;
  this.clearInactivityTimer = clearInactivityTimer;

    this.modeCoefficients = modeCoefficients;
    this.selectedMinesCount = 3;
    this.gameActive = false;
    this.openedCellsCount = 0;
    this.openedCells = new Set();

    this.currentBet = 0;
    this.currentWin = 0;

    const storedBalance = this.loadBalance();
    this.balance = !isNaN(storedBalance) ? storedBalance : 3000;

    this.updateBalanceDisplay();
    this.updateCurrentWin(0);
    this.saveBalance();
    this.setBalanceToDiv(this.balance);


    

    this.init();
  }

  init() {
    if (!this.minesSelectBtn) {
      console.warn('Кнопка выбора мин не найдена');
      return;
    }

    const dropdownItems = document.querySelectorAll('.dropdown-list-number .dropdown-item');
    if (!dropdownItems.length) {
      console.warn('Не найдены элементы меню выбора мин');
    } else {
      dropdownItems.forEach(item => {
        item.addEventListener('click', e => {
          const val = parseInt(e.target.textContent, 10);
          if (!isNaN(val)) {
            this.selectMinesCount(val);
            this.updateMinesSelectBtn(val);
          }
        });
      });
    }

    
    this.cells.forEach((cell, idx) => {
      cell.addEventListener('click', () => this.onCellClick(idx));
    });

    this.updateCoeffDisplayMin();

    this.updateMinesSelectBtn(this.selectedMinesCount);
  }


  loadBalance() {
    const stored = localStorage.getItem('gameBalance');
    return stored ? parseFloat(stored) : null;
  }

  saveBalance() {
    localStorage.setItem('gameBalance', this.balance.toFixed(2));
  }

  getBalanceFromDiv() {
    if (!this.balanceDisplay) return 0;
    let text = this.balanceDisplay.textContent || '';
    text = text.replace(/[^\d.,]/g, '').trim();
    text = text.replace(/,/g, '');
    return parseFloat(text) || 0;
  }

  setBalanceToDiv(value) {
  if (!this.balanceDisplay) return;

  const currency = localStorage.getItem('gameCurrency') || 'USD';

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

  this.balanceDisplay.innerHTML = `${formatted} <span class="text-white-50 ml-1">${currency}</span>`;
 
  localStorage.setItem('gameBalance', value.toFixed(2));
}

saveBalance() {
  localStorage.setItem('gameBalance', this.balance.toFixed(2));
}




  updateBalanceDisplay() {
    this.setBalanceToDiv(this.balance);
  }

  generateRandomMines(totalCells, minesCount) {
  const mines = new Set();
  while (mines.size < minesCount) {
    const idx = Math.floor(Math.random() * totalCells);
    mines.add(idx);
  }
  return mines;
}

getMinesIndices() {
  const totalCells = this.cells.length;
  const fixedCount = this.selectedMinesCount;
  const openedSet = this.openedCells;

  const availableIndices = [];
  for (let i = 0; i < totalCells; i++) {
    if (!openedSet.has(i)) {
      availableIndices.push(i);
    }
  }

  if (!this.minesSet || this.minesSet.size !== fixedCount) {
    const mines = new Set();
    while (mines.size < fixedCount) {
      const randIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      mines.add(randIdx);
    }
    this.minesSet = mines;
  }

  return this.minesSet;
}


getWinIndices() {
  const totalCells = this.cells.length;
  const openedSet = this.openedCells;
  const minesSet = this.getMinesIndices();

  const wins = new Set();

  openedSet.forEach(idx => wins.add(idx));

  for (let i = 0; i < totalCells; i++) {
    if (!openedSet.has(i) && !minesSet.has(i)) {
      wins.add(i);
    }
  }

  return wins;
}


  updateCurrentWin(amount) {
    this.currentWin = amount;
    if (this.winDisplay) {
      this.winDisplay.textContent = `Current Win: ${amount.toFixed(2)}`;
    }
  }

  showWinAmountBox(amount) {
  const header = document.querySelector('.game-header.position-relative');
  if (!header) return;

  let box = header.querySelector('.win-amount-box');
  if (!box) {
    box = document.createElement('div');
    box.classList.add('win-amount-box');
    header.appendChild(box);
  }

  const currency = localStorage.getItem('gameCurrency') || 'USD';
  box.textContent = `+${amount.toFixed(2)} ${currency}`;
  box.classList.add('show');
}


hideWinAmountBox() {
  const header = document.querySelector('.game-header.position-relative');
  if (!header) return;

  const box = header.querySelector('.win-amount-box');
  if (box) {
    box.classList.remove('show');
    setTimeout(() => box.remove(), 300);
  }
}

  updateBetButtonToCashOut() {
  if (!this.betButton) return;

  const currency = localStorage.getItem('gameCurrency') || 'USD';

  this.betButton.style.position = 'relative';

  this.betButton.innerHTML = `
    <div class="cashout-text">Cash Out</div>
    <div class="bet-win-indicator">0.00 ${currency}</div>
  `;

  this.betButton.style.backgroundColor = '#8B4513';
  this.betButton.style.opacity = '0.6';
  this.betButton.style.pointerEvents = 'auto';
  this.betButton.disabled = false;
}



updateProgressBar() {
  const bar = document.querySelector('.progress-bar.bg-success');
  if (!bar) return;

  const totalCells = this.cells.length;
  const maxOpen = totalCells - this.selectedMinesCount;

  const percent = Math.min((this.openedCellsCount / maxOpen) * 100, 100);
  bar.style.width = `${percent.toFixed(2)}%`;
  bar.setAttribute('aria-valuenow', percent.toFixed(0));
}

  

  updateBetButtonToBet() {
  if (!this.betButton) return;
  this.betButton.innerHTML = `
    <i></i>
    <img src="icon-play.284324538612d258.svg" alt="icon" width="23" height="23" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none;">
    Bet
  `;
  this.betButton.style.backgroundImage = '';
  this.betButton.style.backgroundColor = '#28a745';
  this.betButton.style.opacity = '1';
  this.betButton.style.pointerEvents = 'auto';
  this.betButton.disabled = false;
  const indicator = this.betButton.querySelector('.bet-win-indicator');
  if (indicator) {
    indicator.style.display = 'none';
  }
}


  selectMinesCount(count) {
    if (count < 1 || count > 20) {
      console.warn('Неверное количество мин:', count);
      return;
    }
    this.selectedMinesCount = count;
    this.openedCellsCount = 0;
    this.updateCoeffDisplayMin();
    console.log(`Выбрано мин: ${count}`);
  }

  updateMinesSelectBtn(val) {
    if (!this.minesSelectBtn) return;
    const labelSpan = this.minesSelectBtn.querySelector('.centered-xy');
    if (labelSpan) {
      labelSpan.firstChild.textContent = `Mines: ${val} `;
    } else {
      this.minesSelectBtn.textContent = `Mines: ${val}`;
    }
  }


  updateCoeffDisplayMin() {
    if (!this.coeffDisplay) return;
    const coeffs = this.modeCoefficients[this.selectedMinesCount - 1];
    if (!coeffs) return;
    this.coeffDisplay.textContent = `${coeffs[0].toFixed(2)}x`;
  }

  updateCoeffDisplayCurrent(coeff) {
  if (!this.coeffDisplay) return;
  this.coeffDisplay.textContent = `${coeff.toFixed(2)}x`;

  const currency = localStorage.getItem('gameCurrency') || 'USD';
  const indicator = this.betButton.querySelector('.bet-win-indicator');

  if (indicator) {
    if (coeff <= 1) {
      indicator.textContent = `0.00 ${currency}`;
    } else {
      const winAmount = (this.currentBet * coeff).toFixed(2);
      indicator.textContent = `${winAmount} ${currency}`;
    }
  }
}


  onCellClick(idx) {
  if (!this.gameActive) return;

  const totalCells = this.cells.length;
  const maxOpen = totalCells - this.selectedMinesCount;

  if (this.openedCells.has(idx)) return;
  if (this.openedCellsCount >= maxOpen) return;

  this.openedCells.add(idx);
  this.openedCellsCount++;
  this.updateProgressBar();


  const cell = this.cells[idx];

  const mask = document.createElement('div');
  mask.classList.add('mask');
  cell.appendChild(mask);

  setTimeout(() => mask.classList.add('open'), 10);

  mask.addEventListener('transitionend', () => {
    mask.remove();

    cell.classList.add('opened');

    const coeffs = this.modeCoefficients[this.selectedMinesCount - 1];
    const coeff = coeffs[this.openedCellsCount - 1] || 1;
    this.updateCoeffDisplayCurrent(coeff);
    this.updateCurrentWin(this.currentBet * coeff);

    if (this.betButton.style.opacity !== '1') {
      this.betButton.style.backgroundColor = '#FFA500';
      this.betButton.style.opacity = '1';
      this.betButton.disabled = false;
      this.betButton.style.pointerEvents = 'auto';
    }

    if (this.openedCellsCount === maxOpen) {
      const cells = Array.from(this.cells);
      const openedIndices = new Set(this.openedCells);

      const minesIndices = this.getMinesIndices ? this.getMinesIndices() : new Set();
      const winsIndices = this.getWinIndices ? this.getWinIndices() : new Set();

  if (this.currentWin > 0) {
    this.showWinAmountBox(this.currentWin);
  }

      animateCashOut(cells, openedIndices, minesIndices, winsIndices, this.betButton, () => {
        this.hideWinAmountBox();
        this.cashOut();
        this.endGame();
        this.updateBetButtonToBet();
        this.updateProgressBar();
      });
    }
  }, { once: true });
}


  startGame() {
    this.minesSet = null;
    this.gameActive = true;
    this.openedCellsCount = 0;
    this.openedCells.clear();
    this.updateProgressBar();


    this.cells.forEach(cell => {
      cell.classList.remove('opened', 'mines-active');
      if (!cell.classList.contains('mines-default')) {
        cell.classList.add('mines-default');
      }
      const mask = cell.querySelector('.mask');
      if (mask) mask.remove();

      const newMask = document.createElement('div');
      newMask.classList.add('mask');
      cell.appendChild(newMask);
    });

    this.updateCoeffDisplayMin();

    if (this.betButton) {
      this.betButton.disabled = false;
      this.betButton.style.backgroundColor = '#8B4513';
      this.betButton.style.opacity = '0.6';
      this.betButton.style.pointerEvents = 'auto';
      this.betButton.textContent = 'Cash Out';
    }

    if (typeof this.resetInactivityTimer === 'function') {
      this.resetInactivityTimer();
    }

    console.log('Игра началась с мин:', this.selectedMinesCount);
  }


  placeBet() {
  console.log('placeBet: currentBet =', this.currentBet, 'баланс до списания =', this.balance);
  const bet = parseFloat(this.currentBet);
  if (isNaN(bet) || bet <= 0) {
    alert('Введите ставку больше 0');
    return;
  }
  this.currentBet = bet;

  if (this.currentBet > this.balance) {
    alert('Недостаточно баланса');
    return;
  }

  this.balance -= this.currentBet;
  console.log('placeBet: баланс после списания =', this.balance);

  this.saveBalance();
  this.updateBalanceDisplay();
  this.startGame();
  this.updateCurrentWin(0);
  this.setBalanceToDiv(this.balance);

  if (this.resetBetCallback) {
    this.resetBetCallback();
  }
}



cashOut() {
  if (this.currentWin > 0) {
    this.balance += this.currentWin;
    this.saveBalance();
    this.updateBalanceDisplay();
    this.setBalanceToDiv(this.balance);

    this.showWinAmountBox(this.currentWin);
  }

  this.currentWin = 0;
  this.updateCurrentWin(0);

  const cells = Array.from(this.cells);
  const openedIndices = new Set(this.openedCells);

  const minesIndices = this.getMinesIndices ? this.getMinesIndices() : new Set();
  const winsIndices = this.getWinIndices ? this.getWinIndices() : new Set();

  animateCashOut(cells, openedIndices, minesIndices, winsIndices, this.betButton, () => {
    this.hideWinAmountBox();
    this.endGame();
    this.updateBetButtonToBet();
    this.updateProgressBar();
  });
}


  endGame(won = false) {
    this.isResettingGame = true;
    this.gameActive = false;
    this.openedCells.clear();
    this.updateProgressBar();
    this.openedCellsCount = 0;
    this.isLastCellOpening = false;

    if (this.coeffDisplay) this.coeffDisplay.textContent = '';

    this.cells.forEach(cell => {
  cell.classList.remove('mines-active', 'opened', 'mine-shown', 'win-shown');
  if (!cell.classList.contains('mines-default')) {
    cell.classList.add('mines-default');
  }
  cell.style.backgroundImage = '';

      const mask = cell.querySelector('.mask');
      if (mask) {
        mask.remove();
      }
    });

    this.updateCoeffDisplayMin();

    if (this.betButton) {
      this.betButton.disabled = false;
      this.betButton.style.backgroundColor = '#28a745';
      this.betButton.style.opacity = '1';
      this.betButton.style.pointerEvents = 'auto';

    }

    if (this.resetBetCallback) {
      this.resetBetCallback();
    }

    if (this.minesSelectBtn) {
      this.minesSelectBtn.disabled = false;
    }

    if (typeof this.clearInactivityTimer === 'function') {
      this.clearInactivityTimer();
    }

    console.log(won ? 'Победа!' : 'Игра полностью сброшена');

    setTimeout(() => {
    this.isResettingGame = false;
  }, 100);
}
}

