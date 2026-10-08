# 🤖 Architecture & Guide pour IA / Développeurs — Invazion (Crimson Survivors)

> Ce fichier est conçu comme une **référence architecturale complète** pour permettre à tout assistant IA (ou développeur) ouvrant ce projet d'en comprendre instantanément la structure, les conventions, le flux d'exécution et les mécaniques clés sans avoir à analyser l'intégralité du code source.

---

## 🧭 Vue d'ensemble du Projet

- **Type de jeu** : Roguelite d'action / survie 2D en arène (style *Vampire Survivors* / *Hades*).
- **Stack technique** : 
  - **HTML5 Canvas 2D** pur (moteur custom 60 FPS, rendu matriciel sans framework lourd).
  - **JavaScript ES6 Vanilla** avec modules natifs (`import` / `export`).
  - **CSS3 Vanilla** moderne (glassmorphism, variables CSS, HUD responsive).
  - **Node.js** : Serveur statique ultra-léger (`server.js`, port `3000`, 0 dépendance npm requise).
- **Philosophie** : Zéro bundler (pas de Webpack/Vite/Babel), zéro dépendance externe, modification directe et exécution instantanée dans le navigateur.

---

## 📁 Arborescence des Fichiers

```text
Invazion/
├── AGENTS.md               # Ce fichier : guide et mémoire architecturale pour IA/devs
├── README.md               # Documentation publique et guide joueur
├── index.html              # Point d'entrée HTML, HUD, modales (démarrage, montée de niveau, pause, game over)
├── style.css               # Design system : styles du HUD, modales sombres néon, grille des héros
├── server.js               # Serveur HTTP local Node.js (port 3000)
├── favicon.png             # Icône du jeu
│
├── js/
│   ├── main.js             # Initialisation de l'application (instancie GameEngine sur DOMContentLoaded)
│   ├── engine.js           # Moteur central : boucle 60 FPS, caméra, vagues, portails, HUD, collisions, clamping
│   ├── world.js            # Générateur de monde RPG ouvert & moteur de collisions physiques (grille spatiale, glissement, ponts, rivière, maisons)
│   ├── player.js           # Entité Joueur : contrôles, dash, orientation 8-dir, armes, gestion XP/PV
│   ├── enemy.js            # Entité Monstre & Boss : IA de poursuite, séparation, animations de sprites, colosse Souls
│   ├── sprites.js          # Registre des héros (stats/bonus), catalogue de monstres, cache d'images et maths 8-directions
│   ├── entities.js         # Entités secondaires : Projectile, Gem (XP & cœurs), Particle, Shockwave, FloatingText
│   ├── controls.js         # Gestionnaire des contrôles (Clavier ZQSD, Souris style LoL, Manette Gamepad 360°, Joystick tactile, Modale réglages)
│   ├── config.js           # Catalogue des améliorations (armes et passifs), paliers et niveaux max
│   └── audio.js            # Moteur sonore procédural (Web Audio API synthétique, 0 fichier audio externe)
│
└── personnage/
    ├── Puny-Characters/    # Spritesheets héros & orcs (768x256 px : 24 colonnes x 8 lignes de 32x32 px)
    │   ├── Warrior-Blue.png, Mage-Cyan.png, Archer-Green.png, Mage-Red.png, Warrior-Red.png, Soldier-Blue.png...
    │   ├── Slime.png       # Spritesheet slime (480x32 px : 15 colonnes x 1 ligne)
    │   └── Environment/    # Décors & textures de sol
    └── PunyMonsters/       # Spritesheets monstres (384x256 px : 12 colonnes x 8 lignes de 32x32 px)
        ├── Purple-Spider-32x32.png, Gray-Wolf-32x32.png, Brown-Boar-32x32.png...
```

---

## 🏛️ Architecture & Responsabilités des Modules

### 1. `js/sprites.js` — Registre & Moteur 8-Directions
- **Rôle** : Centralise tous les assets graphiques et fournit les configurations d'armes médiévales des classes.
- **Roster Héros & Armes Dédiées (`CHARACTERS`) — Option A** :
  - `warrior` (*Valérian*) : ⚔️ Combo d'Épée 3 coups (Entaille D ➔ Entaille G ➔ Estoc puissant perçant) + 🌪️ Tourbillon d'Acier à 360°.
  - `soldier` (*Marcus*) : 🗡️ Combo de Lance 3 temps (Estoc 1 ➔ Estoc 2 ➔ Balayage d'hast 180°) + ⚡ Charge Transperçante (ruée empalante 230 px).
  - `archer` (*Sylvia*) : 🏹 Arc Sylvestre (flèches véloces) + 🏹 Volée de 5 Flèches en éventail.
  - `mage` (*Eldrin*) : 🔮 Éclair d'Arcane (projectiles énergétiques) + 💫 Nova Stellaire à 360°.
  - `pyro` (*Ignis*) : 🔥 Boule de Feu (projectiles incendiaires explosifs) + 🌊 Vague de Flammes.
  - `orc` (*Gorak*) : 🪓 Fendoir Barbare Lourd (fendage de zone puissant) + 💥 Séisme Terrestre avec étourdissement.
- **Catalogue Monstres (`MONSTER_SPRITES`)** :
  - `bat` ➔ Araignée Spectre (`Purple-Spider-32x32.png`).
  - `skeleton` ➔ Loup d'Ombre (`Gray-Wolf-32x32.png`).
  - `zombie` ➔ Slime Corrompu (`Slime.png`).
  - `demon` ➔ Orc Berserker (`Orc-Soldier-Red.png`).

### 2. `js/engine.js` — Moteur de Jeu Principal & Barre d'Action
- **Dimensions de l'arène** : `7 000 × 7 000 px` (Départ au centre d'Oakhaven en `3 160, 3 540`).
- **Caméra & Zoom** : Échelle fixe verrouillée à `0.85` pour une vue rapprochée et immersive.
- **Économie & Butins Médiévaux** :
  - Les monstres et coffres lâchent des Pièces d'Or médiévales (🪙) et des Cœurs de Soin (❤️).
  - Fin de l'ancien système d'XP passive et des modales interrompant le jeu.
