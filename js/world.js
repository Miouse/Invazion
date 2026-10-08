/**
 * Module Monde & Carte - WorldMap
 * Génère et rend un vaste monde RPG ouvert (7 000 x 7 000 px) :
 * - Plaines verdoyantes avec textures pixel-art (Grass1, Grass2, Dirt, Tree)
 * - Rivière sinueuse avec eau animée et ponts en bois praticables
 * - Chemins de terre battue reliant les zones
 * - 3 villages et campements distincts (Oakhaven, Camp des Éclaireurs, Riverbend)
 * - Bâtiments, manoir, tentes, feux de camp, puits, étals, pontons
 * - Forêts denses d'arbres pixel-art, pommiers et souches
 * - Falaises et plateaux rocheux en relief
 * - Frustum culling ultra-optimisé pour 60-120 FPS
 */

export class WorldMap {
  constructor(worldSize = 7000) {
    this.worldSize = worldSize;

    // Chargement des textures d'environnement pixel-art
    this.textures = {
      grass1: this.loadImg('personnage/Puny-Characters/Environment/Grass1.png'),
      grass2: this.loadImg('personnage/Puny-Characters/Environment/Grass2.png'),
      dirt:   this.loadImg('personnage/Puny-Characters/Environment/Dirt.png'),
      tree:   this.loadImg('personnage/Puny-Characters/Environment/Tree.png')
    };

    // 1. Initialisation des 3 cités médiévales, donjons et fontaines
    this.initVillages();

    // 2. Tracé de la rivière sinueuse et des ponts
    this.initRiverAndBridges();

    // 3. Réseau de chemins et routes de terre médiévales
    this.initRoads();

    // 4. Falaises et plateaux rocheux
    this.initCliffs();

    // 5. Camps de monstres avec zones d'aggro
    this.initMonsterCamps();

    // État d'exploration intérieure (maisons)
    this.interiorChestOpened = false;

    // 6. Coffres au trésor dissimulés & Sanctuaires runiques
    this.initChests();
    this.initShrines();

    // 7. Génération de vastes forêts médiévales très denses
    this.initTreesAndFoliage();

    // 8. Accessoires, panneaux, ruines et feux de camp
    this.initPropsAndDecor();

    // 9. Initialisation du moteur de collisions physiques
    this.initColliders();
    this.buildSpatialGrid();

    // 10. Grille de navigation pour Pathfinding A* (franchissement automatique des ponts)
    this.initNavGrid();
  }

  loadImg(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  // ==========================================
  // 1. LES 3 VILLAGES DISTINCTS
  // ==========================================
  // 1. LES 3 CÍTÉS MÉDIÉVALES DISTINCTES AVEC DONJONS & SAFE ZONES
  // ==========================================
  initVillages() {
    this.villages = [
      {
        id: 'oakhaven',
        name: "Cité d'Oakhaven",
        subtitle: "Cité centrale aux toits d'émeraude • Zone Sûre",
        x: 3200,
        y: 3500,
        radius: 540,
        safeZone: true,
        fountain: { x: 3160, y: 3510, radius: 150, healPerSec: 16 },
        dungeonEntrance: {
          x: 3040,
          y: 3380,
          id: 'dungeon_oakhaven',
          name: "Crypte d'Oakhaven",
          sub: "Donjon I • Catacombes Oubliées",
          icon: "🏛️",
          color: "#2ec4b6"
        },
        buildings: [
          // Grand Manoir / Château central fortifié
          { type: 'castle', x: 3150, y: 3380, w: 140, h: 105, roofColor: '#1b7a6f', trim: '#2ec4b6' },
          // Maisons médiévales avec toits turquoise / émeraude
          { type: 'house', x: 2980, y: 3450, w: 76, h: 64, roofColor: '#2a9d8f' },
          { type: 'house', x: 2990, y: 3560, w: 82, h: 68, roofColor: '#264653' },
          { type: 'house', x: 3340, y: 3450, w: 78, h: 65, roofColor: '#2a9d8f' },
          { type: 'house', x: 3330, y: 3570, w: 84, h: 68, roofColor: '#1f6e65' },
          { type: 'house', x: 3160, y: 3640, w: 75, h: 62, roofColor: '#2a9d8f' },
          // Bibliothèque des Arcanes & PNJ Archimage Kaelen
          { type: 'library', x: 3260, y: 3430, w: 90, h: 74, roofColor: '#5c3d8d', trim: '#a855f7', name: "Bibliothèque des Arcanes" },
          { type: 'library_npc', x: 3260, y: 3490, name: "Archimage Kaelen", title: "Maître des Grimoires", radius: 16 },
          // Fontaine sacrée de soin sur la place centrale
          { type: 'fountain', x: 3160, y: 3510, radius: 24 },
          // Étalages de marché médiéval
          { type: 'stall', x: 3080, y: 3510, w: 38, h: 26, color: '#e76f51' },
          { type: 'stall', x: 3240, y: 3510, w: 38, h: 26, color: '#f4a261' }
        ]
      },
      {
        id: 'val_des_ombres',
        name: "Forteresse de Val-des-Ombres",
        subtitle: "Citadelle de pierre et ruines du Nord • Zone Sûre",
        x: 2100,
        y: 1700,
        radius: 520,
        safeZone: true,
        fountain: { x: 2100, y: 1700, radius: 140, healPerSec: 16 },
        dungeonEntrance: {
          x: 2100,
          y: 1480,
          id: 'dungeon_val',
          name: "Bastion Démoniaque",
          sub: "Donjon III • Citadelle Infernale",
          icon: "🏰",
          color: "#e74c3c"
        },
        buildings: [
          // Tour de guet et manoir de pierre sombre
          { type: 'castle', x: 2100, y: 1580, w: 130, h: 100, roofColor: '#3a3a4a', trim: '#e74c3c' },
          // Bâtiments de pierre fortifiée
          { type: 'house', x: 1960, y: 1680, w: 80, h: 66, roofColor: '#2c2c38' },
          { type: 'house', x: 2240, y: 1680, w: 80, h: 66, roofColor: '#2c2c38' },
          { type: 'house', x: 2000, y: 1800, w: 76, h: 62, roofColor: '#434354' },
          { type: 'house', x: 2200, y: 1800, w: 76, h: 62, roofColor: '#434354' },
          // Fontaine d'obsidienne consacrée
          { type: 'fountain', x: 2100, y: 1700, radius: 24, dark: true },
          // Braseros et tentes de garnison
          { type: 'tent', x: 1900, y: 1780, w: 52, h: 46, color: '#8d0801', accent: '#370617' },
          { type: 'campfire', x: 2020, y: 1730, radius: 18 },
          { type: 'campfire', x: 2180, y: 1730, radius: 18 }
        ]
      },
      {
        id: 'riverbend',
        name: "Bourgade de Riverbend",
        subtitle: "Cité lacustre au bord de l'eau • Zone Sûre",
        x: 4650,
        y: 4900,
        radius: 500,
        safeZone: true,
        fountain: { x: 4650, y: 4900, radius: 140, healPerSec: 16 },
        dungeonEntrance: {
          x: 4800,
          y: 4720,
          id: 'dungeon_riverbend',
          name: "Antre des Eaux Sombres",
          sub: "Donjon II • Cavernes Inondées",
          icon: "🌊",
          color: "#00b4d8"
        },
        buildings: [
          // Huttes et maisons de pêcheurs sur pilotis
          { type: 'house', x: 4500, y: 4820, w: 74, h: 62, roofColor: '#2a9d8f' },
          { type: 'house', x: 4620, y: 4800, w: 80, h: 66, roofColor: '#264653' },
          { type: 'house', x: 4740, y: 4830, w: 72, h: 60, roofColor: '#1b7a6f' },
          // Tentes de marins et pêcheurs
          { type: 'tent', x: 4520, y: 4980, w: 48, h: 44, color: '#52b788', accent: '#2d6a4f' },
          { type: 'tent', x: 4750, y: 4980, w: 48, h: 44, color: '#52b788', accent: '#2d6a4f' },
          // Fontaine d'eau bénie
          { type: 'fountain', x: 4650, y: 4900, radius: 22, water: true },
          // Pontons de bois avançant vers la rivière
          { type: 'pier', x: 4410, y: 4870, w: 60, h: 22 },
          { type: 'pier', x: 4430, y: 4960, w: 55, h: 22 },
          { type: 'campfire', x: 4570, y: 4930, radius: 18 }
        ]
      }
    ];
  }

  // ==========================================
  // 2. RIVIÈRE SINUEUSE & PONTS
  // ==========================================
  initRiverAndBridges() {
    // Points de contrôle de la grande rivière serpentant du Nord-Est au Sud-Ouest
    this.riverPoints = [
      { x: 5900, y: 0 },
      { x: 5600, y: 800 },
      { x: 5100, y: 1500 },
      { x: 4950, y: 2200 },
      { x: 4750, y: 2700 },
      { x: 4350, y: 3100 },
      { x: 3750, y: 3150 },
      { x: 3100, y: 3200 },
      { x: 2500, y: 3450 },
      { x: 1950, y: 3950 },
      { x: 1450, y: 4700 },
      { x: 1100, y: 5500 },
      { x: 750,  y: 6300 },
      { x: 400,  y: 7000 }
    ];

    // Échantillonnage de la rivière en segments denses pour un tracé fluide
    this.riverSegments = [];
    const width = 140; // Largeur de la rivière
    for (let i = 0; i < this.riverPoints.length - 1; i++) {
      const p0 = this.riverPoints[i];
      const p1 = this.riverPoints[i + 1];
      const steps = 12;
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const x = p0.x + (p1.x - p0.x) * t;
        const y = p0.y + (p1.y - p0.y) * t;
        this.riverSegments.push({ x, y, width });
      }
    }

    // 2 Ponts de bois traversant la rivière (orientés perpendiculairement au flux de l'eau)
    this.bridges = [
      // Pont 1 : Central (relie Oakhaven et le Camp des Éclaireurs, traverse la rivière d'un bord à l'autre)
      {
        x: 3750,
        y: 3150,
        w: 190,
        h: 84,
        angle: 1.49, // Perpendiculaire au lit horizontal de la rivière (~85.4°)
        name: "Pont d'Oakhaven"
      },
      // Pont 2 : Sud-Ouest (relie Oakhaven aux plaines sud-ouest)
      {
        x: 1950,
        y: 3950,
        w: 190,
        h: 82,
        angle: 0.70, // Perpendiculaire au lit diagonal de la rivière (~40°)
        name: "Passage des Saules"
      }
    ];
  }

  // ==========================================
  // 3. RÉSEAU DE ROUTES ET CHEMINS DE TERRE MÉDIÉVALES
  // ==========================================
  initRoads() {
    this.roadPaths = [
      // Route 1 : Route Royale : Sortie Nord du Pont d'Oakhaven (3750, 3045) ➔ Val-des-Ombres (2100, 1780)
      [
        { x: 3750, y: 3045 },
        { x: 3350, y: 2600 },
        { x: 2850, y: 2200 },
        { x: 2500, y: 2000 }, // Panneau indicateur "Route du Nord ⬆ Val-des-Ombres"
        { x: 2250, y: 1880 },
        { x: 2100, y: 1780 }  // Entrée de la citadelle de Val-des-Ombres
      ],
      // Route 2 : Oakhaven (3200, 3500) ➔ Pont d'Oakhaven (3750, 3255) ➔ Rives du Nord
      [
        { x: 3200, y: 3480 },
        { x: 3450, y: 3350 },
        { x: 3750, y: 3255 }, // Entrée Sud du Pont
        { x: 3750, y: 3045 }, // Sortie Nord du Pont
        { x: 4000, y: 2600 },
        { x: 4400, y: 2000 }
      ],
      // Route 3 : Oakhaven (3200, 3500) ➔ Bourgade de Riverbend (4650, 4900)
      [
        { x: 3300, y: 3600 },
        { x: 3700, y: 4050 },
        { x: 4150, y: 4450 },
        { x: 4600, y: 4850 }
      ],
      // Route 4 : Oakhaven ➔ Passage des Saules (Pont 2, Entrée Sud)
      [
        { x: 3000, y: 3550 },
        { x: 2500, y: 3750 },
        { x: 2150, y: 3980 },
        { x: 2020, y: 4010 } // Entrée Sud du Pont 2
      ],
      // Route 5 : Passage des Saules (Sortie Nord) ➔ Tanière des Loups & Plaines Ouest
      [
        { x: 1880, y: 3890 }, // Sortie Nord du Pont 2
        { x: 1650, y: 3700 },
        { x: 1400, y: 3500 }  // Tanière des Loups d'Ombre
      ],
      // Route 6 : Riverbend ➔ Vers le Camp des Orcs à l'Est
      [
        { x: 4750, y: 4850 },
        { x: 5350, y: 4600 },
        { x: 6050, y: 4100 }
      ]
    ];
  }

