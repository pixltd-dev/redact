import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { checkAndSetupDatabase } from './app/backend/api';
import { getUserSettings } from './app/utils/DataHolder';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

function onFirstStart() {
  const isFirstStart = localStorage.getItem('isFirstStart') === null;

  if (isFirstStart) {
    checkAndSetupDatabase();
    console.log('Welcome! This is the first start of the app.');
    localStorage.setItem('isFirstStart', 'false');
  }
}

onFirstStart();

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
