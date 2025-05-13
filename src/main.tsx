import { StrictMode } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { checkAndSetupDatabase } from './app/backend/api';
import 'react-quill/dist/quill.snow.css'; // Import Quill's default styling
import { AppDataProvider, useAppData } from './app/utils/AppDataContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

async function onFirstStart() {
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
    <Router>
    <AppDataProvider>
      <App />
    </AppDataProvider>
    </Router>
  </StrictMode>
);
