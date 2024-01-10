import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

document.querySelectorAll('input[type="password"]').forEach((passwordField) => {
  const root = document.createElement('div');
  root.id = 'qr-vault-root';
  document.body.appendChild(root);

  const rootDiv = ReactDOM.createRoot(root);
  rootDiv.render(
    <React.StrictMode>
      <App passwordField={passwordField} />
    </React.StrictMode>,
  );
});