  // ==========================================
  // 4. FALAISES ET PLATEAUX ROCHEUX
  // ==========================================
  initCliffs() {
    this.cliffs = [
      // Falaise 1 : Crêtes rocheuses du Nord (surplombant Val-des-Ombres par le Nord)
      {
        points: [
          { x: 1500, y: 1100 }, { x: 2100, y: 1050 }, { x: 2750, y: 1150 },
          { x: 2700, y: 1350 }, { x: 2200, y: 1320 }, { x: 1550, y: 1320 }
        ],
        h: 55
      },
      // Falaise 1b : Crête rocheuse occidentale (flanc Ouest de Val-des-Ombres)
      {
        points: [
          { x: 1200, y: 1400 }, { x: 1620, y: 1440 }, { x: 1580, y: 2050 },
          { x: 1150, y: 2000 }
        ],
        h: 55
      },
      // Falaise 2 : Crête rocheuse à l'Est
      {
        points: [
          { x: 5100, y: 2600 }, { x: 5600, y: 2550 }, { x: 6000, y: 2800 },
          { x: 5900, y: 3400 }, { x: 5400, y: 3500 }, { x: 4950, y: 3100 }
        ],
        h: 55
      },
      // Falaise 3 : Collines du Sud
      {
        points: [
          { x: 2300, y: 4900 }, { x: 2800, y: 4850 }, { x: 3300, y: 5100 },
          { x: 3200, y: 5600 }, { x: 2600, y: 5650 }, { x: 2150, y: 5300 }
        ],
        h: 50
      }
    ];
  }

  // ==========================================
  // 5. CAMPS DE MONSTRES & POINTS D'INTÉRÊT (MONDE VIVANT)
  // ==========================================
  initMonsterCamps() {
    this.monsterCamps = [
      {
        id: 'wolves_west',
        name: "Tanière des Loups d'Ombre",
        x: 1400,
        y: 3500,
        radius: 380,
        monsterType: 'skeleton',
        count: 7,
        respawnTimer: 25,
        decors: [
          { type: 'bones', x: 1400, y: 3500 },
          { type: 'rock', x: 1370, y: 3480, r: 24 },
          { type: 'rock', x: 1440, y: 3520, r: 20 }
        ]
      },
      {
        id: 'spiders_north',
        name: "Nid des Araignées Spectres",
        x: 4200,
        y: 1100,
        radius: 380,
        monsterType: 'bat',
        count: 8,
        respawnTimer: 25,
        decors: [
          { type: 'web', x: 4200, y: 1100 },
          { type: 'rock', x: 4160, y: 1080, r: 20 }
        ]
      },
      {
        id: 'orcs_east',
        name: "Bastion des Orcs Berserkers",
        x: 6200,
        y: 4000,
        radius: 400,
        monsterType: 'demon',
        count: 6,
        respawnTimer: 30,
        decors: [
          { type: 'campfire', x: 6200, y: 4000, radius: 22 },
          { type: 'tent', x: 6130, y: 3950, w: 56, h: 48, color: '#8d0801', accent: '#370617' },
          { type: 'tent', x: 6260, y: 4050, w: 56, h: 48, color: '#8d0801', accent: '#370617' }
        ]
      },
      {
        id: 'slimes_south',
        name: "Marais des Slimes Corrompus",
        x: 3600,
        y: 6200,
        radius: 380,
        monsterType: 'zombie',
        count: 9,
        respawnTimer: 25,
        decors: [
          { type: 'slime_pool', x: 3600, y: 6200, radius: 45 },
          { type: 'logs', x: 3560, y: 6170 }
        ]
      },
      {
        id: 'ruins_northeast',
        name: "Ruines des Âmes Maudites",
        x: 5800,
        y: 2000,
        radius: 380,
        monsterType: 'skeleton',
        count: 7,
        respawnTimer: 25,
        decors: [
          { type: 'ruins_pillar', x: 5780, y: 1980 },
          { type: 'ruins_pillar', x: 5840, y: 2020 },
          { type: 'rock', x: 5800, y: 2010, r: 22 }
        ]
      },
      {
        id: 'woods_southwest',
        name: "Clairière Obscure du Sud-Ouest",
        x: 1800,
        y: 5500,
        radius: 360,
        monsterType: 'bat',
        count: 7,
        respawnTimer: 25,
        decors: [
          { type: 'web', x: 1800, y: 5500 },
          { type: 'rock', x: 1830, y: 5480, r: 22 }
        ]
      }
    ];
  }

  // ==========================================
  // 6. COFFRES AU TRÉSOR DISSIMULÉS & SANCTUAIRES
  // ==========================================
  initChests() {
    this.chests = [
      { id: 1, x: 1600, y: 2800, opened: false, type: 'gold', xpGems: 7, hp: 35, title: "Coffre d'Or des Bois" },
      { id: 2, x: 2600, y: 4400, opened: false, type: 'wood', xpGems: 4, hp: 25, title: "Coffre en Chêne" },
      { id: 3, x: 4200, y: 3800, opened: false, type: 'wood', xpGems: 4, hp: 25, title: "Coffre de Patrouille" },
      { id: 4, x: 5400, y: 1600, opened: false, type: 'gold', xpGems: 8, hp: 40, title: "Trésor des Ruines Nord" },
      { id: 5, x: 6450, y: 4400, opened: false, type: 'gold', xpGems: 9, hp: 45, title: "Butin des Berserkers" },
      { id: 6, x: 4200, y: 6000, opened: false, type: 'wood', xpGems: 5, hp: 30, title: "Coffre des Marais" },
      { id: 7, x: 1680, y: 1800, opened: false, type: 'gold', xpGems: 7, hp: 35, title: "Coffre de la Falaise" },
      { id: 8, x: 2800, y: 2200, opened: false, type: 'wood', xpGems: 4, hp: 25, title: "Coffre Rustique" }
    ];
  }

  initShrines() {
    this.shrines = [
      { id: 1, x: 2700, y: 3200, buff: 'speed', name: "Stèle des Vents Vifs", desc: "+40% Vitesse (25s)", color: '#00f0ff', activeTimer: 0 },
      { id: 2, x: 4000, y: 4400, buff: 'regen', name: "Stèle de Vitalité Solaire", desc: "+8 PV/s Régénération (25s)", color: '#2ecc71', activeTimer: 0 },
      { id: 3, x: 5200, y: 1900, buff: 'might', name: "Stèle de Fureur Titanesque", desc: "+40% Dégâts (25s)", color: '#ff2a55', activeTimer: 0 },
      { id: 4, x: 2050, y: 4950, buff: 'magnet', name: "Stèle d'Aimant Stellaire", desc: "+120% Aimant (25s)", color: '#ffd700', activeTimer: 0 }
    ];
  }

  // ==========================================
  // 7. FORÊTS MÉDIÉVALES TRÈS DENSES (1400+ ARBRES)
  // ==========================================
  initTreesAndFoliage() {
    this.trees = [];
    const rnd = (seed) => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    let seed = 42;
    // 14 massifs forestiers médiévaux majeurs recouvrant la carte de façon dense
    const clusters = [
      { cx: 1600, cy: 2700, count: 120, radius: 750 }, // Forêt Ouest Sauvage
      { cx: 2400, cy: 1100, count: 100, radius: 650 }, // Forêt Nord-Ouest des Cimes
      { cx: 4800, cy: 1100, count: 95,  radius: 650 }, // Forêt Nord-Est des Brumes
      { cx: 5900, cy: 2200, count: 110, radius: 700 }, // Forêt Est Ancienne
      { cx: 5800, cy: 5200, count: 120, radius: 750 }, // Forêt Sud-Est des Ténèbres
      { cx: 1800, cy: 5700, count: 120, radius: 750 }, // Forêt Sud-Ouest
      { cx: 3500, cy: 4500, count: 90,  radius: 550 }, // Bois des Plaines Royales
      { cx: 2800, cy: 2800, count: 75,  radius: 500 }, // Verger et Bois d'Oakhaven
      { cx: 4700, cy: 3700, count: 90,  radius: 550 }, // Bosquets de la Rivière
      { cx: 1000, cy: 4200, count: 85,  radius: 600 }, // Bois Profond Ouest
      { cx: 6200, cy: 3000, count: 90,  radius: 600 }, // Bois des Murmures Est
      { cx: 4500, cy: 5800, count: 95,  radius: 650 }, // Massif Fluvial Sud
      { cx: 2600, cy: 6200, count: 90,  radius: 600 }, // Sous-Bois du Midi
      { cx: 3600, cy: 1700, count: 80,  radius: 550 }  // Bosquets de la Clairière Nord
    ];

    for (const cl of clusters) {
      for (let i = 0; i < cl.count; i++) {
        const ang = rnd(seed++) * Math.PI * 2;
        const dist = Math.sqrt(rnd(seed++)) * cl.radius;
        const x = cl.cx + Math.cos(ang) * dist;
        const y = cl.cy + Math.sin(ang) * dist;

        // Éviter de planter un arbre directement dans la rivière, cités, routes, ponts, donjons ou camps
        if (this.isNearRiver(x, y, 110) || 
            this.isInsideVillage(x, y, 180) ||
            this.isNearRoad(x, y, 55) ||
            this.isNearBridge(x, y, 90) ||
            this.isNearSpawn(x, y, 220) ||
            this.isNearCampOrPOI(x, y, 90) ||
            this.isInsideCliff(x, y)) {
          continue;
        }

        const isApple = rnd(seed++) < 0.20;
        const isStump = !isApple && rnd(seed++) < 0.08;
        const size = isStump ? 26 : 44 + Math.floor(rnd(seed++) * 18);

        this.trees.push({
          x, y,
          size,
          isApple,
          isStump,
          variant: Math.floor(rnd(seed++) * 3)
        });
      }
    }
  }

  isNearCampOrPOI(x, y, margin = 90) {
    const marginSq = margin * margin;
    // Camps de monstres
    if (this.monsterCamps) {
      for (const c of this.monsterCamps) {
        const dx = x - c.x, dy = y - c.y;
        if (dx * dx + dy * dy < marginSq) return true;
      }
    }
    // Donjons
    if (this.villages) {
      for (const v of this.villages) {
        if (v.dungeonEntrance) {
          const dx = x - v.dungeonEntrance.x, dy = y - v.dungeonEntrance.y;
          if (dx * dx + dy * dy < marginSq) return true;
        }
      }
    }
    // Coffres
    if (this.chests) {
      for (const ch of this.chests) {
        const dx = x - ch.x, dy = y - ch.y;
        if (dx * dx + dy * dy < 50 * 50) return true;
      }
    }
    // Sanctuaires
    if (this.shrines) {
      for (const sh of this.shrines) {
        const dx = x - sh.x, dy = y - sh.y;
        if (dx * dx + dy * dy < 50 * 50) return true;
      }
    }
    return false;
  }

  isNearRiver(x, y, margin = 100) {
    for (const seg of this.riverSegments) {
      const dx = x - seg.x;
      const dy = y - seg.y;
      if (dx * dx + dy * dy < margin * margin) return true;
    }
    return false;
  }

  isInsideVillage(x, y, margin = 200) {
    for (const v of this.villages) {
      const dx = x - v.x;
      const dy = y - v.y;
      if (dx * dx + dy * dy < (v.radius - margin) * (v.radius - margin)) return true;
    }
    return false;
  }

  isNearRoad(x, y, margin = 55) {
    const marginSq = margin * margin;
    for (const path of this.roadPaths) {
      for (let i = 0; i < path.length - 1; i++) {
        if (this.distToSegmentSq(x, y, path[i].x, path[i].y, path[i + 1].x, path[i + 1].y) < marginSq) {
          return true;
        }
      }
    }
    return false;
  }

