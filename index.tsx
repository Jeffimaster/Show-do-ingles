
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(<App />);
  } catch (error: any) {
    console.error("Erro ao montar aplicação React:", error);
    const errorDisplay = document.getElementById('error-display');
    if (errorDisplay) {
      errorDisplay.style.display = 'block';
      errorDisplay.innerText = "Erro ao iniciar React: " + (error?.message || "Erro desconhecido");
    }
  }
} else {
  console.error("Erro fatal: Elemento root não encontrado.");
}