- **Barre d'Action Combat (`combat-action-bar`)** :
  - Slot 1 : Attaque Principale (recharge rapide).
  - Slot 2 : Compétence Spéciale (décompte secondes et overlay cooldown).
  - Slot 3 : Dash d'Esquive (jauge de recharge).

### 3. `js/world.js` — Générateur de Monde RPG Médiéval & Pathfinding A*
- **Monde ouvert 7 000 × 7 000 px** :
  - **3 Cités Médiévales & Donjons** :
    1. **Oakhaven** (Centre/Sud) : Bâtiments à pans de bois, place fortifiée, fontaine sacrée et entrée du *Donjon I : Crypte d'Oakhaven*.
    2. **Val-des-Ombres** (Nord-Ouest) : Citadelle gothique sur falaises sombres, braseros et entrée du *Donjon III : Bastion Démoniaque*.
    3. **Riverbend** (Sud-Est) : Cité lacustre sur pilotis, grands pontons, barques et entrée du *Donjon II : Antre des Eaux Sombres*.
  - **Forêts Denses Médiévales & Traversée Libre** : 14 massifs forestiers majeurs (> 1 350 arbres). Semi-transparence automatique (50% d'opacité) sous les feuillages.
  - **Collisions physiques** : Grille spatiale (buckets de 250 px), glissement tangentiel et Pathfinding A*.

### 4. `js/controls.js` — Gestionnaire des Contrôles (`ControlsManager`)
- **3 modes commutables** :
  - `keyboard` : ZQSD déplacement, Clic Gauche Attaque, Touche E ou Clic Droit Compétence, Espace Dash.
  - `mouse_lol` : Clic Droit déplacement (style MOBA / LoL avec A*), Clic Gauche Attaque, Touche E Compétence, Espace Dash.
  - `gamepad` : Stick analogique 360°, RT/X Attaque, LT/B Compétence, A Dash.

### 5. `js/player.js` — Entité Joueur & Compétences Actives
- Instancié avec `new Player(x, y, characterId)`.
- Gère `triggerMainAttack`, `triggerSpecialSkill`, `triggerDash`.
- Calculs de zone en cône (`hitConeEnemies`), ligne (`hitLineEnemies`) et rayon (`hitRadialEnemies`), effets visuels de coups et parade de bouclier (-60% dégâts).

---

## 🎮 Commandes & Contrôles

| Action | Clavier / Souris | Souris (Mode LoL) | Manette (Gamepad) |
| :--- | :--- | :--- | :--- |
| **Déplacement** | `Z`, `Q`, `S`, `D` / Flèches | `Clic Droit` au sol (A*) | Stick Gauche 360° |
| **Attaque Principale** | `Clic Gauche` | `Clic Gauche` | Gâchette RT / Bouton X |
| **Compétence Spéciale** | `Touche E` ou `Clic Droit` | `Touche E` | Gâchette LT / Bouton B |
| **Dash / Esquive** | `Espace` | `Espace` | Bouton A |
| **Pause** | Touche `Échap` ou `P` | `Échap` / `P` | Bouton Start |
| **Son (Mute)** | Bouton 🔊 dans le HUD | Bouton 🔊 | — |

---

## 🛠️ Guide de Maintenance & Bonnes Pratiques

1. **Rendu Pixel-Art** :
   - Toujours conserver `ctx.imageSmoothingEnabled = false` lors du tracé de sprites 32x32 pour préserver la netteté rétro.
2. **Performance 60 FPS** :
   - Ne pas utiliser de `ctx.shadowBlur` élevé sur des dizaines d'entités simultanées (privilégier les cercles à gradient alpha ou contours nets).
   - Utiliser des calculs de distance au carré (`dx*dx + dy*dy`) avant les `Math.hypot` / `Math.sqrt`.
3. **Z-Index et HUD** :
   - Le Canvas occupe tout l'écran en arrière-plan (`z-index: 1`).
   - Le HUD interactif est en overlay (`z-index: 10` à `30`) avec `pointer-events: none` sur les conteneurs et `pointer-events: auto` sur les boutons/cartes.
4. **Git & Déploiement** :
   - Toujours vérifier la syntaxe via `node --check <fichier>` avant de commiter.
   - Dépôt distant configuré sur `origin/main` (`https://github.com/Miouse/Invazion.git`).
