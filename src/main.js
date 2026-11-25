import { Game } from './core/Game.js';

const elements = {
  canvas: document.getElementById('world'),
  menu: document.getElementById('menu'),
  start: document.getElementById('start-button'),
  status: document.getElementById('load-status'),
  hud: document.getElementById('hud'),
  pause: document.getElementById('pause-screen'),
  error: document.getElementById('error-screen'),
  errorMessage: document.getElementById('error-message'),
  resume: document.getElementById('resume-button'),
  restart: document.getElementById('restart-button')
};

let game;

async function boot() {
  try {
    elements.status.textContent = 'СОЗДАНИЕ АРХИТЕКТУРЫ · МАТЕРИАЛОВ · СВЕТА';
    game = new Game(elements);
    await game.init();
    elements.status.textContent = 'ОКРУЖЕНИЕ ГОТОВО';
    elements.start.disabled = false;
    elements.start.addEventListener('click', () => {
      elements.menu.classList.add('hidden');
      elements.hud.classList.remove('hidden');
      elements.pause.classList.add('hidden');
      game.start();
    });
    elements.resume.addEventListener('click', () => {
      elements.pause.classList.add('hidden');
      game.resume();
    });
    elements.restart.addEventListener('click', () => {
      elements.pause.classList.add('hidden');
      game.restart();
    });
    window.addEventListener('keydown', event => {
      if (event.code === 'Escape' && game.running) {
        game.pause();
        elements.pause.classList.remove('hidden');
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && game.running) {
        game.pause();
        elements.pause.classList.remove('hidden');
      }
    });
  } catch (error) {
    console.error(error);
    elements.errorMessage.textContent = error?.message || 'Проверьте WebGL и подключение к интернету.';
    elements.error.classList.remove('hidden');
  }
}

boot();