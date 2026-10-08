/**
 * Module Sprites - Gestionnaire des spritesheets héros et monstres
 * Supporte le rendu 8-directionnel et l'animation des personnages et ennemis.
 */

export const CHARACTERS = {
  warrior: {
    id: 'warrior',
    name: 'Valérian',
    title: 'Chevalier d\'Azur',
    icon: '🛡️',
    sprite: 'personnage/Puny-Characters/Warrior-Blue.png',
    hpBonus: 30,
    regenBonus: 1.2,
    speedMult: 1.0,
    dmgMult: 1.0,
    dashCdMult: 1.0,
    magnetMult: 1.0,
    startWeapon: 'wand',
    desc: '+30 PV Max • +1.2 Régénération / sec'
  },
  mage: {
    id: 'mage',
    name: 'Eldrin',
    title: 'Arcaniste Céleste',
    icon: '✨',
    sprite: 'personnage/Puny-Characters/Mage-Cyan.png',
    hpBonus: 0,
    regenBonus: 0,
    speedMult: 1.0,
    dmgMult: 1.25,
    dashCdMult: 1.0,
    magnetMult: 1.45,
    startWeapon: 'wand',
    desc: 'Dégâts des sorts +25% • Aimant +45%'
  },
  archer: {
    id: 'archer',
    name: 'Sylvia',
    title: 'Rôdeuse Sylvestre',
    icon: '🏹',
    sprite: 'personnage/Puny-Characters/Archer-Green.png',
    hpBonus: -10,
    regenBonus: 0,
    speedMult: 1.20,
    dmgMult: 1.0,
    dashCdMult: 0.65,
    magnetMult: 1.1,
    startWeapon: 'wand',
    desc: 'Vitesse +20% • Dash recharge 35% plus vite'
  },
  pyro: {
    id: 'pyro',
    name: 'Ignis',
    title: 'Pyromancien des Cendres',
    icon: '🔥',
    sprite: 'personnage/Puny-Characters/Mage-Red.png',
    hpBonus: 0,
    regenBonus: 0,
    speedMult: 1.0,
    dmgMult: 1.15,
    dashCdMult: 1.0,
    magnetMult: 1.0,
    startWeapon: 'meteor',
    desc: 'Démarre avec Pluie de Météores (Niv. 1)'
  },
  orc: {
    id: 'orc',
    name: 'Gorak',
    title: 'Berserker Pourpre',
    icon: '🪓',
    sprite: 'personnage/Puny-Characters/Warrior-Red.png',
    hpBonus: 45,
    regenBonus: 0,
    speedMult: 1.05,
    dmgMult: 1.15,
    dashCdMult: 1.0,
    magnetMult: 1.0,
    startWeapon: 'wand',
    desc: '+45 PV Max • Puissance globale +15%'
  },
  soldier: {
    id: 'soldier',
    name: 'Marcus',
    title: 'Légionnaire d\'Élite',
    icon: '⚔️',
    sprite: 'personnage/Puny-Characters/Soldier-Blue.png',
    hpBonus: 15,
    regenBonus: 0.5,
    speedMult: 1.10,
    dmgMult: 1.10,
    dashCdMult: 0.85,
    magnetMult: 1.15,
    startWeapon: 'wand',
    desc: 'Polyvalent : +15 PV, +10% Vitesse, +10% Dégâts'
  }
};

export const MONSTER_SPRITES = {
  bat: {
    name: 'Araignée Spectre',
    path: 'personnage/PunyMonsters/Purple-Spider-32x32.png',
    cols: 12,
    rows: 8,
    isSlime: false,
    drawSize: 49
  },
  skeleton: {
    name: 'Loup d\'Ombre',
    path: 'personnage/PunyMonsters/Gray-Wolf-32x32.png',
    cols: 12,
    rows: 8,
    isSlime: false,
    drawSize: 55
  },
  zombie: {
    name: 'Slime Corrompu',
    path: 'personnage/Puny-Characters/Slime.png',
    cols: 15,
    rows: 1,
    isSlime: true,
    drawSize: 53
  },
  demon: {
    name: 'Orc Berserker',
    path: 'personnage/Puny-Characters/Orc-Soldier-Red.png',
    cols: 24,
    rows: 8,
    isSlime: false,
    drawSize: 67
  }
};

class SpriteLoader {
  constructor() {
    this.images = new Map();
  }

  getImage(src) {
    if (!src) return null;
    if (!this.images.has(src)) {
      const img = new Image();
      img.src = src;
      this.images.set(src, img);
    }
    return this.images.get(src);
  }

  preloadAll() {
    for (const k in CHARACTERS) {
      this.getImage(CHARACTERS[k].sprite);
    }
    for (const k in MONSTER_SPRITES) {
      this.getImage(MONSTER_SPRITES[k].path);
    }
  }
}

export const spriteLoader = new SpriteLoader();

/**
 * Convertit un angle en radian vers la ligne 0..7 du spritesheet 8 directions
 * 0: Sud, 1: Sud-Est, 2: Est, 3: Nord-Est, 4: Nord, 5: Nord-Ouest, 6: Ouest, 7: Sud-Ouest
 */
export function getSpriteRowFromAngle(angle) {
  let a = angle;
  while (a < 0) a += Math.PI * 2;
  while (a >= Math.PI * 2) a -= Math.PI * 2;
  const sector = Math.round(a / (Math.PI / 4)) % 8;
  return (2 - sector + 8) % 8;
}
