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
- **Rôle** : Centralise tous les assets graphiques et fournit les helpers d'animation.
- **Roster Héros (`CHARACTERS`)** :
  - `warrior` (*Valérian*) : +30 PV Max, +1.2 Régén/s.
  - `mage` (*Eldrin*) : +25% dégâts sorts, +45% rayon d'aimant.
  - `archer` (*Sylvia*) : +20% vitesse de course, -35% cooldown de Dash.
  - `pyro` (*Ignis*) : Démarre d'office avec *Pluie de Météores (Niv. 1)*.
  - `orc` (*Gorak*) : +45 PV Max, +15% puissance brute.
  - `soldier` (*Marcus*) : Équilibré (+15 PV, +10% vit, +10% dmg).
- **Catalogue Monstres (`MONSTER_SPRITES`)** :
  - `bat` ➔ Araignée Spectre (`Purple-Spider-32x32.png`).
  - `skeleton` ➔ Loup d'Ombre (`Gray-Wolf-32x32.png`).
  - `zombie` ➔ Slime Corrompu (`Slime.png`).
  - `demon` ➔ Orc Berserker (`Orc-Soldier-Red.png`).
- **Mathématique 8-Directions (`getSpriteRowFromAngle(angle)`)** :
  - L'angle Canvas ($0$ à l'Est, $\pi/2$ au Sud, etc.) est converti vers la ligne de la spritesheet :
    - `Ligne 0` : Sud (face caméra)
    - `Ligne 1` : Sud-Est
    - `Ligne 2` : Est (droite)
    - `Ligne 3` : Nord-Est
    - `Ligne 4` : Nord (dos caméra)
    - `Ligne 5` : Nord-Ouest
    - `Ligne 6` : Ouest (gauche)
    - `Ligne 7` : Sud-Ouest

### 2. `js/engine.js` — Moteur de Jeu Principal
- **Dimensions de l'arène** : `7 000 × 7 000 px` (centre en `3 500, 3 500`).
- **Caméra & Zoom** : Zoom par défaut `0.45` pour une vue panoramique grand angle (ajustable à la molette).
- **Système de Vagues (Option A)** :
  - Vague active : un contingent défini de monstres émerge en continu des 4 portails cardinaux (`North`, `South`, `East`, `West`).
  - Tous monstres éliminés ➔ Passage en état `INTERMISSION` de **20 secondes de répit** avec apparition de gemmes et bouton pour passer immédiatement.
  - Boss Titanesque : Émerge toutes les 5 vagues au portail Nord.
- **Indicateurs de Menace Hors-Champ (`renderScreenEdgeIndicators`)** :
  - Calcul d'intersection rayon-rectangle avec marges asymétriques (`marginTop = 125px`, `165px` lors des boss) pour **ne jamais être masqué par le HUD supérieur** (stats et barre d'XP).
  - Rendu haute visibilité : disque sombre contrasté, cerclage néon, onde radar pulsée, chevron agrandi et capsule de texte d'orientation.
- **Système d'Amélioration Asynchrone** :
  - L'expérience et les niveaux s'accumulent dans `pendingUpgrades`. Le combat **ne s'interrompt pas** brutalement. Le joueur clique sur le bouton ⭐ ou appuie sur `U` pour ouvrir la modale à volonté.

### 3. `js/player.js` — Entité Joueur
- Instancié avec `new Player(x, y, characterId)`.
- Gère la vélocité, l'esquive Dash (invulnérabilité temporaire `invulnTimer`), la régénération passive, et les cooldowns des 4 armes/pouvoirs actifs.
- **Armes disponibles** :
  - `wand` : Baguette éthérée (rafales directes sur ennemis visibles, portée max 580 px).
  - `meteor` : Pluie de météores explosives avec secousse d'écran.
  - `orbit` : Orbes tournoyants protecteurs.
  - `aura` : Vortex de sang arcane de contact continu.

### 4. `js/enemy.js` — Monstres & Boss Colosse
- IA de meute avec répulsion dynamique pour éviter l'empilement statique de monstres.
- Rendu pixel art net avec `ctx.imageSmoothingEnabled = false`.
- Effet d'impact lumineux (*Hit Flash*) via `ctx.filter = 'brightness(3) saturate(0.2)'`.
- Rendu du Slime avec *squash & stretch* dynamique synchronisé sur les 15 frames d'animation.
- Boss Colosse : Rayon 95 px, ailes animées gigantesques, cercle runique tournoyant et attaque séquentielle de cercle de projectiles sombres.

### 5. `js/config.js` — Équilibrage & Progression
- Formule d'XP : `xpToNext = Math.floor(35 * Math.pow(1.35, level - 1))`.
- Base de gemmes : Bleue = 1 XP, Verte = 4 XP, Cœur = Soin 35 PV.

---

## 🎮 Commandes & Contrôles

| Action | Clavier / Souris |
| :--- | :--- |
| **Déplacement** | `Z`, `Q`, `S`, `D` ou `Flèches directionnelles` |
| **Dash / Esquive** | `Espace` ou `Clic Droit` |
| **Ouvrir les Améliorations** | Touche `U` ou Bouton ⭐ flottant |
| **Pause** | Touche `Échap` ou `P` |
| **Zoom Caméra** | Molette de la souris |
| **Son (Mute)** | Bouton 🔊 dans le HUD |

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
