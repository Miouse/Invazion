# ⚔️ Invazion — Crimson Arena (Mini Survivors)

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/API/Canvas_API)
[![Node.js](https://img.shields.io/badge/Node.js-Serveur_Léger-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Un mini jeu de survie et d'arène **Roguelite 2D** nerveux et dynamique, développé en **HTML5 Canvas** et **JavaScript vanilla**, inspiré de classiques tels que *Vampire Survivors*.

Affrontez des vagues de monstres incessantes, récoltez des gemmes d'âme, montez de niveau et combinez des synergies d'armes et de passifs dévastateurs pour terrasser d'immenses titans !

---

## 🎮 Fonctionnalités du Jeu

- ⚡ **Gameplay Roguelite Intense** : Survie contre des hordes d'ennemis dont la difficulté, la vitesse et les points de vie augmentent avec le temps.
- 🪄 **Attaques & Sorts Automatiques** : Concentrez-vous sur le placement, l'esquive et le dash.
- 💨 **Dash d'Urgence** : Jauge de dash rechargeable pour vous extirper des encerclements critiques.
- 🔮 **Système de Montée de Niveau (Level Up)** : Choix parmi 3 cartes d'améliorations tirées aléatoirement à chaque palier.
- 👹 **Combats de Boss Épiques** : Titans colossaux avec barre de vie dédiée style *Dark Souls / Elden Ring*.
- 🔊 **Moteur Audio Procédural** : Synthèse sonore intégrée via la **Web Audio API** (aucun fichier audio lourd à charger).
- 📱 **Compatible Desktop & Mobile** : Détection tactile automatique avec joystick virtuel et interface responsive.

---

## 🕹️ Commandes & Contrôles

| Action | Clavier / Souris | Écran Tactile (Mobile) |
| :--- | :--- | :--- |
| **Se déplacer** | `Z`, `Q`, `S`, `D` ou `Flèches directionnelles` | Joystick virtuel à l'écran |
| **Dash / Esquive** | `Espace` ou `Clic Droit` | Bouton / geste de dash |
| **Attaques** | Automatiques | Automatiques |
| **Pause** | Touche `Échap` ou bouton ⏸️ | Bouton ⏸️ |
| **Zoom / Dézoom caméra** | Molette de la souris (Scroll) | — |
| **Son (Mute/Unmute)** | Bouton 🔊 | Bouton 🔊 |

---

## 🔮 Grimoire des Armes & Passifs

### ⚔️ Armes & Sorts de Zone

| Icône | Nom | Type | Description |
| :---: | :--- | :--- | :--- |
| 🪄 | **Baguette Éthérée** | Tir rapide | Mitraille les cibles les plus proches en rafales continues. Chaque niveau ajoute des projectiles en éventail. |
| ☄️ | **Pluie de Météores** | Explosion de zone | Fait pleuvoir d'immenses météores avec ondes de choc dévastatrices. |
| 🔮 | **Orbes Orbitaux** | Zone continue | Invoque des orbes mystiques tourbillonnant à grande vitesse autour du héros. |
| 🩸 | **Vortex Écarlate** | Aura rapprochée | Rune de sang infligeant des dégâts ultra-haute fréquence à tous les ennemis au corps-à-corps. |

### 💎 Passifs & Reliques

| Icône | Nom | Effet |
| :---: | :--- | :--- |
| 👟 | **Bottes Célestes** | Augmente la vitesse de déplacement (+15% par niveau). |
| 💎 | **Cristal de Puissance** | Augmente tous les dégâts d'armes et de sorts (+20% par niveau). |
| ❤️ | **Cœur de Titan** | Augmente la santé maximale (+35 PV) et soigne immédiatement. |
| 🧲 | **Aimant Mystique** | Élargit le rayon d'attraction des gemmes d'expérience (+50% par niveau). |
| 🌿 | **Anneau de Vitalité** | Régénère passivement la vie chaque seconde (+1.2 PV/s par niveau). |

---

## 👾 Bestiaire des Ennemis

| Ennemi | Comportement |
| :--- | :--- |
| 🦇 **Chauve-souris** | Rapide et agile, arrive souvent en essaim pour surprendre le joueur. |
| 💀 **Squelette** | Combattant régulier au déplacement modéré. |
| 🧟 **Zombie** | Lent mais très résistant, bloque les passages étroits. |
| 😈 **Démon** | Puissant, rapide et dangereux en fin de partie. |
| 👹 **Boss Colossal** | Titan géant doté d'une énorme réserve de PV, inflige de lourds dégâts au contact. |

---

## 🚀 Installation & Lancement

Le projet est léger et ne nécessite **aucune installation complexe ni dépendances tierces**.

### Option 1 : Via Node.js (Recommandé)

```bash
# 1. Cloner le dépôt
git clone https://github.com/Miouse/Invazion.git
cd Invazion

# 2. Démarrer le serveur HTTP local
npm start
```
Puis ouvrez votre navigateur sur [http://localhost:3000](http://localhost:3000).

### Option 2 : Lancement Direct / Serveur Statique

Vous pouvez également lancer le projet avec n'importe quel serveur statique local :
- **VS Code** : Utiliser l'extension *Live Server* sur `index.html`.
- **Python** : `python -m http.server 8080`
- **PHP** : `php -S localhost:8080`

*(Note : L'utilisation d'un serveur local est recommandée en raison de l'utilisation des modules ES6 `type="module"`).*

---

## 📁 Structure du Projet

```text
Invazion/
├── index.html        # Structure de l'interface, HUD et fenêtres modales
├── style.css         # Thème sombre, effets glassmorphism, animations HUD
├── server.js         # Serveur Node.js minimaliste (sans framework)
├── package.json      # Métadonnées et script de démarrage
├── favicon.png       # Icône du jeu
└── js/
    ├── main.js       # Point d'entrée de l'application
    ├── engine.js     # Boucle de jeu, boucle de rendu Canvas et gestion de l'état
    ├── player.js     # Classe du joueur, mécaniques d'armes, stats et dash
    ├── enemy.js      # Logique de spawn, IA et comportements des monstres
    ├── entities.js   # Projectiles, gemmes d'XP, particules et effets visuels
    ├── audio.js      # Synthèse audio dynamique (Web Audio API)
    └── config.js     # Configuration des armes, passifs et paramètres du jeu
```

---

## 🛠️ Technologies Utilisées

- **HTML5 Canvas 2D** : Moteur de rendu haute performance.
- **JavaScript (ES Modules)** : Architecture modulaire propre, sans bundler lourd.
- **Vanilla CSS** : Design soigné avec glassmorphism, dégradés dynamiques et typographies Google Fonts (*Outfit*, *Rajdhani*).
- **Web Audio API** : Synthèse d'ondes sonores (square, sine, sawtooth) en temps réel.

---

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE). Vous êtes libre de l'utiliser, le modifier et le distribuer.
