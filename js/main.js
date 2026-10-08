/**
 * Point d'Entrée Principal - Crimson Survivors
 * Initialise le moteur et les systèmes du jeu.
 */
import { GameEngine } from './engine.js';

window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameEngine();
});
