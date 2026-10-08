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
    hpBonus: 40,
    regenBonus: 1.5,
    speedMult: 1.0,
    dmgMult: 1.0,
    dashCdMult: 1.0,
    mainWeapon: 'sword',
    mainName: 'Combo d\'Épée',
    mainDesc: 'Combo 3 coups : Entaille droite -> Entaille gauche -> Estoc perforant',
    specialSkill: 'whirlwind',
    specialName: 'Tourbillon d\'Acier',
    specialDesc: 'Attaque tournoyante à 360° fauchant tous les ennemis alentour',
    specialCd: 3.8,
    desc: '⚔️ Combo 3 coups tranchants • 🌪️ Tourbillon d\'Acier à 360°'
  },
  soldier: {
    id: 'soldier',
    name: 'Marcus',
    title: 'Lancier de la Garde',
    icon: '⚔️',
    sprite: 'personnage/Puny-Characters/Soldier-Blue.png',
    hpBonus: 20,
    regenBonus: 0.6,
    speedMult: 1.10,
    dmgMult: 1.10,
    dashCdMult: 0.85,
    mainWeapon: 'spear',
    mainName: 'Pique d\'Hast',
    mainDesc: 'Estoc perforant longue allonge (traverse tous les ennemis)',
    specialSkill: 'spear_charge',
    specialName: 'Charge de Lance',
    specialDesc: 'Ruée fulgurante vers l\'avant empalant les ennemis',
    specialCd: 3.6,
    desc: '🗡️ Estoc de lance à longue portée • ⚡ Ruée perforante vers l\'avant'
  },
  archer: {
    id: 'archer',
    name: 'Sylvia',
    title: 'Rôdeuse Sylvestre',
    icon: '🏹',
    sprite: 'personnage/Puny-Characters/Archer-Green.png',
    hpBonus: -10,
    regenBonus: 0,
    speedMult: 1.22,
    dmgMult: 1.0,
    dashCdMult: 0.65,
    mainWeapon: 'bow',
    mainName: 'Arc Long',
    mainDesc: 'Tir de flèches véloces et précises en ligne droite',
    specialSkill: 'multishot',
    specialName: 'Volée de 5 Flèches',
    specialDesc: 'Tir en éventail destructeur fauchant les meutes',
    specialCd: 2.8,
    desc: '🏹 Tirs de flèches précis à distance • 🌪️ Volée de 5 flèches en éventail'
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
    mainWeapon: 'arcane_bolt',
    mainName: 'Éclair d\'Arcane',
    mainDesc: 'Orbes mystiques scintillants tirés vers le curseur',
    specialSkill: 'arcane_nova',
    specialName: 'Nova Stellaire',
    specialDesc: 'Grande explosion cosmique à 360° repoussant tous les monstres',
    specialCd: 4.0,
    desc: '🔮 Projectiles arcaniques magiques • 💫 Nova répulsive à 360°'
  },
  pyro: {
    id: 'pyro',
    name: 'Ignis',
    title: 'Pyromancien des Cendres',
    icon: '🔥',
    sprite: 'personnage/Puny-Characters/Mage-Red.png',
    hpBonus: 0,
    regenBonus: 0,
    speedMult: 1.02,
    dmgMult: 1.18,
    dashCdMult: 1.0,
    mainWeapon: 'fireball',
    mainName: 'Boule de Feu',
    mainDesc: 'Projectile explosif infligeant des dégâts de zone',
    specialSkill: 'flame_wave',
    specialName: 'Vague Incendiaire',
    specialDesc: 'Mur de braises embrasant et brûlant tous les monstres devant',
    specialCd: 3.8,
    desc: '🔥 Boules de feu explosives • 🌋 Vague de braises et mur de flammes'
  },
  orc: {
    id: 'orc',
    name: 'Gorak',
    title: 'Berserker Pourpre',
    icon: '🪓',
    sprite: 'personnage/Puny-Characters/Warrior-Red.png',
    hpBonus: 50,
    regenBonus: 0,
    speedMult: 1.05,
    dmgMult: 1.25,
    dashCdMult: 1.0,
    mainWeapon: 'greatsword',
    mainName: 'Fendoir Barbare',
    mainDesc: 'Gigantesque fendoir lourd fendant les rangs au corps-à-corps',
    specialSkill: 'ground_slam',
    specialName: 'Séisme Terrestre',
    specialDesc: 'Frappe lourde au sol fissurant la terre et étourdissant les monstres',
    specialCd: 4.2,
    desc: '🪓 Fendoir lourd dévastateur • 💥 Séisme tellurique étourdissant'
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
