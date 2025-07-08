window.addEventListener('DOMContentLoaded', () => {
  const possibleBets = [0.1, 0.2, 0.3, 0.4, 0.5, 0.8, 1.2, 2, 4, 10, 20, 50, 100, 200, 500, 1000, 5000, 10000, 50000, 100000, 250000];
  const betDisplayDiv = document.querySelector('.bet-spinner .input > div') ||
                        document.querySelector('.input > div');
  const minusBtn = document.querySelector('.btn.btn-game.m-0.prev');
  const plusBtn = document.querySelector('.btn.btn-game.m-0.next');
  const inputDiv = document.querySelector('.input.roboto-font-b');
  const inputBet = document.querySelector('input.bet-input-hidden');

  if (!betDisplayDiv || !minusBtn || !plusBtn || !inputDiv) {
    console.warn('Не найдены необходимые элементы');
    return;
  }

  let prevValue = betDisplayDiv.textContent.trim();

  inputDiv.setAttribute('contenteditable', 'true');
  inputDiv.style.outline = 'none';
  inputDiv.addEventListener('focus', () => {
    inputDiv.style.outline = 'none';
  });

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
        if (pos <= nextPos) {
          return { node, offset: pos - currentPos };
        }
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

  function updateHiddenInput(value) {
    if (inputBet) {
      inputBet.value = value;
      inputBet.dispatchEvent(new Event('input', { bubbles: true }));
      inputBet.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }



  inputDiv.addEventListener('blur', () => {
  let text = inputDiv.textContent.trim();
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  text = text.replace(',', '.');

  let val = parseFloat(text);
  if (isNaN(val) || val < 0.1) val = 0.1;
  else if (val > 1000000) val = 1000000;


  const formatted = val.toFixed(2);
  const caretPos = saveCaretPosition(inputDiv);

  inputDiv.textContent = formatted;
  betAmountElement.textContent = formatted;
  prevValue = formatted;

  restoreCaretPosition(inputDiv, caretPos);
});


  function getCurrentBet() {
    const text = betDisplayDiv.textContent.trim();
    let val = parseFloat(text.replace(',', '.'));
    return isNaN(val) ? 0.3 : val;
  }

  function setBet(value) {
    const fixed = value.toFixed(2);
    betDisplayDiv.textContent = fixed;
    inputDiv.textContent = fixed;
    prevValue = fixed;
    updateHiddenInput(fixed);
  }

  minusBtn.addEventListener('click', () => {
    let currentBet = getCurrentBet();
    let idx = possibleBets.findIndex(b => b >= currentBet);
    if (idx === -1) idx = possibleBets.length - 1;
    if (idx > 0) setBet(possibleBets[idx - 1]);
  });

  plusBtn.addEventListener('click', () => {
    let currentBet = getCurrentBet();
    let idx = possibleBets.findIndex(b => b > currentBet);
    if (idx === -1) idx = possibleBets.length - 1;
    if (idx < possibleBets.length) setBet(possibleBets[idx]);
  });
});
