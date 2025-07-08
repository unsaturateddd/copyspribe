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
      const selectedValue = e.target.textContent.trim();
      const labelSpan = button.querySelector('.centered-xy');
      if (labelSpan) {
        labelSpan.firstChild.textContent = `Mines: ${selectedValue} `;
      } else {
        button.textContent = `Mines: ${selectedValue}`;
      }
      dropdownMenu.classList.remove('show');
    }
  });
});

document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-list-number.show').forEach(menu => {
    menu.classList.remove('show');
  });
});
