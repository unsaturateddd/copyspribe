window.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');

  const isMobile = window.innerWidth <= 768;
  grid.classList.add(isMobile ? 'mobile' : 'desktop');
  grid.classList.remove(isMobile ? 'desktop' : 'mobile');

  grid.innerHTML = '';

  for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell', 'mines-default');


    grid.appendChild(cell);
  }

});


function getBrowserZoom() {
  return window.outerWidth / window.innerWidth;
}

function replaceMinesImages() {
  const cells = document.querySelectorAll('.cell.mines-default');
  cells.forEach(cell => {
    cell.classList.remove('mines-default');
    cell.classList.add('mines-active');
  });
}
