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
