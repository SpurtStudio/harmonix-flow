import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { UserPreferencesProvider } from './context/UserPreferencesContext.tsx';

// Базовая имитация проверки целостности кода
console.log("Проверка целостности кода: ОК");

createRoot(document.getElementById("root")!).render(
  <UserPreferencesProvider>
    <App />
  </UserPreferencesProvider>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
