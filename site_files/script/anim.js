/**
 *
 * @param {NodeList|Array} cells
 * @param {Set<number>} openedIndices
 * @param {Set<number>} minesIndices
 * @param {Set<number>} winsIndices
 * @param {HTMLElement} betButton
 * @param {function} onComplete
 */
function animateCashOut(cells, openedIndices, minesIndices, winsIndices, betButton, onComplete) {
  if (!cells || !betButton) return;

  betButton.disabled = true;
  betButton.style.cursor = 'not-allowed';

  cells.forEach((cell, idx) => {
    if (!openedIndices.has(idx)) {
      cell.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
      cell.style.transformOrigin = 'center center';
      cell.style.transform = 'scaleX(0)';
      cell.style.opacity = '0';
    }
  });

  setTimeout(() => {

cells.forEach((cell, idx) => {
  if (!openedIndices.has(idx)) {
    cell.classList.remove('mine-shown', 'win-shown', 'mines-active');
    if (minesIndices.has(idx)) {
      cell.classList.add('mine-shown');
      console.log(`cell ${idx} — mine-shown added`);
    } else if (winsIndices.has(idx)) {
      cell.classList.add('win-shown');
      console.log(`cell ${idx} — win-shown added`)
    }
  }
});

    cells.forEach((cell, idx) => {
      if (!openedIndices.has(idx)) {
        void cell.offsetWidth;
        cell.style.transform = 'scaleX(1)';
        cell.style.opacity = '1';
      }
    });

    setTimeout(() => {

      cells.forEach(cell => {
        cell.style.transform = '';
        cell.style.transition = '';
        cell.style.opacity = '';
      });

      setTimeout(() => {
        betButton.disabled = false;
        betButton.style.cursor = 'pointer';
        if (typeof onComplete === 'function') onComplete();
      }, 1000);

    }, 500);
  }, 300);
}
