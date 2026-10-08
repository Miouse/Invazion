/**
 * Module Configuration - Catalogue d'Améliorations et Constantes
 */
export const UPGRADE_CATALOG = [
  // --- ARMES & POUVOIRS DE ZONE ---
  {
    id: 'wand',
    type: 'weapon',
    name: 'Baguette Éthérée',
    icon: '🪄',
    tag: 'TIR RAPIDE',
    desc: 'Mitraille les ennemis avec des salves magiques continues.',
    maxLevel: 5,
    getDescription(lvl) {
      if (lvl === 0) return 'Tir magique automatique ultra-rapide (rafales continues).';
      return `Ajoute +1 projectile en éventail (jusqu'à ${lvl + 1} projectiles) et cadence augmentée.`;
    }
  },
  {
    id: 'meteor',
    type: 'weapon',
    name: 'Pluie de Météores',
    icon: '☄️',
    tag: 'ZONE DÉVASTATRICE',
    desc: 'Fait s\'abattre de gigantesques météores explosifs incinérant les hordes.',
    maxLevel: 5,
    getDescription(lvl) {
      if (lvl === 0) return 'Déclenche l\'impact de météores géants avec ondes de choc dévastatrices.';
      return `Rayon d'explosion de zone +25%, +1 météore supplémentaire et cadence accélérée.`;
    }
  },
  {
    id: 'orbit',
    type: 'weapon',
    name: 'Lames d\'Orbes Orbitaux',
    icon: '🔮',
    tag: 'ZONE CONTINUE',
    desc: 'Des orbes mystiques tournoient à toute vitesse, tranchant tout au contact.',
    maxLevel: 5,
    getDescription(lvl) {
      if (lvl === 0) return 'Invoque 2 orbes à rotation ultra-rapide autour du joueur.';
      return `Ajoute +1 orbe et augmente la vitesse de rotation et les dégâts.`;
    }
  },
  {
    id: 'aura',
    type: 'weapon',
    name: 'Vortex de Sang Arcane',
    icon: '🩸',
    tag: 'ZONE PROCHE',
    desc: 'Cercle de runes écarlates infligeant des dégâts continus à ultra-haute fréquence.',
    maxLevel: 5,
    getDescription(lvl) {
      if (lvl === 0) return 'Génère un vortex runique pulsant à ~8 ticks par seconde.';
      return `Rayon du vortex étendu de +25% et dégâts d'annihilation accrus.`;
    }
  },

  // --- PASSIFS ---
  {
    id: 'speed',
    type: 'passive',
    name: 'Bottes Célestes',
    icon: '👟',
    tag: 'PASSIF',
    desc: 'Accroît la vitesse de déplacement.',
    maxLevel: 5,
    getDescription: () => 'Vitesse de déplacement +15%.'
  },
  {
    id: 'power',
    type: 'passive',
    name: 'Cristal de Puissance',
    icon: '💎',
    tag: 'PASSIF',
    desc: 'Amplifie tous les dégâts infligés (tirs et zones).',
    maxLevel: 5,
    getDescription: () => 'Tous les dégâts d\'armes +20%.'
  },
  {
    id: 'health',
    type: 'passive',
    name: 'Cœur de Titan',
    icon: '❤️',
    tag: 'PASSIF',
    desc: 'Augmente la santé max et soigne immédiatement.',
    maxLevel: 5,
    getDescription: () => 'Santé Max +35 PV et restaure 45 PV.'
  },
  {
    id: 'magnet',
    type: 'passive',
    name: 'Aimant Mystique',
    icon: '🧲',
    tag: 'PASSIF',
    desc: 'Aspire les gemmes d\'âme de toute l\'arène.',
    maxLevel: 5,
    getDescription: () => 'Portée d\'aimant des gemmes +50%.'
  },
  {
    id: 'regen',
    type: 'passive',
    name: 'Anneau de Vitalité',
    icon: '🌿',
    tag: 'PASSIF',
    desc: 'Régénération automatique de santé.',
    maxLevel: 5,
    getDescription: () => 'Régénération passive +1.2 PV / seconde.'
  }
];

