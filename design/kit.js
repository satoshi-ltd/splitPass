(() => {
  const KEY = 'splitpass-design-theme';
  const root = document.documentElement;

  const readStored = () => {
    try {
      const value = localStorage.getItem(KEY);
      return value === 'dark' || value === 'light' ? value : null;
    } catch {
      return null;
    }
  };

  const writeStored = (theme) => {
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      return;
    }
  };

  const preferred = () => readStored() || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const fillTokens = () => {
    document.querySelectorAll('[data-token]').forEach((element) => {
      const name = element.dataset.token;
      const value = getComputedStyle(element).getPropertyValue(name).trim();
      const chip = element.querySelector('i');
      const code = element.querySelector('code');
      if (chip) chip.style.background = `var(${name})`;
      if (code) code.textContent = value || 'unset';
    });
  };

  const paintButtons = (theme) => {
    document.querySelectorAll('[data-kit-theme]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.kitTheme === theme));
    });
  };

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    paintButtons(theme);
    fillTokens();
  };

  root.dataset.theme = preferred();

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-kit-theme]');
    if (!button) return;
    writeStored(button.dataset.kitTheme);
    setTheme(button.dataset.kitTheme);
  });

  const ready = () => setTheme(root.dataset.theme);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
