/**
 * Point d'Entrée Principal - Crimson Survivors
 * Initialise le moteur et les systèmes du jeu en toute circonstance.
 */
import { GameEngine } from './engine.js';

function initGame() {
  if (!window.game) {
    window.game = new GameEngine();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