// ==========================================
// CATALOGUE DES GRIMOIRES ÉLÉMENTAIRES (ELDRIN LE MAGE)
// ==========================================
export const GRIMOIRES_CATALOG = {
  arcane: {
    id: 'arcane',
    name: 'Grimoire des Arcanes',
    element: 'arcane',
    icon: '🔮',
    color: '#00f0ff',
    badge: 'Base • Gratuit',
    price: 0,
    mainWeapon: 'arcane_bolt',
    mainName: 'Éclair d\'Arcane',
    mainDesc: 'Projectiles cosmiques rapides (860 px/s, 42 dégâts) perforant les rangs',
    specialSkill: 'arcane_nova',
    specialName: 'Nova Stellaire',
    specialDesc: 'Grande explosion cosmique à 360° repoussant tous les monstres au loin',
    specialCd: 3.8,
    desc: 'Livre des Arcanes originel offert aux mages instruits d\'Oakhaven.'
  },
  lightning: {
    id: 'lightning',
    name: 'Grimoire de Foudre',
    element: 'lightning',
    icon: '⚡',
    color: '#ffd700',
    badge: '40 🪙',
    price: 40,
    mainWeapon: 'lightning_bolt',
    mainName: 'Arc Voltaïque',
    mainDesc: 'Éclair fulgurant rebondissant en chaîne sur 3 monstres avec étincelles',
    specialSkill: 'lightning_storm',
    specialName: 'Tempête de Foudre',
    specialDesc: 'Choc foudroyant de zone (220px) étourdissant tous les monstres (1.5s)',
    specialCd: 4.2,
    desc: 'Recueil ancestral imprégné de la furie des tempêtes et d\'étincelles vives.'
  },
  frost: {
    id: 'frost',
    name: 'Grimoire de Givre',
    element: 'frost',
    icon: '❄️',
    color: '#38bdf8',
    badge: '60 🪙',
    price: 60,
    mainWeapon: 'frost_bolt',
    mainName: 'Javelot de Givre',
    mainDesc: 'Pieu de glace perforant ralentissant les monstres touchés de 50% pendant 3s',
    specialSkill: 'frost_blizzard',
    specialName: 'Blizzard Polaire',
    specialDesc: 'Vague glaciaire gelant et immobilisant tous les monstres (2.5s)',
    specialCd: 4.5,
    desc: 'Traité des glaces éternelles du Grand Nord capable de figer le sang des démons.'
  },
  fire: {
    id: 'fire',
    name: 'Grimoire des Flammes',
    element: 'fire',
    icon: '🔥',
    color: '#ff4d4d',
    badge: '90 🪙',
    price: 90,
    mainWeapon: 'fire_orb',
    mainName: 'Météore Ardent',
    mainDesc: 'Orbe ardent incandescent explosant à l\'impact en déflagration de zone (80px)',
    specialSkill: 'fire_eruption',
    specialName: 'Éruption Solaire',
    specialDesc: 'Brasier dévastateur pulvérisant et embrasant les ennemis proches (130 dmg)',
    specialCd: 4.0,
    desc: 'Pages calcinées vibrant d\'une chaleur magique inextinguible.'
  },
  wind: {
    id: 'wind',
    name: 'Grimoire du Zéphyr',
    element: 'wind',
    icon: '🍃',
    color: '#2dd4bf',
    badge: '120 🪙',
    price: 120,
    mainWeapon: 'wind_blade',
    mainName: 'Lame Zéphyr',
    mainDesc: 'Rafales de vent tranchantes à haute vélocité perçant 3 monstres en ligne',
    specialSkill: 'wind_cyclone',
    specialName: 'Typhon Ascendant',
    specialDesc: 'Vaste cyclone aspirant les monstres avant de les projeter au loin',
    specialCd: 4.0,
    desc: 'Manuscrit sylvestre dansant au gré des courants d\'air célestes.'
  }
};