  isNearBridge(x, y, margin = 90) {
    const marginSq = margin * margin;
    for (const b of this.bridges) {
      const dx = x - b.x;
      const dy = y - b.y;
      if (dx * dx + dy * dy < marginSq) return true;
    }
    return false;
  }

  isNearSpawn(x, y, margin = 220) {
    const dx = x - 3500;
    const dy = y - 3500;
    return dx * dx + dy * dy < margin * margin;
  }

  isNearPortal(x, y, margin = 280) {
    const portals = [
      { x: 3500, y: 400 },
      { x: 3500, y: 6600 },
      { x: 400,  y: 3500 },
      { x: 6600, y: 3500 }
    ];
    const marginSq = margin * margin;
    for (const p of portals) {
      const dx = x - p.x;
      const dy = y - p.y;
      if (dx * dx + dy * dy < marginSq) return true;
    }
    return false;
  }

  isInsideCliff(x, y) {
    for (const c of this.cliffs) {
      if (this.isPointInPolygon(x, y, c.points)) return true;
    }
    return false;
  }

  // ==========================================
  // 8. ACCESSOIRES, RUINES & DÉCORS MÉDIÉVAUX
  // ==========================================
  initPropsAndDecor() {
    this.props = [
      // Panneaux indicateurs du Royaume
      { type: 'signpost', x: 3160, y: 3680, text: "OAKHAVEN 🏛️ | VAL-DES-OMBRES ↖ | RIVERBEND ↘" },
      { type: 'signpost', x: 2100, y: 1870, text: "VAL-DES-OMBRES 🏰 | OAKHAVEN ↘" },
      { type: 'signpost', x: 4650, y: 5040, text: "RIVERBEND 🌊 | OAKHAVEN ↖" },
      { type: 'signpost', x: 3800, y: 3280, text: "PONT D'OAKHAVEN 🌉" },
      { type: 'signpost', x: 2500, y: 2000, text: "ROUTE DU NORD ⬆ VAL-DES-OMBRES" },

      // Ruines médiévales en pierre
      { type: 'ruins_pillar', x: 2800, y: 2200 },
      { type: 'ruins_pillar', x: 2860, y: 2250 },
      { type: 'ruins_pillar', x: 5750, y: 2050 },
      { type: 'ruins_pillar', x: 5820, y: 2100 },
      { type: 'ruins_pillar', x: 1950, y: 4800 },

      // Tas de bois et bûches
      { type: 'logs', x: 3280, y: 3620 },
      { type: 'logs', x: 4580, y: 4860 },
      { type: 'logs', x: 2180, y: 1750 },

      // Rochers naturels disséminés
      { type: 'rock', x: 3820, y: 2850, r: 18 },
      { type: 'rock', x: 2600, y: 3750, r: 20 },
      { type: 'rock', x: 4850, y: 4650, r: 18 },
      { type: 'rock', x: 3450, y: 4300, r: 22 },
      { type: 'rock', x: 1700, y: 2400, r: 24 },
      { type: 'rock', x: 5300, y: 3500, r: 20 }
    ];
  }

  // Détermine si une position se trouve dans une Safe Zone (ville protégée)
  isInsideSafeZone(x, y) {
    if (!this.villages) return false;
    for (const v of this.villages) {
      if (!v.safeZone) continue;
      const dx = x - v.x;
      const dy = y - v.y;
      if (dx * dx + dy * dy < v.radius * v.radius) {
        return true;
      }
    }
    return false;
  }

  // Retourne la ville dans laquelle se trouve le joueur
  getCurrentVillage(x, y) {
    if (!this.villages) return null;
    for (const v of this.villages) {
      const dx = x - v.x;
      const dy = y - v.y;
      if (dx * dx + dy * dy < v.radius * v.radius) {
        return v;
      }
    }
    return null;
  }

  // Retourne la fontaine de soin si le joueur est dans son périmètre actif
  getNearbyFountain(x, y) {
    if (!this.villages) return null;
    for (const v of this.villages) {
      if (v.fountain) {
        const dx = x - v.fountain.x;
        const dy = y - v.fountain.y;
        if (dx * dx + dy * dy < v.fountain.radius * v.fountain.radius) {
          return v.fountain;
        }
      }
    }
    return null;
  }

  // ==========================================
  // RENDU DU MONDE COMPLET (AVEC CULLING)
  // ==========================================
  render(ctx, engine, camera, zoom) {
    // Si le joueur est à l'intérieur d'une maison
    if (engine && engine.isInsideHouse) {
      this.renderHouseInterior(ctx, engine, engine.gameTime);
      return;
    }

    const viewW = engine.width / zoom;
    const viewH = engine.height / zoom;
    const left = camera.x - viewW / 2 - 120;
    const right = camera.x + viewW / 2 + 120;
    const top = camera.y - viewH / 2 - 120;
    const bottom = camera.y + viewH / 2 + 120;

    // 1. Fond de plaines verdoyantes avec dalles pixel-art
    this.renderGrassPlains(ctx, left, right, top, bottom);

    // 2. Chemins de terre battue
    this.renderRoads(ctx, left, right, top, bottom);

    // 3. Rivière sinueuse avec onde d'eau
    this.renderRiver(ctx, engine.gameTime, left, right, top, bottom);

    // 4. Ponts en bois
    this.renderBridges(ctx, left, right, top, bottom);

    // 5. Falaises rocheuses
    this.renderCliffs(ctx, left, right, top, bottom);

    // 6. Entités du décor ordonnées en Y (Bâtiments, Arbres, Tentes, Feux de camp)
    this.renderYOrderedEntities(ctx, engine.gameTime, left, right, top, bottom, engine.player);
  }

