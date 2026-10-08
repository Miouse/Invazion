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

    // 1. Initialisation des villages et points d'intérêt
    this.initVillages();

    // 2. Tracé de la rivière sinueuse et des ponts
    this.initRiverAndBridges();

    // 3. Réseau de chemins et routes de terre
    this.initRoads();

    // 4. Falaises et plateaux rocheux
    this.initCliffs();

    // 5. Génération des forêts et arbres
    this.initTreesAndFoliage();

    // 6. Accessoires, panneaux et feux de camp
    this.initPropsAndDecor();

    // 7. Initialisation du moteur de collisions physiques (bâtiments, eau, ponts, falaises, arbres)
    this.initColliders();
    this.buildSpatialGrid();
  }

  loadImg(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  // ==========================================
  // 1. LES 3 VILLAGES DISTINCTS
  // ==========================================
  initVillages() {
    this.villages = [
      {
        id: 'oakhaven',
        name: "Hameau d'Oakhaven",
        subtitle: "Cité centrale aux toits d'émeraude",
        x: 3200,
        y: 3500,
        radius: 480,
        buildings: [
          // Grand Manoir / Château central
          { type: 'castle', x: 3150, y: 3380, w: 140, h: 105, roofColor: '#1b7a6f', trim: '#2ec4b6' },
          // Maisons avec toits turquoise / bleu-vert
          { type: 'house', x: 2980, y: 3450, w: 76, h: 64, roofColor: '#2a9d8f' },
          { type: 'house', x: 2990, y: 3560, w: 82, h: 68, roofColor: '#264653' },
          { type: 'house', x: 3340, y: 3450, w: 78, h: 65, roofColor: '#2a9d8f' },
          { type: 'house', x: 3330, y: 3570, w: 84, h: 68, roofColor: '#1f6e65' },
          { type: 'house', x: 3160, y: 3620, w: 75, h: 62, roofColor: '#2a9d8f' },
          // Puits de pierre sur la place centrale
          { type: 'well', x: 3160, y: 3510, radius: 18 },
          // Étalages de marché
          { type: 'stall', x: 3080, y: 3510, w: 38, h: 26, color: '#e76f51' },
          { type: 'stall', x: 3240, y: 3510, w: 38, h: 26, color: '#f4a261' }
        ]
      },
      {
        id: 'scout_camp',
        name: "Campement des Éclaireurs",
        subtitle: "Avant-poste des chasseurs et sentinelles",
        x: 4300,
        y: 2000,
        radius: 400,
        buildings: [
          // Tentes de toile ocre/jaune (comme sur la photo de référence)
          { type: 'tent', x: 4220, y: 1940, w: 54, h: 48, color: '#e9c46a', accent: '#f4a261' },
          { type: 'tent', x: 4320, y: 1920, w: 54, h: 48, color: '#e9c46a', accent: '#f4a261' },
          { type: 'tent', x: 4390, y: 1970, w: 54, h: 48, color: '#e9c46a', accent: '#f4a261' },
          { type: 'tent', x: 4210, y: 2060, w: 50, h: 46, color: '#e9c46a', accent: '#d4a373' },
          { type: 'tent', x: 4380, y: 2070, w: 52, h: 46, color: '#e9c46a', accent: '#d4a373' },
          // Grand feu de camp central
          { type: 'campfire', x: 4300, y: 2010, radius: 20 },
          // Caisses et rondins
          { type: 'crates', x: 4260, y: 1960 },
          { type: 'crates', x: 4340, y: 2050 }
        ]
      },
      {
        id: 'riverbend',
        name: "Bourgade de Riverbend",
        subtitle: "Village de pêcheurs au bord de l'eau",
        x: 4600,
        y: 4900,
        radius: 450,
        buildings: [
          // Huttes et maisons de pêcheurs
          { type: 'house', x: 4500, y: 4820, w: 72, h: 60, roofColor: '#2a9d8f' },
          { type: 'house', x: 4620, y: 4800, w: 78, h: 64, roofColor: '#264653' },
          { type: 'house', x: 4740, y: 4830, w: 70, h: 58, roofColor: '#1b7a6f' },
          // Tentes de campement vertes
          { type: 'tent', x: 4520, y: 4960, w: 48, h: 44, color: '#52b788', accent: '#2d6a4f' },
          { type: 'tent', x: 4600, y: 4980, w: 48, h: 44, color: '#52b788', accent: '#2d6a4f' },
          // Pontons de bois avançant vers la rivière
          { type: 'pier', x: 4410, y: 4870, w: 60, h: 22 },
          { type: 'pier', x: 4430, y: 4960, w: 55, h: 22 },
          // Feu de camp convivial
          { type: 'campfire', x: 4660, y: 4920, radius: 18 }
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

    // 2 Ponts de bois traversant la rivière
    this.bridges = [
      // Pont 1 : Central (relie Oakhaven et le Camp des Éclaireurs)
      {
        x: 3750,
        y: 3150,
        w: 170,
        h: 75,
        angle: 0.15,
        name: "Pont d'Oakhaven"
      },
      // Pont 2 : Sud-Ouest (près de la sortie)
      {
        x: 1950,
        y: 3950,
        w: 165,
        h: 70,
        angle: -0.65,
        name: "Passage des Saules"
      }
    ];
  }

  // ==========================================
  // 3. RÉSEAU DE ROUTES ET CHEMINS DE TERRE
  // ==========================================
  initRoads() {
    this.roadPaths = [
      // Route 1 : Portail Nord ➔ Camp des Éclaireurs
      [ { x: 3500, y: 500 }, { x: 3700, y: 1100 }, { x: 4200, y: 1700 }, { x: 4300, y: 1950 } ],
      // Route 2 : Camp des Éclaireurs ➔ Pont d'Oakhaven
      [ { x: 4300, y: 2050 }, { x: 4100, y: 2600 }, { x: 3750, y: 3150 } ],
      // Route 3 : Pont d'Oakhaven ➔ Village Oakhaven
      [ { x: 3750, y: 3150 }, { x: 3500, y: 3350 }, { x: 3200, y: 3500 } ],
      // Route 4 : Oakhaven ➔ Portail Ouest
      [ { x: 2950, y: 3520 }, { x: 2100, y: 3520 }, { x: 1200, y: 3500 }, { x: 500, y: 3500 } ],
      // Route 5 : Oakhaven ➔ Village Riverbend
      [ { x: 3300, y: 3650 }, { x: 3700, y: 4100 }, { x: 4100, y: 4500 }, { x: 4550, y: 4850 } ],
      // Route 6 : Riverbend ➔ Portail Sud & Est
      [ { x: 4600, y: 5000 }, { x: 4300, y: 5600 }, { x: 3600, y: 6400 } ],
      [ { x: 4750, y: 4850 }, { x: 5400, y: 4500 }, { x: 6400, y: 3600 } ]
    ];
  }

  // ==========================================
  // 4. FALAISES ET PLATEAUX ROCHEUX
  // ==========================================
  initCliffs() {
    this.cliffs = [
      // Falaise 1 : Plateau rocheux du Nord-Ouest
      {
        points: [
          { x: 1200, y: 1400 }, { x: 1700, y: 1350 }, { x: 2200, y: 1500 },
          { x: 2300, y: 1900 }, { x: 2000, y: 2300 }, { x: 1400, y: 2250 },
          { x: 1100, y: 1800 }
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
  // 5. FORÊTS DENSES & ARBRES PIXEL-ART
  // ==========================================
  initTreesAndFoliage() {
    this.trees = [];
    const rnd = (seed) => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    let seed = 42;
    // On génère 650 arbres répartis en bosquets et bordures naturelles
    const clusters = [
      { cx: 1600, cy: 2600, count: 90, radius: 700 }, // Forêt Ouest
      { cx: 2200, cy: 1100, count: 70, radius: 600 }, // Forêt Nord-Ouest
      { cx: 4800, cy: 1100, count: 65, radius: 550 }, // Forêt Nord-Est
      { cx: 5800, cy: 2200, count: 80, radius: 650 }, // Forêt Est
      { cx: 5600, cy: 5200, count: 85, radius: 700 }, // Forêt Sud-Est
      { cx: 1800, cy: 5600, count: 90, radius: 700 }, // Forêt Sud-Ouest
      { cx: 3500, cy: 4500, count: 60, radius: 500 }, // Bois des Plaines
      { cx: 2800, cy: 2800, count: 50, radius: 450 }, // Verger Oakhaven
      { cx: 4600, cy: 3700, count: 60, radius: 500 }  // Bosquets de la rivière
    ];

    for (const cl of clusters) {
      for (let i = 0; i < cl.count; i++) {
        const ang = rnd(seed++) * Math.PI * 2;
        const dist = Math.sqrt(rnd(seed++)) * cl.radius;
        const x = cl.cx + Math.cos(ang) * dist;
        const y = cl.cy + Math.sin(ang) * dist;

        // Éviter de planter un arbre directement dans la rivière, villages, routes, ponts, falaises, spawn et portails
        if (this.isNearRiver(x, y, 110) || 
            this.isInsideVillage(x, y, 160) ||
            this.isNearRoad(x, y, 55) ||
            this.isNearBridge(x, y, 90) ||
            this.isNearSpawn(x, y, 220) ||
            this.isNearPortal(x, y, 280) ||
            this.isInsideCliff(x, y)) {
          continue;
        }

        const isApple = rnd(seed++) < 0.22;
        const isStump = !isApple && rnd(seed++) < 0.08;
        const size = isStump ? 26 : 42 + Math.floor(rnd(seed++) * 16);

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
  // 6. ACCESSOIRES & DÉCORS
  // ==========================================
  initPropsAndDecor() {
    this.props = [
      // Panneaux indicateurs
      { type: 'signpost', x: 3550, y: 3260, text: "OAKHAVEN ⬅ | CAMP NORD ⬆" },
      { type: 'signpost', x: 4250, y: 2130, text: "SENTIER DE LA RIVIÈRE ⬇" },
      { type: 'signpost', x: 4500, y: 4740, text: "RIVERBEND • BOURG FLUVIOLE" },
      // Tas de bois et bûches
      { type: 'logs', x: 4240, y: 1980 },
      { type: 'logs', x: 3040, y: 3620 },
      // Rochers naturels disséminés
      { type: 'rock', x: 3820, y: 2850, r: 16 },
      { type: 'rock', x: 2600, y: 3750, r: 20 },
      { type: 'rock', x: 4850, y: 4650, r: 18 },
      { type: 'rock', x: 3450, y: 4300, r: 22 }
    ];
  }

  // ==========================================
  // RENDU DU MONDE COMPLET (AVEC CULLING)
  // ==========================================
  render(ctx, engine, camera, zoom) {
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
    this.renderYOrderedEntities(ctx, engine.gameTime, left, right, top, bottom);
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
  renderYOrderedEntities(ctx, time, left, right, top, bottom) {
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

    // Tri par coordonnée Y pour le rendu isométrique (les objets au premier plan recouvrent l'arrière)
    drawList.sort((a, b) => a.y - b.y);

    for (const item of drawList) {
      if (item.kind === 'building') {
        this.drawBuilding(ctx, item.data, time);
      } else if (item.kind === 'tree') {
        this.drawTree(ctx, item.data);
      } else if (item.kind === 'prop') {
        this.drawProp(ctx, item.data);
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
    }

    ctx.restore();
  }

  // Dessin des arbres pixel-art (identiques à l'image de référence)
  drawTree(ctx, t) {
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

    // 3. Troncs d'arbres et souches (bloquent le joueur à la base)
    for (const t of this.trees) {
      if (t.isStump) {
        this.colliders.push({
          type: 'circle',
          x: t.x,
          y: t.y,
          r: 10,
          isTree: true,
          solid: false,
          blocksMonsters: false
        });
      } else {
        const trunkR = Math.max(9, t.size * 0.18);
        this.colliders.push({
          type: 'circle',
          x: t.x,
          y: t.y + 6,
          r: trunkR,
          isTree: true,
          solid: false,
          blocksMonsters: false
        });
      }
    }

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

  // Vérifie si une entité est sur un pont en bois praticable
  isOnBridge(px, py) {
    for (const b of this.bridges) {
      const dx = px - b.x;
      const dy = py - b.y;
      const cos = Math.cos(-b.angle);
      const sin = Math.sin(-b.angle);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;
      // Tolérance supplémentaire de 25px sur les berges d'accès et largeur du tablier
      if (Math.abs(localX) <= (b.w / 2 + 25) && Math.abs(localY) <= (b.h / 2 + 8)) {
        return true;
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

    // 4. Si bloqué sur les deux axes et déjà en pénétration, libération automatique
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
}
