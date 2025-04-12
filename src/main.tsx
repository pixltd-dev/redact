import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { checkAndSetupDatabase } from './app/backend/api';
import { getHolderUserSettings } from './app/utils/DataHolder';
import 'react-quill/dist/quill.snow.css'; // Import Quill's default styling

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