  // 1. Sol d'herbe verdoyante
  renderGrassPlains(ctx, left, right, top, bottom) {
    const tileSize = 64;
    const startX = Math.max(0, Math.floor(left / tileSize) * tileSize);
    const endX = Math.min(this.worldSize, Math.ceil(right / tileSize) * tileSize);
    const startY = Math.max(0, Math.floor(top / tileSize) * tileSize);
    const endY = Math.min(this.worldSize, Math.ceil(bottom / tileSize) * tileSize);

    for (let x = startX; x <= endX; x += tileSize) {
      for (let y = startY; y <= endY; y += tileSize) {
        const hash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        
        // Couleur d'herbe champêtre vibrante (identique à l'image de référence)
        ctx.fillStyle = hash > 0.65 ? '#80b248' : (hash > 0.35 ? '#88bb4d' : '#75a640');
        ctx.fillRect(x, y, tileSize, tileSize);

        // Touche de fleur sauvage miniature
        if (hash > 0.88) {
          ctx.fillStyle = hash > 0.94 ? '#ffea00' : '#ffffff';
          ctx.beginPath();
          ctx.arc(x + 24 + hash * 20, y + 24 + hash * 16, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // 2. Tracé des chemins de terre
  renderRoads(ctx, left, right, top, bottom) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const path of this.roadPaths) {
      // Bordure de terre sombre
      ctx.strokeStyle = 'rgba(166, 124, 82, 0.5)';
      ctx.lineWidth = 78;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();

      // Cœur de terre battue claire / sableuse
      ctx.strokeStyle = '#d6a86c';
      ctx.lineWidth = 62;
      ctx.stroke();

      // Voie centrale usée
      ctx.strokeStyle = 'rgba(235, 196, 138, 0.45)';
      ctx.lineWidth = 36;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3. Rendu de la grande rivière
  renderRiver(ctx, time, left, right, top, bottom) {
    const wave = Math.sin(time * 2.5) * 4;

    ctx.save();
    // Berges en terre humide
    ctx.strokeStyle = '#8a6240';
    ctx.lineWidth = 158;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(this.riverPoints[0].x, this.riverPoints[0].y);
    for (let i = 1; i < this.riverPoints.length; i++) {
      ctx.lineTo(this.riverPoints[i].x, this.riverPoints[i].y);
    }
    ctx.stroke();

    // Eau turquoise profonde
    ctx.strokeStyle = '#2b7cb5';
    ctx.lineWidth = 142;
    ctx.stroke();

    // Eau bleue azur brillante
    ctx.strokeStyle = '#38a3e5';
    ctx.lineWidth = 126;
    ctx.stroke();

    // Courant et reflets d'eau ondulants animés
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 18;
    ctx.setLineDash([24, 30]);
    ctx.lineDashOffset = -time * 35;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 4. Ponts en bois
  renderBridges(ctx, left, right, top, bottom) {
    for (const b of this.bridges) {
      if (b.x < left - 150 || b.x > right + 150 || b.y < top - 150 || b.y > bottom + 150) continue;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);

      // Ombre du pont sur l'eau
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(-b.w / 2, -b.h / 2 + 10, b.w, b.h);

      // Poutres principales en bois
      ctx.fillStyle = '#6f4518';
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);

      // Planches transversales de bois
      const plankW = 14;
      ctx.fillStyle = '#8f5c2c';
      for (let px = -b.w / 2 + 4; px < b.w / 2 - 4; px += plankW + 2) {
        ctx.fillRect(px, -b.h / 2 + 6, plankW, b.h - 12);
        ctx.fillStyle = '#5c3a16';
        ctx.fillRect(px + plankW - 1, -b.h / 2 + 6, 1.5, b.h - 12);
        ctx.fillStyle = '#8f5c2c';
      }

      // Garde-corps / rambardes de sécurité
      ctx.fillStyle = '#4a2c0f';
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, 8);
      ctx.fillRect(-b.w / 2, b.h / 2 - 8, b.w, 8);

      // Poutres d'ancrage en bois massif sur les berges
      ctx.fillStyle = '#3a200b';
      ctx.fillRect(-b.w / 2 - 2, -b.h / 2, 8, b.h);
      ctx.fillRect(b.w / 2 - 6, -b.h / 2, 8, b.h);

      // Poteaux de rambarde
      ctx.fillStyle = '#2d1804';
      for (let px = -b.w / 2; px <= b.w / 2; px += 35) {
        ctx.fillRect(px - 3, -b.h / 2 - 4, 6, 12);
        ctx.fillRect(px - 3, b.h / 2 - 8, 6, 12);
      }

      ctx.restore();
    }
  }

  // 5. Falaises rocheuses
  renderCliffs(ctx, left, right, top, bottom) {
    for (const c of this.cliffs) {
      ctx.save();
      // Face rocheuse verticale
      ctx.fillStyle = '#6b6354';
      ctx.strokeStyle = '#4a4438';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(c.points[0].x, c.points[0].y + c.h);
      for (let i = 1; i < c.points.length; i++) {
        ctx.lineTo(c.points[i].x, c.points[i].y + c.h);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Plateau d'herbe surélevé
      ctx.fillStyle = '#85b94e';
      ctx.strokeStyle = '#5a8232';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(c.points[0].x, c.points[0].y);
      for (let i = 1; i < c.points.length; i++) {
        ctx.lineTo(c.points[i].x, c.points[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }

  // 6. Entités ordonnées en Y (Bâtiments, Arbres, Tentes, Feux) pour un relief naturel
  renderYOrderedEntities(ctx, time, left, right, top, bottom, player = null) {
    const drawList = [];

    // Ajouter les bâtiments de chaque village
    for (const v of this.villages) {
      for (const b of v.buildings) {
        if (b.x >= left - 150 && b.x <= right + 150 && b.y >= top - 150 && b.y <= bottom + 150) {
          drawList.push({ kind: 'building', data: b, y: b.y + (b.h || 0) });
        }
      }
    }

    // Ajouter les arbres visibles
    for (const tr of this.trees) {
      if (tr.x >= left - 80 && tr.x <= right + 80 && tr.y >= top - 80 && tr.y <= bottom + 80) {
        drawList.push({ kind: 'tree', data: tr, y: tr.y });
      }
    }

    // Ajouter les accessoires visibles
    for (const p of this.props) {
      if (p.x >= left - 60 && p.x <= right + 60 && p.y >= top - 60 && p.y <= bottom + 60) {
        drawList.push({ kind: 'prop', data: p, y: p.y });
      }
    }
    // Ajouter les entrées de donjons visibles
    for (const v of this.villages) {
      if (v.dungeonEntrance) {
        const d = v.dungeonEntrance;
        if (d.x >= left - 150 && d.x <= right + 150 && d.y >= top - 150 && d.y <= bottom + 150) {
          drawList.push({ kind: 'dungeon', data: d, y: d.y + 40 });
        }
      }
    }

    // Ajouter les coffres au trésor visibles
    if (this.chests) {
      for (const ch of this.chests) {
        if (ch.x >= left - 60 && ch.x <= right + 60 && ch.y >= top - 60 && ch.y <= bottom + 60) {
          drawList.push({ kind: 'chest', data: ch, y: ch.y });
        }
      }
    }

    // Ajouter les sanctuaires runiques visibles
    if (this.shrines) {
      for (const sh of this.shrines) {
        if (sh.x >= left - 80 && sh.x <= right + 80 && sh.y >= top - 80 && sh.y <= bottom + 80) {
          drawList.push({ kind: 'shrine', data: sh, y: sh.y + 20 });
        }
      }
    }

    // Ajouter les décors des camps de monstres visibles
    if (this.monsterCamps) {
      for (const c of this.monsterCamps) {
        if (c.decors) {
          for (const d of c.decors) {
            if (d.x >= left - 80 && d.x <= right + 80 && d.y >= top - 80 && d.y <= bottom + 80) {
              drawList.push({ kind: 'campDecor', data: d, y: d.y });
            }
          }
        }
      }
    }

    // Tri par coordonnée Y pour le rendu isométrique (les objets au premier plan recouvrent l'arrière)
    drawList.sort((a, b) => a.y - b.y);

    for (const item of drawList) {
      if (item.kind === 'building') {
        this.drawBuilding(ctx, item.data, time);
      } else if (item.kind === 'tree') {
        this.drawTree(ctx, item.data, player);
      } else if (item.kind === 'prop') {
        this.drawProp(ctx, item.data);
      } else if (item.kind === 'dungeon') {
        this.drawDungeonEntrance(ctx, item.data, time);
      } else if (item.kind === 'chest') {
        this.drawChest(ctx, item.data, time);
      } else if (item.kind === 'shrine') {
        this.drawShrine(ctx, item.data, time);
      } else if (item.kind === 'campDecor') {
        this.drawCampDecor(ctx, item.data, time);
      }
    }
  }

  // Dessin des bâtiments pixel-art
  drawBuilding(ctx, b, time) {
    ctx.save();
    ctx.translate(b.x, b.y);

    if (b.type === 'house') {
      // Ombre portée au sol
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(-b.w / 2 + 6, b.h / 2, b.w, 14);

      // Façade en pierre / crépi
      ctx.fillStyle = '#e8d8b8';
      ctx.fillRect(-b.w / 2, -b.h / 2 + 20, b.w, b.h - 20);

      // Poutres de charpente
      ctx.fillStyle = '#7a4e28';
      ctx.fillRect(-b.w / 2, -b.h / 2 + 20, 5, b.h - 20);
      ctx.fillRect(b.w / 2 - 5, -b.h / 2 + 20, 5, b.h - 20);
      ctx.fillRect(-b.w / 2, b.h / 2 - 6, b.w, 6);

      // Porte en bois
      ctx.fillStyle = '#4a2c0f';
      ctx.fillRect(-12, b.h / 2 - 28, 24, 28);
      // Poignée
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(6, b.h / 2 - 14, 2.5, 2.5);

      // Fenêtres chaleureuses
      ctx.fillStyle = '#ffdf7a';
      ctx.fillRect(-b.w / 2 + 10, -b.h / 2 + 30, 14, 14);
      ctx.fillRect(b.w / 2 - 24, -b.h / 2 + 30, 14, 14);
      ctx.strokeStyle = '#4a2c0f';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-b.w / 2 + 10, -b.h / 2 + 30, 14, 14);
      ctx.strokeRect(b.w / 2 - 24, -b.h / 2 + 30, 14, 14);

      // Toit à double pente turquoise/bleu-vert (comme sur l'image)
      ctx.fillStyle = b.roofColor || '#2a9d8f';
      ctx.beginPath();
      ctx.moveTo(0, -b.h / 2 - 14);
      ctx.lineTo(-b.w / 2 - 8, -b.h / 2 + 22);
      ctx.lineTo(b.w / 2 + 8, -b.h / 2 + 22);
      ctx.closePath();
      ctx.fill();

      // Faîte et ardoises
      ctx.strokeStyle = '#1b4d45';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Cheminée
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(b.w / 4, -b.h / 2 - 18, 10, 16);
    } else if (b.type === 'castle') {
      // Grand Château / Manoir central d'Oakhaven
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(-b.w / 2 + 10, b.h / 2, b.w, 18);

      // Corps en pierre massive
      ctx.fillStyle = '#dfd3c3';
      ctx.fillRect(-b.w / 2, -b.h / 2 + 30, b.w, b.h - 30);

      // Tours crénelées gauche et droite
      ctx.fillStyle = '#b8aa98';
      ctx.fillRect(-b.w / 2 - 10, -b.h / 2 + 10, 32, b.h - 10);
      ctx.fillRect(b.w / 2 - 22, -b.h / 2 + 10, 32, b.h - 10);

      // Toitures à pignons d'émeraude
      ctx.fillStyle = b.roofColor;
      ctx.beginPath();
      ctx.moveTo(0, -b.h / 2 - 22);
      ctx.lineTo(-b.w / 2 + 16, -b.h / 2 + 32);
      ctx.lineTo(b.w / 2 - 16, -b.h / 2 + 32);
      ctx.closePath();
      ctx.fill();

      // Grande porte voûtée
      ctx.fillStyle = '#3a200b';
      ctx.beginPath();
      ctx.arc(0, b.h / 2 - 20, 18, Math.PI, 0);
      ctx.fillRect(-18, b.h / 2 - 20, 36, 20);
      ctx.fill();

      // Vitraux d'arcade
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(-35, -b.h / 2 + 45, 14, 20);
      ctx.fillRect(21, -b.h / 2 + 45, 14, 20);
    } else if (b.type === 'tent') {
      // Tente conique d'aventurier (identique aux tentes jaunes de la capture)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(4, b.h / 2 + 2, b.w / 2, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Toile de tente
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.moveTo(0, -b.h / 2);
      ctx.lineTo(-b.w / 2, b.h / 2);
      ctx.lineTo(b.w / 2, b.h / 2);
      ctx.closePath();
      ctx.fill();

      // Ombrage du pan droit
      ctx.fillStyle = b.accent || '#d4a373';
      ctx.beginPath();
      ctx.moveTo(0, -b.h / 2);
      ctx.lineTo(0, b.h / 2);
      ctx.lineTo(b.w / 2, b.h / 2);
      ctx.closePath();
      ctx.fill();

      // Ouverture de la tente
      ctx.fillStyle = '#4a2c0f';
      ctx.beginPath();
      ctx.moveTo(0, -b.h / 2 + 15);
      ctx.lineTo(-10, b.h / 2);
      ctx.lineTo(10, b.h / 2);
      ctx.closePath();
      ctx.fill();
    } else if (b.type === 'campfire') {
      // Feu de camp animé
      ctx.fillStyle = '#3a200b';
      for (let r = 0; r < 6; r++) {
        const a = (r / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 14, Math.sin(a) * 10, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flammes ardentes dansantes
      const flicker = Math.sin(time * 12) * 3;
      ctx.fillStyle = '#ff3c00';
      ctx.beginPath();
      ctx.arc(0, -4, 10 + flicker, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffa200';
      ctx.beginPath();
      ctx.arc(0, -6, 7 + flicker * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffff66';
      ctx.beginPath();
      ctx.arc(0, -7, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.type === 'well') {
      // Puits en pierre sur la place centrale
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 8, b.radius + 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#7a7a7a';
      ctx.beginPath();
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4a4a4a';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Eau au fond du puits
      ctx.fillStyle = '#1e5f8a';
      ctx.beginPath();
      ctx.arc(0, 0, b.radius - 5, 0, Math.PI * 2);
      ctx.fill();

      // Toit miniature du puits
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(-b.radius, -18, b.radius * 2, 7);
    } else if (b.type === 'library') {
      // Bibliothèque des Arcanes & Tour des Grimoires
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, b.h / 2 + 4, b.w / 2 + 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Murs en pierre mystique pourpre
      ctx.fillStyle = '#1e142e';
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);

      // Toit à deux versants violet arcanique
      ctx.fillStyle = b.roofColor || '#5c3d8d';
      ctx.beginPath();
      ctx.moveTo(-b.w / 2 - 10, -b.h / 2);
      ctx.lineTo(0, -b.h / 2 - 28);
      ctx.lineTo(b.w / 2 + 10, -b.h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = b.trim || '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Enseigne du Grimoire au-dessus de la porte
      ctx.font = '22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('📖', 0, -b.h / 2 - 8);

      // Fenêtres arcaniques illuminées
      const glow = Math.sin(time * 3) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(0, 240, 255, ${glow * 0.75})`;
      ctx.fillRect(-26, -6, 14, 16);
      ctx.fillRect(12, -6, 14, 16);

      // Porte en bois sombre ornée
      ctx.fillStyle = '#3a234c';
      ctx.fillRect(-10, b.h / 2 - 22, 20, 22);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-10, b.h / 2 - 22, 20, 22);
    } else if (b.type === 'library_npc') {
      // PNJ Archimage Kaelen (Maître des Grimoires)
      const bobbing = Math.sin(time * 4) * 2;
      
      // Ombre
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Robe de mage étoilée
      ctx.fillStyle = '#311042';
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.lineTo(0, -14 + bobbing);
      ctx.lineTo(10, 8);
      ctx.closePath();
      ctx.fill();

      // Chapeau de sorcier pointu
      ctx.fillStyle = '#6b21a8';
      ctx.beginPath();
      ctx.moveTo(-12, -14 + bobbing);
      ctx.lineTo(0, -32 + bobbing);
      ctx.lineTo(12, -14 + bobbing);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Bâton arcanique avec orbe brillant
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(14, 8);
      ctx.lineTo(14, -22 + bobbing);
      ctx.stroke();
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(14, -25 + bobbing, 5, 0, Math.PI * 2);
      ctx.fill();

      // Bulle de dialogue interactive "📖 GRIMOIRES"
      const bubblePulse = Math.sin(time * 3) * 2;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(-48, -52 + bubblePulse, 96, 20);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-48, -52 + bubblePulse, 96, 20);

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'center';
      ctx.fillText('📖 GRIMOIRES (B)', 0, -38 + bubblePulse);
    } else if (b.type === 'stall') {
      // Étalage de marché avec auvent coloré
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(-b.w / 2, -b.h / 2 + 10, b.w, b.h - 10);
      ctx.fillStyle = b.color;
      ctx.fillRect(-b.w / 2 - 3, -b.h / 2, b.w + 6, 12);
    } else if (b.type === 'pier') {
      // Ponton de bois sur l'eau
      ctx.fillStyle = '#6f4518';
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.fillStyle = '#8f5c2c';
      for (let px = -b.w / 2 + 4; px < b.w / 2 - 4; px += 10) {
        ctx.fillRect(px, -b.h / 2 + 2, 8, b.h - 4);
      }
    } else if (b.type === 'fountain') {
      // Fontaine sacrée médiévale avec eau étincelante et zone bénie
      const pulse = Math.sin(time * 3) * 0.15 + 0.85;

      // Halo de bénédiction au sol (zone de soin)
      ctx.save();
      const auraColor = b.dark ? 'rgba(231, 76, 60, 0.15)' : (b.water ? 'rgba(0, 180, 216, 0.18)' : 'rgba(46, 196, 182, 0.18)');
      ctx.fillStyle = auraColor;
      ctx.beginPath();
      ctx.arc(0, 0, (b.radius + 110) * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Anneau runique
      ctx.strokeStyle = b.dark ? 'rgba(231, 76, 60, 0.35)' : (b.water ? 'rgba(0, 180, 216, 0.4)' : 'rgba(46, 196, 182, 0.4)');
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.restore();

      // Ombre du bassin
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 10, b.radius + 6, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bassin en pierre de taille
      ctx.fillStyle = b.dark ? '#3a3a48' : '#7d8597';
      ctx.beginPath();
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = b.dark ? '#22222a' : '#495057';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Eau limpide animée
      ctx.fillStyle = b.dark ? '#c0392b' : (b.water ? '#0077b6' : '#2ec4b6');
      ctx.beginPath();
      ctx.arc(0, 0, b.radius - 5, 0, Math.PI * 2);
      ctx.fill();

      // Colonne centrale de la fontaine
      ctx.fillStyle = b.dark ? '#2c2c38' : '#5c677d';
      ctx.fillRect(-6, -18, 12, 18);
      ctx.beginPath();
      ctx.arc(0, -18, 9, 0, Math.PI * 2);
      ctx.fill();

      // Jet d'eau scintillant
      ctx.fillStyle = '#ffffff';
      const sparkY = Math.sin(time * 8) * 3;
      ctx.beginPath();
      ctx.arc(0, -26 + sparkY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Rendu majestueux de l'entrée d'un Donjon
  drawDungeonEntrance(ctx, d, time) {
    ctx.save();
    ctx.translate(d.x, d.y);

    const pulse = Math.sin(time * 2.5) * 0.2 + 0.8;

    // Lueur mystique au sol émergeant des profondeurs
    ctx.fillStyle = d.color ? `${d.color}22` : 'rgba(46, 196, 182, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 15, 65 * pulse, 28 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dalle d'escalier en pierre médiévale
    ctx.fillStyle = '#3a3a44';
    ctx.fillRect(-45, -10, 90, 40);
    ctx.strokeStyle = '#22222c';
    ctx.lineWidth = 3;
    ctx.strokeRect(-45, -10, 90, 40);

    // Marches descendantes dans l'abysse
    ctx.fillStyle = '#22222a';
    ctx.fillRect(-36, -2, 72, 8);
    ctx.fillStyle = '#15151c';
    ctx.fillRect(-32, 6, 64, 8);
    ctx.fillStyle = '#08080c';
    ctx.fillRect(-28, 14, 56, 12);

    // Arche gothique en pierre taillée au-dessus de l'entrée
    ctx.fillStyle = '#555566';
    ctx.fillRect(-48, -48, 14, 42); // Pilier gauche
    ctx.fillRect(34, -48, 14, 42);  // Pilier droit
    ctx.fillRect(-50, -56, 100, 12); // Fronton

    // Ornementation & Icône du Donjon
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.icon || '🏛️', 0, -68);

    // Bannière avec le nom du Donjon
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(-85, -96, 170, 22);
    ctx.strokeStyle = d.color || '#2ec4b6';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-85, -96, 170, 22);

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(d.name.toUpperCase(), 0, -85);

    ctx.restore();
  }

  // Rendu d'un Coffre Médiéval aux trésors
  drawChest(ctx, ch, time) {
    ctx.save();
    ctx.translate(ch.x, ch.y);

    const isGold = ch.type === 'gold';

    // Ombre au sol
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 20, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    if (ch.opened) {
      // Coffre grand ouvert vidé
      ctx.fillStyle = isGold ? '#b8860b' : '#6f4518';
      ctx.fillRect(-16, -2, 32, 14);

      // Couvercle basculé en arrière
      ctx.fillStyle = isGold ? '#d4af37' : '#8b5a2b';
      ctx.beginPath();
      ctx.arc(0, -5, 16, Math.PI, 0);
      ctx.fill();

      // Intérieur sombre
      ctx.fillStyle = '#221105';
      ctx.fillRect(-12, -4, 24, 8);
    } else {
      // Lueur scintillante qui attire l'aventurier
      const sparkle = Math.sin(time * 4) * 0.25 + 0.75;
      ctx.fillStyle = isGold ? 'rgba(255, 215, 0, 0.25)' : 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(0, 2, 22 * sparkle, 0, Math.PI * 2);
      ctx.fill();

      // Cuve du coffre en bois
      ctx.fillStyle = isGold ? '#b8860b' : '#6f4518';
      ctx.fillRect(-16, -2, 32, 14);

      // Couvercle bombé
      ctx.fillStyle = isGold ? '#ffd700' : '#8b5a2b';
      ctx.beginPath();
      ctx.arc(0, -2, 16, Math.PI, 0);
      ctx.fill();

      // Ferrures / Cerclages métalliques
      ctx.fillStyle = isGold ? '#fff3b0' : '#3a3a44';
      ctx.fillRect(-12, -10, 3, 22);
      ctx.fillRect(9, -10, 3, 22);

      // Serrure en laiton
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-3, 0, 6, 6);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-1, 2, 2, 3);
    }

    ctx.restore();
  }

  // Rendu d'une Stèle / Sanctuaire Runique de bénédiction
  drawShrine(ctx, sh, time) {
    ctx.save();
    ctx.translate(sh.x, sh.y);

    const pulse = Math.sin(time * 3) * 0.2 + 0.8;

    // Halo d'énergie mystique
    ctx.fillStyle = `${sh.color}25`;
    ctx.beginPath();
    ctx.ellipse(0, 15, 36 * pulse, 16 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();

    // Base en pierre ancienne
    ctx.fillStyle = '#4a4e59';
    ctx.fillRect(-22, 5, 44, 12);
    ctx.strokeStyle = '#2d313a';
    ctx.lineWidth = 2;
    ctx.strokeRect(-22, 5, 44, 12);

    // Menhir / Obélisque runique taillé
    ctx.fillStyle = '#6c757d';
    ctx.beginPath();
    ctx.moveTo(-16, 5);
    ctx.lineTo(-10, -42);
    ctx.lineTo(0, -52);
    ctx.lineTo(10, -42);
    ctx.lineTo(16, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Runes lumineuses sculptées dans la roche
    ctx.fillStyle = sh.color;
    ctx.shadowColor = sh.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(-3, -32, 6, 4);
    ctx.fillRect(-4, -22, 8, 3);
    ctx.fillRect(-2, -12, 4, 8);
    ctx.shadowBlur = 0;

    // Orbe magique pulsant au sommet
    const floatY = Math.sin(time * 4) * 4;
    ctx.fillStyle = sh.color;
    ctx.beginPath();
    ctx.arc(0, -62 + floatY, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Rendu des accessoires de camps de monstres (totems, toiles, ossements, etc.)
  drawCampDecor(ctx, d, time) {
    ctx.save();
    ctx.translate(d.x, d.y);

    if (d.type === 'web') {
      // Toile d'araignée géante
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 32, Math.sin(a) * 32);
        ctx.stroke();
      }
      for (let r = 10; r <= 30; r += 10) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (d.type === 'bones') {
      // Ossements et crâne de bête
      ctx.fillStyle = '#ded9cf';
      ctx.beginPath();
      ctx.ellipse(-6, 0, 10, 4, 0.4, 0, Math.PI * 2);
      ctx.ellipse(8, -2, 8, 3, -0.3, 0, Math.PI * 2);
      ctx.fill();
      // Crâne
      ctx.beginPath();
      ctx.arc(0, -4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#222222';
      ctx.fillRect(-2, -5, 2, 2);
      ctx.fillRect(1, -5, 2, 2);
    } else if (d.type === 'slime_pool') {
      // Flaque de mucus toxique
      ctx.fillStyle = 'rgba(46, 204, 113, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 0, d.radius || 35, (d.radius || 35) * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      // Bulles de poison
      const bubble = Math.sin(time * 5) * 2;
      ctx.fillStyle = '#a8e6cf';
      ctx.beginPath();
      ctx.arc(8, -4 + bubble, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (d.type === 'ruins_pillar') {
      // Pilier médiéval brisé
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7a7d84';
      ctx.fillRect(-10, -28, 20, 34);
      ctx.strokeStyle = '#4a4d54';
      ctx.lineWidth = 2;
      ctx.strokeRect(-10, -28, 20, 34);
      // Fissure
      ctx.strokeStyle = '#2d2f34';
      ctx.beginPath();
      ctx.moveTo(-4, -20);
      ctx.lineTo(2, -10);
      ctx.lineTo(-2, 0);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Dessin des arbres pixel-art avec semi-transparence automatique sous le feuillage
  drawTree(ctx, t, player = null) {
    ctx.save();
    ctx.translate(t.x, t.y);

    if (t.isStump) {
      // Souche d'arbre coupée
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#6e4722';
      ctx.fillRect(-8, -6, 16, 10);
      ctx.fillStyle = '#a67c52';
      ctx.beginPath();
      ctx.ellipse(0, -6, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Détection de présence sous ou derrière le feuillage de l'arbre
      let isUnderCanopy = false;
      if (player) {
        const canoY = t.y - t.size * 0.25;
        const dx = player.x - t.x;
        const dy = player.y - canoY;
        const canopyR = t.size * 0.65;
        if (dx * dx + dy * dy < canopyR * canopyR) {
          isUnderCanopy = true;
        }
      }

      if (isUnderCanopy) {
        ctx.globalAlpha = 0.50; // Transparence magique à 50% quand le héros est sous le feuillage
      }

      // Ombre portée au sol
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.beginPath();
      ctx.ellipse(0, t.size * 0.35, t.size * 0.38, t.size * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tronc d'arbre
      ctx.fillStyle = '#593a1c';
      const trunkW = Math.max(8, t.size * 0.22);
      const trunkH = t.size * 0.45;
      ctx.fillRect(-trunkW / 2, -trunkH / 2 + 6, trunkW, trunkH);

      // Houppier / feuillage en dôme touffu à 3 tons de vert (Pixel-art fidèle)
      const r = t.size * 0.45;
      const cy = -t.size * 0.25;

      // Ombre du feuillage
      ctx.fillStyle = '#3a6921';
      ctx.beginPath();
      ctx.arc(0, cy + 4, r, 0, Math.PI * 2);
      ctx.fill();

      // Corps du feuillage vert riche
      ctx.fillStyle = t.variant === 1 ? '#4d8a2c' : '#579633';
      ctx.beginPath();
      ctx.arc(0, cy, r * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // Éclairage supérieur ensoleillé
      ctx.fillStyle = '#7ebf4f';
      ctx.beginPath();
      ctx.arc(-2, cy - 5, r * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Pommes rouges éclatantes si pommier
      if (t.isApple) {
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.arc(-r * 0.4, cy - 3, 3, 0, Math.PI * 2);
        ctx.arc(r * 0.35, cy - 6, 3, 0, Math.PI * 2);
        ctx.arc(0, cy + r * 0.35, 3, 0, Math.PI * 2);
        ctx.arc(-r * 0.2, cy + r * 0.2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // Dessin des panneaux et rochers
  drawProp(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.type === 'signpost') {
      // Poteau en bois
      ctx.fillStyle = '#593a1c';
      ctx.fillRect(-2.5, -16, 5, 18);
      // Panneau
      ctx.fillStyle = '#a67c52';
      ctx.fillRect(-16, -26, 32, 12);
      ctx.strokeStyle = '#4a2c0f';
      ctx.lineWidth = 1;
      ctx.strokeRect(-16, -26, 32, 12);
    } else if (p.type === 'rock') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, p.r * 0.4, p.r, p.r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#7a7a7a';
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9e9e9e';
      ctx.beginPath();
      ctx.arc(-p.r * 0.25, -p.r * 0.25, p.r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'logs') {
      ctx.fillStyle = '#593a1c';
      ctx.fillRect(-14, -6, 28, 7);
      ctx.fillRect(-12, -12, 24, 7);
    }

    ctx.restore();
  }

  // ==========================================
  // SYSTÈME DE COLLISIONS PHYSIQUES & GLISSEMENT
  // ==========================================

  initColliders() {
    this.colliders = [];

    // 1. Bâtiments des villages
    for (const v of this.villages) {
      for (const b of v.buildings) {
        if (b.type === 'house') {
          this.colliders.push({
            type: 'box',
            minX: b.x - b.w / 2,
            maxX: b.x + b.w / 2,
            minY: b.y - b.h / 2 + 18,
            maxY: b.y + b.h / 2,
            solid: true,
            blocksMonsters: true
          });
        } else if (b.type === 'castle') {
          this.colliders.push({
            type: 'box',
            minX: b.x - b.w / 2 - 12,
            maxX: b.x + b.w / 2 + 12,
            minY: b.y - b.h / 2 + 22,
            maxY: b.y + b.h / 2,
            solid: true,
            blocksMonsters: true
          });
        } else if (b.type === 'tent') {
          this.colliders.push({
            type: 'circle',
            x: b.x,
            y: b.y + 6,
            r: b.w * 0.38,
            solid: true,
            blocksMonsters: true
          });
        } else if (b.type === 'well') {
          this.colliders.push({
            type: 'circle',
            x: b.x,
            y: b.y,
            r: b.radius + 2,
            solid: true,
            blocksMonsters: true
          });
        } else if (b.type === 'stall') {
          this.colliders.push({
            type: 'box',
            minX: b.x - b.w / 2,
            maxX: b.x + b.w / 2,
            minY: b.y - b.h / 2 + 5,
            maxY: b.y + b.h / 2,
            solid: true,
            blocksMonsters: true
          });
        } else if (b.type === 'campfire') {
          this.colliders.push({
            type: 'circle',
            x: b.x,
            y: b.y,
            r: 16,
            solid: true,
            blocksMonsters: true
          });
        }
      }
    }

    // 2. Décors et accessoires
    for (const p of this.props) {
      if (p.type === 'rock') {
        this.colliders.push({
          type: 'circle',
          x: p.x,
          y: p.y,
          r: p.r,
          solid: true,
          blocksMonsters: true
        });
      } else if (p.type === 'logs') {
        this.colliders.push({
          type: 'box',
          minX: p.x - 14,
          maxX: p.x + 14,
          minY: p.y - 12,
          maxY: p.y + 4,
          solid: true,
          blocksMonsters: true
        });
      }
    }

    // 3. Arbres et souches : Traversée 100% libre (aucune collision pour une fluidité totale dans les bois)
    // Les arbres sont purement visuels avec effet de semi-transparence sous le feuillage

    // 4. Falaises et plateaux rocheux
    for (const c of this.cliffs) {
      this.colliders.push({
        type: 'polygon',
        points: c.points,
        solid: true,
        blocksMonsters: true
      });
    }

    // 5. Segments de rivière (l'eau bloquante, franchissable uniquement sur les ponts)
    for (const seg of this.riverSegments) {
      this.colliders.push({
        type: 'river',
        x: seg.x,
        y: seg.y,
        r: 66,
        solid: false,
        blocksMonsters: true
      });
    }
  }

  // Grille spatiale (Spatial Grid) pour des tests O(1) ultra-rapides à 60-120 FPS
  buildSpatialGrid() {
    this.gridSize = 250;
    this.spatialGrid = new Map();
    this.queryCounter = 0;

    const maxCols = Math.ceil(this.worldSize / this.gridSize);
    const maxRows = Math.ceil(this.worldSize / this.gridSize);

    const addToCell = (col, row, collider) => {
      if (col < 0 || col >= maxCols || row < 0 || row >= maxRows) return;
      const key = `${col},${row}`;
      let cell = this.spatialGrid.get(key);
      if (!cell) {
        cell = [];
        this.spatialGrid.set(key, cell);
      }
      cell.push(collider);
    };

    let idGen = 0;
    for (const c of this.colliders) {
      c.id = ++idGen;
      c._lastQuery = 0;

      if (c.type === 'circle' || c.type === 'river') {
        const minC = Math.floor((c.x - c.r) / this.gridSize);
        const maxC = Math.floor((c.x + c.r) / this.gridSize);
        const minR = Math.floor((c.y - c.r) / this.gridSize);
        const maxR = Math.floor((c.y + c.r) / this.gridSize);
        for (let col = minC; col <= maxC; col++) {
          for (let row = minR; row <= maxR; row++) {
            addToCell(col, row, c);
          }
        }
      } else if (c.type === 'box') {
        const minC = Math.floor(c.minX / this.gridSize);
        const maxC = Math.floor(c.maxX / this.gridSize);
        const minR = Math.floor(c.minY / this.gridSize);
        const maxR = Math.floor(c.maxY / this.gridSize);
        for (let col = minC; col <= maxC; col++) {
          for (let row = minR; row <= maxR; row++) {
            addToCell(col, row, c);
          }
        }
      } else if (c.type === 'polygon') {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const pt of c.points) {
          if (pt.x < minX) minX = pt.x;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.y > maxY) maxY = pt.y;
        }
        const minC = Math.floor(minX / this.gridSize);
        const maxC = Math.floor(maxX / this.gridSize);
        const minR = Math.floor(minY / this.gridSize);
        const maxR = Math.floor(maxY / this.gridSize);
        for (let col = minC; col <= maxC; col++) {
          for (let row = minR; row <= maxR; row++) {
            addToCell(col, row, c);
          }
        }
      }
    }
  }

  // Vérifie si une entité est sur un pont en bois praticable ou sur sa rampe d'accès
  isOnBridge(px, py) {
    for (const b of this.bridges) {
      const dx = px - b.x;
      const dy = py - b.y;
      const cos = Math.cos(-b.angle);
      const sin = Math.sin(-b.angle);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;

      const halfLen = b.w / 2;    // ~95px
      const halfWidth = b.h / 2;  // ~42px (tablier de 84px de large)

      // Au-delà de la longueur du pont et de sa rampe
      if (Math.abs(localX) > halfLen + 30) continue;

      // 1. Au-dessus de l'eau (|localX| < 68px) : STRICTEMENT restreint au tablier en bois (interdit d'aller dans l'eau)
      if (Math.abs(localX) < 68) {
        if (Math.abs(localY) <= halfWidth + 2) {
          return true;
        }
      } else {
        // 2. Sur les berges de terre ferme (|localX| >= 68px) : raccordement fluide avec la route
        if (Math.abs(localY) <= halfWidth + 26) {
          return true;
        }
      }
    }
    return false;
  }

  // Vérifie si une entité est sur un ponton de pêche
  isOnPier(px, py) {
    for (const v of this.villages) {
      for (const b of v.buildings) {
        if (b.type === 'pier') {
          if (Math.abs(px - b.x) <= (b.w / 2 + 10) && Math.abs(py - b.y) <= (b.h / 2 + 8)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Teste si une position entre en collision
  isColliding(x, y, radius, isPlayer = true) {
    // 0. Si le joueur est à l'intérieur d'une maison (zone isolée x: 3500, y: 9200)
    if (y > 8500) {
      const cx = 3500, cy = 9200, w = 480, h = 340;
      const minX = cx - w / 2 + 10;
      const maxX = cx + w / 2 - 10;
      const minY = cy - h / 2 + 15;
      const maxY = cy + h / 2 - 10;

      // Bords extérieurs de la pièce
      if (x - radius < minX || x + radius > maxX || y - radius < minY || y + radius > maxY) {
        return true;
      }

      // Lit à baldaquin (en haut à droite)
      if (x + radius > 3625 && x - radius < 3705 && y + radius > 9045 && y - radius < 9130) {
        return true;
      }
      // Table de banquet (au centre)
      if (x + radius > 3385 && x - radius < 3475 && y + radius > 9155 && y - radius < 9205) {
        return true;
      }
      // Cheminée en pierre (en haut au centre)
      if (x + radius > 3455 && x - radius < 3545 && y + radius > 9030 && y - radius < 9075) {
        return true;
      }
      return false;
    }

    // 1. Limites du monde
    if (x - radius < 25 || x + radius > this.worldSize - 25 ||
        y - radius < 25 || y + radius > this.worldSize - 25) {
      return true;
    }

    const minCx = Math.max(0, Math.floor((x - radius - 20) / this.gridSize));
    const maxCx = Math.min(Math.floor(this.worldSize / this.gridSize), Math.floor((x + radius + 20) / this.gridSize));
    const minCy = Math.max(0, Math.floor((y - radius - 20) / this.gridSize));
    const maxCy = Math.min(Math.floor(this.worldSize / this.gridSize), Math.floor((y + radius + 20) / this.gridSize));

    const onBridgeOrPier = this.isOnBridge(x, y) || this.isOnPier(x, y);

    this.queryCounter++;
    const qId = this.queryCounter;

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const cell = this.spatialGrid.get(`${cx},${cy}`);
        if (!cell) continue;

        for (let i = 0; i < cell.length; i++) {
          const c = cell[i];
          if (c._lastQuery === qId) continue;
          c._lastQuery = qId;

          // Si c'est un monstre et que l'objet ne bloque pas les monstres (ex: arbres)
          if (!isPlayer && !c.blocksMonsters) continue;

          if (c.type === 'circle') {
            const dx = x - c.x;
            const dy = y - c.y;
            const minDist = c.r + radius;
            if (dx * dx + dy * dy < minDist * minDist) {
              return true;
            }
          } else if (c.type === 'box') {
            const nearX = Math.max(c.minX, Math.min(x, c.maxX));
            const nearY = Math.max(c.minY, Math.min(y, c.maxY));
            const dx = x - nearX;
            const dy = y - nearY;
            if (dx * dx + dy * dy < radius * radius) {
              return true;
            }
          } else if (c.type === 'river') {
            // L'eau ne bloque pas si on se trouve sur un pont ou un ponton
            if (onBridgeOrPier) continue;
            const dx = x - c.x;
            const dy = y - c.y;
            const minDist = c.r + radius;
            if (dx * dx + dy * dy < minDist * minDist) {
              return true;
            }
          } else if (c.type === 'polygon') {
            if (this.checkPolygonCollision(x, y, radius, c.points)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  // Vérifie si un projectile heurte un obstacle solide (maison, château, rocher, falaise)
  isCollidingSolid(x, y, radius) {
    const minCx = Math.max(0, Math.floor((x - radius - 20) / this.gridSize));
    const maxCx = Math.min(Math.floor(this.worldSize / this.gridSize), Math.floor((x + radius + 20) / this.gridSize));
    const minCy = Math.max(0, Math.floor((y - radius - 20) / this.gridSize));
    const maxCy = Math.min(Math.floor(this.worldSize / this.gridSize), Math.floor((y + radius + 20) / this.gridSize));

    this.queryCounter++;
    const qId = this.queryCounter;

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const cell = this.spatialGrid.get(`${cx},${cy}`);
        if (!cell) continue;

        for (let i = 0; i < cell.length; i++) {
          const c = cell[i];
          if (!c.solid) continue;
          if (c._lastQuery === qId) continue;
          c._lastQuery = qId;

          if (c.type === 'box') {
            const nearX = Math.max(c.minX, Math.min(x, c.maxX));
            const nearY = Math.max(c.minY, Math.min(y, c.maxY));
            const dx = x - nearX;
            const dy = y - nearY;
            if (dx * dx + dy * dy < radius * radius) return true;
          } else if (c.type === 'circle') {
            const dx = x - c.x;
            const dy = y - c.y;
            const minDist = c.r + radius;
            if (dx * dx + dy * dy < minDist * minDist) return true;
          } else if (c.type === 'polygon') {
            if (this.checkPolygonCollision(x, y, radius, c.points)) return true;
          }
        }
      }
    }
    return false;
  }

  // Collision exacte cercle / polygone
  checkPolygonCollision(px, py, radius, points) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    if (px + radius < minX || px - radius > maxX || py + radius < minY || py - radius > maxY) {
      return false;
    }

    const rSq = radius * radius;
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      if (this.distToSegmentSq(px, py, p1.x, p1.y, p2.x, p2.y) < rSq) {
        return true;
      }
    }

    return this.isPointInPolygon(px, py, points);
  }

  // Distance au carré entre un point et un segment de droite
  distToSegmentSq(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return (px - x1) * (px - x1) + (py - y1) * (py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    const dx = px - projX;
    const dy = py - projY;
    return dx * dx + dy * dy;
  }

  // Test de point dans un polygone (Ray casting)
  isPointInPolygon(px, py, points) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x, yi = points[i].y;
      const xj = points[j].x, yj = points[j].y;
      const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // Résolution de déplacement fluide avec glissement d'axe séparé (Sliding Collision)
  resolveMove(currX, currY, targetX, targetY, radius, isPlayer = true) {
    if (currX === targetX && currY === targetY) {
      return { x: currX, y: currY };
    }

    let finalX = currX;
    let finalY = currY;

    // 1. Essayer le mouvement complet (X et Y)
    if (!this.isColliding(targetX, targetY, radius, isPlayer)) {
      return { x: targetX, y: targetY };
    }

    // 2. Glissement sur l'axe X seul
    if (targetX !== currX) {
      if (!this.isColliding(targetX, currY, radius, isPlayer)) {
        finalX = targetX;
      }
    }

    // 3. Glissement sur l'axe Y seul
    if (targetY !== currY) {
      if (!this.isColliding(finalX, targetY, radius, isPlayer)) {
        finalY = targetY;
      } else if (finalX === currX && !this.isColliding(currX, targetY, radius, isPlayer)) {
        finalY = targetY;
      }
    }

    // 4. Glissement tangentiel si bloqué en diagonale contre un obstacle courbé
    if (finalX === currX && finalY === currY && (targetX !== currX || targetY !== currY)) {
      const dx = targetX - currX;
      const dy = targetY - currY;
      const testTangents = [
        { x: currX + dy * 0.7, y: currY - dx * 0.7 },
        { x: currX - dy * 0.7, y: currY + dx * 0.7 }
      ];
      for (const t of testTangents) {
        if (!this.isColliding(t.x, t.y, radius, isPlayer)) {
          finalX = t.x;
          finalY = t.y;
          break;
        }
      }
    }

    // 5. Si bloqué sur les deux axes et déjà en pénétration, libération automatique
    if (finalX === currX && finalY === currY && (targetX !== currX || targetY !== currY)) {
      if (this.isColliding(currX, currY, radius, isPlayer)) {
        const unstick = this.findUnstickPosition(currX, currY, radius, isPlayer);
        if (unstick) {
          finalX = unstick.x;
          finalY = unstick.y;
        }
      }
    }

    return { x: finalX, y: finalY };
  }

  // Aide à débloquer une entité qui serait apparue ou repoussée dans un obstacle
  findUnstickPosition(x, y, radius, isPlayer = true) {
    const dirs = [
      { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 },
      { dx: 0.7, dy: -0.7 }, { dx: 0.7, dy: 0.7 }, { dx: -0.7, dy: 0.7 }, { dx: -0.7, dy: -0.7 }
    ];
    for (let step = 3; step <= 25; step += 3) {
      for (const d of dirs) {
        const testX = x + d.dx * step;
        const testY = y + d.dy * step;
        if (!this.isColliding(testX, testY, radius, isPlayer)) {
          return { x: testX, y: testY };
        }
      }
    }
    return null;
  }

  // ==========================================
  // SYSTÈME DE PATHFINDING A* & FRANCHISSEMENT DES PONTS
  // ==========================================
  // Calcule la coordonnée Y du lit de la rivière à une position X donnée
  getRiverY(x) {
    if (x >= this.riverPoints[0].x) return this.riverPoints[0].y;
    if (x <= this.riverPoints[this.riverPoints.length - 1].x) return this.riverPoints[this.riverPoints.length - 1].y;
    for (let i = 0; i < this.riverPoints.length - 1; i++) {
      const p1 = this.riverPoints[i];     // X plus élevé
      const p2 = this.riverPoints[i + 1]; // X moins élevé
      if (x <= p1.x && x >= p2.x) {
        const t = (x - p2.x) / (p1.x - p2.x);
        return p2.y + t * (p1.y - p2.y);
      }
    }
    return 3500;
  }

  // Détermine si une position se trouve sur la rive Nord (au-dessus) de la rivière
  isNorthOfRiver(x, y) {
    return y < this.getRiverY(x);
  }

  // Calcul instantané (O(1), 60 FPS garanti) de la cible de navigation pour monstres et boss
  getMonsterNavTarget(monsterX, monsterY, playerX, playerY) {
    const monsterNorth = this.isNorthOfRiver(monsterX, monsterY);
    const playerNorth = this.isNorthOfRiver(playerX, playerY);

    // Si le monstre et le joueur sont du même côté de la rive, charge directe vers le joueur
    if (monsterNorth === playerNorth) {
      return { x: playerX, y: playerY };
    }

    // Si séparés par la rivière, diriger la horde vers le pont le plus proche
    // Pont 1 (Oakhaven) : (3750, 3150)
    // Pont 2 (Saules)   : (1950, 3950)
    const distB1 = Math.hypot(monsterX - 3750, monsterY - 3150);
    const distB2 = Math.hypot(monsterX - 1950, monsterY - 3950);
    const useBridge1 = distB1 <= distB2;

    const bNorth = useBridge1 ? { x: 3750, y: 3030 } : { x: 1880, y: 3890 };
    const bSouth = useBridge1 ? { x: 3750, y: 3270 } : { x: 2020, y: 4010 };

    // Si le monstre est sur le pont, il court vers la sortie du côté du joueur
    if (this.isOnBridge(monsterX, monsterY)) {
      return playerNorth ? bNorth : bSouth;
    }

    // Sinon, il court vers l'entrée du pont de son côté
    return monsterNorth ? bNorth : bSouth;
  }

  initNavGrid() {
    this.navCellSize = 50;
    this.navCols = Math.ceil(this.worldSize / this.navCellSize);
    this.navGrid = new Uint8Array(this.navCols * this.navCols);

    for (let gy = 0; gy < this.navCols; gy++) {
      for (let gx = 0; gx < this.navCols; gx++) {
        const wx = gx * this.navCellSize + this.navCellSize / 2;
        const wy = gy * this.navCellSize + this.navCellSize / 2;
        if (this.isColliding(wx, wy, 16, true)) {
          this.navGrid[gy * this.navCols + gx] = 1;
        }
      }
    }
  }

  // Vérifie si la ligne de vue directe entre 2 points est exempte de collision
  hasLineOfSight(x1, y1, x2, y2, radius = 16, step = 14) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    if (dist <= 0) return true;
    const steps = Math.ceil(dist / step);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const px = x1 + dx * t;
      const py = y1 + dy * t;
      if (this.isColliding(px, py, radius, true)) {
        return false;
      }
    }
    return true;
  }

  // Recherche du plus court chemin A* avec franchissement automatique des ponts
  findPath(startX, startY, goalX, goalY, radius = 16) {
    // 1. Si la ligne droite est entièrement libre (aucun obstacle / rivière), trajet direct instantané (0 ms)
    if (this.hasLineOfSight(startX, startY, goalX, goalY, radius)) {
      return [{ x: goalX, y: goalY }];
    }

    if (!this.navGrid) {
      return [{ x: goalX, y: goalY }];
    }

    const cols = this.navCols;
    const cellSize = this.navCellSize;

    let sx = Math.max(0, Math.min(cols - 1, Math.floor(startX / cellSize)));
    let sy = Math.max(0, Math.min(cols - 1, Math.floor(startY / cellSize)));
    let gx = Math.max(0, Math.min(cols - 1, Math.floor(goalX / cellSize)));
    let gy = Math.max(0, Math.min(cols - 1, Math.floor(goalY / cellSize)));

    // Si la cible cliquée est sur un obstacle (eau profonde, maison), chercher la case praticable la plus proche
    if (this.navGrid[gy * cols + gx] === 1) {
      let found = false;
      for (let r = 1; r <= 6 && !found; r++) {
        for (let dy = -r; dy <= r && !found; dy++) {
          for (let dx = -r; dx <= r && !found; dx++) {
            const nx = gx + dx;
            const ny = gy + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < cols && this.navGrid[ny * cols + nx] === 0) {
              gx = nx;
              gy = ny;
              found = true;
            }
          }
        }
      }
      if (!found) return [{ x: goalX, y: goalY }];
    }

    // Si le départ est bloqué, chercher la case libre la plus proche
    if (this.navGrid[sy * cols + sx] === 1) {
      let found = false;
      for (let r = 1; r <= 4 && !found; r++) {
        for (let dy = -r; dy <= r && !found; dy++) {
          for (let dx = -r; dx <= r && !found; dx++) {
            const nx = sx + dx;
            const ny = sy + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < cols && this.navGrid[ny * cols + nx] === 0) {
              sx = nx;
              sy = ny;
              found = true;
            }
          }
        }
      }
    }

    const startIdx = sy * cols + sx;
    const goalIdx = gy * cols + gx;
    if (startIdx === goalIdx) {
      return [{ x: goalX, y: goalY }];
    }

    // Min-Heap binaire optimisé pour A* à 60 FPS
    const heap = [];
    const pushHeap = (item) => {
      heap.push(item);
      let idx = heap.length - 1;
      while (idx > 0) {
        const parent = (idx - 1) >> 1;
        if (heap[idx].f < heap[parent].f) {
          const tmp = heap[idx];
          heap[idx] = heap[parent];
          heap[parent] = tmp;
          idx = parent;
        } else break;
      }
    };
    const popHeap = () => {
      if (heap.length === 0) return null;
      const top = heap[0];
      const bottom = heap.pop();
      if (heap.length > 0) {
        heap[0] = bottom;
        let idx = 0;
        const len = heap.length;
        while (true) {
          const left = (idx << 1) + 1;
          const right = left + 1;
          let smallest = idx;
          if (left < len && heap[left].f < heap[smallest].f) smallest = left;
          if (right < len && heap[right].f < heap[smallest].f) smallest = right;
          if (smallest !== idx) {
            const tmp = heap[idx];
            heap[idx] = heap[smallest];
            heap[smallest] = tmp;
            idx = smallest;
          } else break;
        }
      }
      return top;
    };

    const cameFrom = new Int32Array(cols * cols).fill(-1);
    const gScore = new Float32Array(cols * cols).fill(Infinity);
    const closed = new Uint8Array(cols * cols);

    gScore[startIdx] = 0;
    const startH = Math.hypot(gx - sx, gy - sy);
    pushHeap({ idx: startIdx, f: startH });

    const neighbors = [
      { dx: 0, dy: -1, cost: 1.0 },
      { dx: 0, dy: 1, cost: 1.0 },
      { dx: -1, dy: 0, cost: 1.0 },
      { dx: 1, dy: 0, cost: 1.0 },
      { dx: -1, dy: -1, cost: 1.414 },
      { dx: 1, dy: -1, cost: 1.414 },
      { dx: -1, dy: 1, cost: 1.414 },
      { dx: 1, dy: 1, cost: 1.414 }
    ];

    let maxIters = 2500;
    let closestNode = startIdx;
    let closestDist = startH;

    while (heap.length > 0 && maxIters-- > 0) {
      const top = popHeap();
      const current = top.idx;

      if (current === goalIdx) {
        closestNode = current;
        break;
      }

      if (closed[current]) continue;
      closed[current] = 1;

      const curX = current % cols;
      const curY = (current / cols) | 0;

      const distToGoal = Math.hypot(gx - curX, gy - curY);
      if (distToGoal < closestDist) {
        closestDist = distToGoal;
        closestNode = current;
      }

      for (let i = 0; i < 8; i++) {
        const n = neighbors[i];
        const nx = curX + n.dx;
        const ny = curY + n.dy;
        if (nx < 0 || nx >= cols || ny < 0 || ny >= cols) continue;

        const nIdx = ny * cols + nx;
        if (closed[nIdx] || this.navGrid[nIdx] === 1) continue;

        // Éviter de couper les coins solides en diagonale
        if (n.dx !== 0 && n.dy !== 0) {
          if (this.navGrid[curY * cols + nx] === 1 || this.navGrid[ny * cols + curX] === 1) {
            continue;
          }
        }

        const tentativeG = gScore[current] + n.cost;
        if (tentativeG < gScore[nIdx]) {
          cameFrom[nIdx] = current;
          gScore[nIdx] = tentativeG;
          const h = Math.hypot(gx - nx, gy - ny) * 1.03;
          pushHeap({ idx: nIdx, f: tentativeG + h });
        }
      }
    }

    // Reconstitution du chemin inverse
    const rawPath = [];
    let curr = closestNode;
    while (curr !== startIdx && curr !== -1) {
      const cx = curr % cols;
      const cy = (curr / cols) | 0;
      rawPath.push({ x: cx * cellSize + cellSize / 2, y: cy * cellSize + cellSize / 2 });
      curr = cameFrom[curr];
    }
    rawPath.reverse();

    if (closestNode === goalIdx) {
      rawPath.push({ x: goalX, y: goalY });
    }

    if (rawPath.length === 0) {
      return [{ x: goalX, y: goalY }];
    }

    // Lissage du chemin par raycast (supprime les zigzags et crée des trajectoires parfaites)
    return this.smoothPath(startX, startY, rawPath, radius);
  }

  // Lissage de trajectoire (String-Pulling avec Raycast)
  smoothPath(startX, startY, rawPath, radius = 16) {
    if (rawPath.length <= 1) return rawPath;
    const full = [{ x: startX, y: startY }, ...rawPath];
    const smoothed = [];
    let currentIdx = 0;

    while (currentIdx < full.length - 1) {
      let furthest = currentIdx + 1;
      for (let testIdx = full.length - 1; testIdx > currentIdx + 1; testIdx--) {
        if (this.hasLineOfSight(full[currentIdx].x, full[currentIdx].y, full[testIdx].x, full[testIdx].y, radius)) {
          furthest = testIdx;
          break;
        }
      }
      smoothed.push(full[furthest]);
      currentIdx = furthest;
    }
    return smoothed;
  }

  // ==========================================
  // DÉTECTION DES OBJETS ET BÂTIMENTS INTERACTIFS (TOUCHE F)
  // ==========================================
  getNearbyInteractable(px, py, isInsideHouse = false) {
    if (isInsideHouse) {
      // 1. Porte de sortie (au bas de la pièce)
      const dExit = Math.hypot(px - 3500, py - 9345);
      if (dExit <= 55) {
        return {
          type: 'exit_door',
          x: 3500,
          y: 9345,
          label: 'Sortir dehors',
          actionText: 'SORTIR DEHORS',
          icon: '🚪'
        };
      }

      // 2. Lit douillet
      const dBed = Math.hypot(px - 3660, py - 9110);
      if (dBed <= 60) {
        return {
          type: 'bed',
          x: 3660,
          y: 9110,
          label: 'Se reposer dans le lit (Restaure 100% PV)',
          actionText: 'SE REPOSER (100% PV)',
          icon: '🛏️'
        };
      }

      // 3. Cheminée crépitante
      const dFire = Math.hypot(px - 3500, py - 9080);
      if (dFire <= 55) {
        return {
          type: 'fireplace',
          x: 3500,
          y: 9080,
          label: 'Se réchauffer au foyer',
          actionText: 'SE RÉCHAUFFER AU FEU',
          icon: '🔥'
        };
      }

      // 4. Coffre secret intérieur
      if (!this.interiorChestOpened) {
        const dChest = Math.hypot(px - 3320, py - 9120);
        if (dChest <= 50) {
          return {
            type: 'interior_chest',
            x: 3320,
            y: 9120,
            label: 'Fouiller le coffre de la maison',
            actionText: 'FOUILLER LE COFFRE',
            icon: '💰'
          };
        }
      }

      return null;
    }

    // --- MONDE EXTÉRIEUR ---
    let closest = null;
    let minDist = 55;

    // A. Portes des maisons et bâtiments des villages
    if (this.villages) {
      for (const v of this.villages) {
        for (const b of v.buildings) {
          if (b.type === 'house' || b.type === 'castle') {
            const doorX = b.x;
            const doorY = b.y + b.h / 2;
            const d = Math.hypot(px - doorX, py - doorY);
            if (d < minDist) {
              minDist = d;
              closest = {
                type: 'house_door',
                building: b,
                x: doorX,
                y: doorY,
                label: b.name || (b.type === 'castle' ? 'Entrer dans le Château' : 'Entrer dans la Maison'),
                actionText: b.type === 'castle' ? 'ENTRER DANS LE CHÂTEAU' : 'ENTRER DANS LA MAISON',
                icon: '🚪'
              };
            }
          } else if (b.type === 'library') {
            const doorX = b.x;
            const doorY = b.y + b.h / 2;
            const d = Math.hypot(px - doorX, py - doorY);
            if (d < minDist) {
              minDist = d;
              closest = {
                type: 'library_building',
                x: doorX,
                y: doorY,
                label: 'Consulter les Grimoires',
                actionText: 'CONSULTER LES GRIMOIRES',
                icon: '📖'
              };
            }
          }
        }
      }
    }

    // B. PNJ Archimage Kaelen
    const dKaelen = Math.hypot(px - 3260, py - 3490);
    if (dKaelen < minDist) {
      minDist = dKaelen;
      closest = {
        type: 'library_npc',
        x: 3260,
        y: 3490,
        label: 'Parler à l\'Archimage Kaelen',
        actionText: 'PARLER À KAELEN (GRIMOIRES)',
        icon: '🧙‍♂️'
      };
    }

    // C. Coffres au trésor extérieurs
    if (this.chests) {
      for (const ch of this.chests) {
        if (!ch.opened) {
          const d = Math.hypot(px - ch.x, py - ch.y);
          if (d < minDist) {
            minDist = d;
            closest = {
              type: 'chest',
              chest: ch,
              x: ch.x,
              y: ch.y,
              label: `Ouvrir : ${ch.title}`,
              actionText: `OUVRIR : ${ch.title.toUpperCase()}`,
              icon: '💰'
            };
          }
        }
      }
    }

    // D. Sanctuaires et stèles runiques
    if (this.shrines) {
      for (const sh of this.shrines) {
        if (!sh.activeTimer || sh.activeTimer <= 0) {
          const d = Math.hypot(px - sh.x, py - sh.y);
          if (d < minDist) {
            minDist = d;
            closest = {
              type: 'shrine',
              shrine: sh,
              x: sh.x,
              y: sh.y,
              label: `Prier : ${sh.name}`,
              actionText: `PRIER AU SANCTUAIRE`,
              icon: '✨'
            };
          }
        }
      }
    }

    // E. Fontaines sacrées de soin
    const fountain = this.getNearbyFountain(px, py);
    if (fountain) {
      const d = Math.hypot(px - fountain.x, py - fountain.y);
      if (d <= 55 && d < minDist) {
        minDist = d;
        closest = {
          type: 'fountain',
          fountain,
          x: fountain.x,
          y: fountain.y,
          label: 'Boire l\'Eau Bénie (Soin continu)',
          actionText: 'BOIRE L\'EAU BÉNIE',
          icon: '⛲'
        };
      }
    }

    return closest;
  }

  // ==========================================
  // RENDU DE L'INTÉRIEUR D'UNE MAISON (AUBERGE MÉDIÉVALE)
  // ==========================================
  renderHouseInterior(ctx, engine, time) {
    const cx = 3500;
    const cy = 9200;
    const w = 480;
    const h = 340;

    // Fond obscurité totale autour de la pièce
    ctx.fillStyle = '#08060c';
    ctx.fillRect(cx - 1000, cy - 800, 2000, 1600);

    // 1. Sol en parquet de chêne massif
    ctx.fillStyle = '#6b4226';
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);

    // Lattes de bois du parquet
    ctx.strokeStyle = '#4a2c17';
    ctx.lineWidth = 1.5;
    for (let y = cy - h / 2; y <= cy + h / 2; y += 22) {
      ctx.beginPath();
      ctx.moveTo(cx - w / 2, y);
      ctx.lineTo(cx + w / 2, y);
      ctx.stroke();
    }
    for (let x = cx - w / 2 + 60; x <= cx + w / 2; x += 90) {
      for (let y = cy - h / 2; y < cy + h / 2; y += 44) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 22);
        ctx.stroke();
      }
    }

    // 2. Grand Tapis Runique Pourpre & Or au centre
    ctx.fillStyle = '#4a0e4e';
    ctx.fillRect(cx - 90, cy - 50, 180, 110);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cx - 90, cy - 50, 180, 110);

    // Motif intérieur du tapis
    ctx.strokeStyle = '#e0aaff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 75, cy - 38, 150, 86);
    ctx.beginPath();
    ctx.arc(cx, cy + 5, 25, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Murs en pierre taillée & Boiserie
    ctx.fillStyle = '#22202a';
    // Mur Nord
    ctx.fillRect(cx - w / 2 - 16, cy - h / 2 - 20, w + 32, 26);
    // Murs Est et Ouest
    ctx.fillRect(cx - w / 2 - 16, cy - h / 2 - 20, 20, h + 36);
    ctx.fillRect(cx + w / 2 - 4, cy - h / 2 - 20, 20, h + 36);
    // Mur Sud
    ctx.fillRect(cx - w / 2 - 16, cy + h / 2 - 4, w + 32, 20);

    // Poutres de charpente en bois
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(cx - w / 2 - 16, cy - h / 2 - 24, w + 32, 10);

    // 4. Paillasson & Porte de sortie au Sud (3500, 9345)
    ctx.fillStyle = '#b08968';
    ctx.fillRect(cx - 32, cy + h / 2 - 22, 64, 22);
    ctx.strokeStyle = '#7f5539';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 32, cy + h / 2 - 22, 64, 22);

    // Lueur dorée sous la porte
    ctx.fillStyle = 'rgba(255, 230, 100, 0.4)';
    ctx.fillRect(cx - 24, cy + h / 2 - 4, 48, 8);

    // 5. Grande Cheminée avec feu crépitant (3500, 9050)
    ctx.fillStyle = '#3f3d47';
    ctx.fillRect(cx - 42, cy - h / 2 - 10, 84, 44);
    ctx.strokeStyle = '#1f1e24';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 42, cy - h / 2 - 10, 84, 44);

    // Âtre sombre
    ctx.fillStyle = '#110c14';
    ctx.fillRect(cx - 28, cy - h / 2 + 10, 56, 24);

    // Flammes animées dansantes
    const fireFlicker = Math.sin(time * 12) * 3;
    const fireFlicker2 = Math.cos(time * 16) * 2;
    ctx.fillStyle = '#ff4d00';
    ctx.beginPath();
    ctx.arc(cx - 8, cy - h / 2 + 24, 9 + fireFlicker, 0, Math.PI * 2);
    ctx.arc(cx + 8, cy - h / 2 + 24, 10 + fireFlicker2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(cx, cy - h / 2 + 25, 7 + fireFlicker * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Halo lumineux chaud de la cheminée
    ctx.fillStyle = 'rgba(255, 140, 0, 0.18)';
    ctx.beginPath();
    ctx.arc(cx, cy - h / 2 + 25, 110, 0, Math.PI * 2);
    ctx.fill();

    // 6. Lit à baldaquin douillet (3660, 9090)
    ctx.fillStyle = '#4a2810';
    ctx.fillRect(3630, 9050, 70, 80);
    // Couette carmin
    ctx.fillStyle = '#800f2f';
    ctx.fillRect(3634, 9070, 62, 56);
    // Oreillers crème
    ctx.fillStyle = '#fdf0d5';
    ctx.fillRect(3640, 9054, 24, 14);
    ctx.fillRect(3668, 9054, 24, 14);
    // Poteaux d'angle
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(3628, 9046, 6, 6);
    ctx.fillRect(3696, 9046, 6, 6);
    ctx.fillRect(3628, 9126, 6, 6);
    ctx.fillRect(3696, 9126, 6, 6);

    // 7. Grande Table de banquet & victuailles (3430, 9180)
    ctx.fillStyle = '#533e2d';
    ctx.fillRect(3390, 9160, 78, 44);
    ctx.strokeStyle = '#2b1e15';
    ctx.lineWidth = 2;
    ctx.strokeRect(3390, 9160, 78, 44);

    // Victuailles sur la table (assiette, pain, chope)
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(3425, 9180, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d4a373';
    ctx.beginPath();
    ctx.arc(3425, 9180, 5, 0, Math.PI * 2); // Pain
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(3446, 9174, 7, 10); // Chope d'or/bière

    // Chaises
    ctx.fillStyle = '#3d2b1f';
    ctx.fillRect(3410, 9146, 20, 10);
    ctx.fillRect(3440, 9146, 20, 10);
    ctx.fillRect(3410, 9208, 20, 10);
    ctx.fillRect(3440, 9208, 20, 10);

    // 8. Coffre secret intérieur (3320, 9120)
    this.drawChest(ctx, {
      x: 3320,
      y: 9120,
      opened: this.interiorChestOpened,
      type: 'gold'
    }, time);

    // 9. Étagère de potions et livres au mur (3310, 9045)
    ctx.fillStyle = '#4a2810';
    ctx.fillRect(3280, 9032, 65, 14);
    // Fioles
    ctx.fillStyle = '#ef233c';
    ctx.beginPath();
    ctx.arc(3295, 9036, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(3310, 9036, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2ec4b6';
    ctx.beginPath();
    ctx.arc(3325, 9036, 4, 0, Math.PI * 2);
    ctx.fill();

    // 10. Chandeliers muraux avec lueurs chaudes
    const candleGlow = Math.sin(time * 10) * 2;
    ctx.fillStyle = 'rgba(255, 200, 80, 0.15)';
    ctx.beginPath();
    ctx.arc(cx - w / 2 + 15, cy - 20, 45, 0, Math.PI * 2);
    ctx.arc(cx + w / 2 - 15, cy - 20, 45, 0, Math.PI * 2);
    ctx.fill();
  }
}
