import React from 'react';
import ReactDOM from 'react-dom';
import { AlertProvider } from 'context/AlertContext';
import { SettingsProvider } from './context/SettingsContext';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <SettingsProvider>
      <AlertProvider>
        <App />
      </AlertProvider>
    </SettingsProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
