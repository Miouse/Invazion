/**
 * Module d'Icônes Pixel-Art Médiévales — Invazion
 * Génère des icônes pixel-art authentiques 16x16 ou 24x24 pixels nets
 * respectant à 100% la DA rétro 16-bit du jeu (crisp edges, palette médiévale).
 */

export const PIXEL_ICONS = {
  // 1. Pièce d'Or Médiévale Royale (16x16)
  coin: `
    <svg class="pixel-icon pixel-icon-coin" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Ombre de contour -->
      <path d="M5 1h6v1h2v2h1v2h1v4h-1v2h-1v2h-2v1H5v-1H3v-2H2v-2H1V6h1V4h1V2h2V1z" fill="#3b2005" />
      <!-- Base or foncé -->
      <path d="M5 2h6v1h2v2h1v6h-1v2h-2v1H5v-1H3v-2H2V5h1V3h2V2z" fill="#b45309" />
      <!-- Corps de la pièce (Or chaud) -->
      <path d="M5 3h6v1h1v1h1v6h-1v1h-1v1H5v-1H4v-1H3V5h1V4h1V3z" fill="#f59e0b" />
      <!-- Face intérieure et éclat supérieur (Or brillant) -->
      <path d="M5 4h5v1h1v5h-1v1H6v-1H5V5h-1V4h1z" fill="#fbbf24" />
      <!-- Reflet lumineux blanc -->
      <rect x="4" y="4" width="2" height="2" fill="#fef08a" />
      <rect x="4" y="4" width="1" height="1" fill="#ffffff" />
      <!-- Sceau de couronne royale gravée au centre -->
      <rect x="6" y="7" width="4" height="2" fill="#78350f" />
      <rect x="6" y="6" width="1" height="1" fill="#78350f" />
      <rect x="8" y="5" width="1" height="1" fill="#78350f" />
      <rect x="9" y="6" width="1" height="1" fill="#78350f" />
      <rect x="7" y="7" width="2" height="1" fill="#fde047" />
    </svg>
  `,

  // 2. Montre à Gousset en Cuivre d'Oakhaven (16x16)
  watch: `
    <svg class="pixel-icon pixel-icon-watch" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Anneau supérieur de fixation -->
      <rect x="6" y="0" width="4" height="1" fill="#451a03" />
      <rect x="5" y="1" width="2" height="1" fill="#451a03" />
      <rect x="9" y="1" width="2" height="1" fill="#451a03" />
      <rect x="7" y="1" width="2" height="1" fill="#f59e0b" />
      <rect x="7" y="2" width="2" height="1" fill="#78350f" />
      <!-- Contour boîtier cuivre -->
      <path d="M5 3h6v1h2v2h1v4h-1v2h-2v1H5v-1H3v-2H2V6h1V4h2V3z" fill="#381a04" />
      <path d="M5 4h6v1h1v1h1v4h-1v1h-1v1H5v-1H4v-1H3V6h1V5h1V4z" fill="#b45309" />
      <!-- Cadran en parchemin clair -->
      <rect x="5" y="5" width="6" height="6" fill="#fef3c7" />
      <rect x="4" y="6" width="8" height="4" fill="#fef3c7" />
      <rect x="6" y="4" width="4" height="8" fill="#fef3c7" />
      <!-- Graduations 12h, 3h, 6h, 9h -->
      <rect x="7" y="5" width="2" height="1" fill="#92400e" />
      <rect x="10" y="7" width="1" height="2" fill="#92400e" />
      <rect x="7" y="10" width="2" height="1" fill="#92400e" />
      <rect x="5" y="7" width="1" height="2" fill="#92400e" />
      <!-- Aiguilles forgées noires (indiquant 10h10) -->
      <rect x="7" y="7" width="2" height="2" fill="#18181b" />
      <rect x="8" y="6" width="1" height="2" fill="#18181b" />
      <rect x="9" y="8" width="2" height="1" fill="#18181b" />
      <!-- Reflet de verre supérieur -->
      <rect x="5" y="5" width="2" height="1" fill="#ffffff" />
    </svg>
  `,

  // 3. Carte & Boussole d'Explorateur (16x16)
  map: `
    <svg class="pixel-icon pixel-icon-map" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Contour parchemin brûlé -->
      <path d="M3 2h10v1h1v10h-1v1H3v-1H2V3h1V2z" fill="#451a03" />
      <!-- Corps parchemin ancien -->
      <rect x="3" y="3" width="10" height="10" fill="#fde68a" />
      <!-- Bords usés et ombre -->
      <rect x="3" y="11" width="10" height="2" fill="#d97706" />
      <rect x="11" y="3" width="2" height="10" fill="#d97706" />
      <rect x="3" y="3" width="10" height="1" fill="#fef3c7" />
      <!-- Tracé de route pointillée sur la carte -->
      <rect x="4" y="5" width="2" height="1" fill="#78350f" />
      <rect x="6" y="6" width="2" height="1" fill="#78350f" />
      <rect x="8" y="7" width="1" height="2" fill="#78350f" />
      <rect x="10" y="8" width="2" height="1" fill="#78350f" />
      <!-- Rose des vents / Boussole au centre -->
      <rect x="6" y="7" width="3" height="3" fill="#1e293b" />
      <!-- Pointe Nord rouge -->
      <rect x="7" y="5" width="1" height="2" fill="#ef4444" />
      <!-- Pointe Sud bleue -->
      <rect x="7" y="10" width="1" height="2" fill="#3b82f6" />
      <!-- Pointes Est / Ouest blanches -->
      <rect x="5" y="8" width="1" height="1" fill="#ffffff" />
      <rect x="9" y="8" width="1" height="1" fill="#ffffff" />
    </svg>
  `,

  // 4. Élixir de Vitalité Majeure / Potion (16x16)
  potion: `
    <svg class="pixel-icon pixel-icon-potion" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Bouchon de liège -->
      <rect x="6" y="1" width="4" height="2" fill="#854d0e" />
      <rect x="7" y="1" width="2" height="1" fill="#ca8a04" />
      <!-- Goulot en verre cerclé -->
      <rect x="5" y="3" width="6" height="1" fill="#1e293b" />
      <rect x="6" y="4" width="4" height="2" fill="#334155" />
      <!-- Contour flacon bulbeux -->
      <path d="M5 6h6v1h2v2h1v3h-1v2h-2v1H5v-1H3v-2H2V9h1V7h2V6z" fill="#0f172a" />
      <!-- Verre transparent bleuté -->
      <rect x="4" y="7" width="8" height="6" fill="#1e293b" />
      <!-- Liquide rouge rubis bouillonnant -->
      <rect x="4" y="9" width="8" height="4" fill="#dc2626" />
      <rect x="5" y="8" width="6" height="1" fill="#ef4444" />
      <rect x="5" y="12" width="6" height="1" fill="#991b1b" />
      <!-- Bulles d'énergie pétillantes -->
      <rect x="6" y="10" width="1" height="1" fill="#fca5a5" />
      <rect x="9" y="11" width="1" height="1" fill="#fca5a5" />
      <rect x="8" y="9" width="1" height="1" fill="#ffffff" />
      <!-- Reflet de lumière sur le verre à gauche -->
      <rect x="3" y="8" width="1" height="3" fill="#ffffff" />
      <rect x="4" y="7" width="1" height="1" fill="#ffffff" />
    </svg>
  `,

  // 5. Crâne de Vainqueur / Kills (16x16)
  skull: `
    <svg class="pixel-icon pixel-icon-skull" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Contour os sombre -->
      <path d="M4 1h8v1h2v3h1v4h-1v2h-2v2h-1v2h-1v-1H9v1H7v-1H6v1H5v-2H4v-2H2V9h1V5h1V2h2V1z" fill="#18181b" />
      <!-- Boîte crânienne (Ivoire / Os) -->
      <rect x="4" y="2" width="8" height="7" fill="#f4f4f5" />
      <rect x="3" y="4" width="10" height="5" fill="#f4f4f5" />
      <!-- Ombrage os -->
      <rect x="3" y="8" width="10" height="1" fill="#cbd5e1" />
      <!-- Orbites oculaires sombres -->
      <rect x="4" y="5" width="3" height="3" fill="#09090b" />
      <rect x="9" y="5" width="3" height="3" fill="#09090b" />
      <!-- Reflet rougeoyant dans les yeux -->
      <rect x="5" y="6" width="1" height="1" fill="#ef4444" />
      <rect x="10" y="6" width="1" height="1" fill="#ef4444" />
      <!-- Cavité nasale triangulaire -->
      <rect x="7" y="8" width="2" height="1" fill="#09090b" />
      <rect x="7" y="7" width="2" height="1" fill="#334155" />
      <!-- Mâchoire et dents -->
      <rect x="5" y="10" width="6" height="3" fill="#e2e8f0" />
      <rect x="6" y="10" width="1" height="3" fill="#09090b" />
      <rect x="8" y="10" width="1" height="3" fill="#09090b" />
      <rect x="10" y="10" width="1" height="3" fill="#09090b" />
    </svg>
  `,

  // 6. Soleil d'Aube et de Jour (16x16)
  sun: `
    <svg class="pixel-icon pixel-icon-sun" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- 8 Rayons dorés pixelisés -->
      <rect x="7" y="0" width="2" height="3" fill="#f59e0b" />
      <rect x="7" y="13" width="2" height="3" fill="#f59e0b" />
      <rect x="0" y="7" width="3" height="2" fill="#f59e0b" />
      <rect x="13" y="7" width="3" height="2" fill="#f59e0b" />
      <rect x="2" y="2" width="2" height="2" fill="#f59e0b" />
      <rect x="12" y="2" width="2" height="2" fill="#f59e0b" />
      <rect x="2" y="12" width="2" height="2" fill="#f59e0b" />
      <rect x="12" y="12" width="2" height="2" fill="#f59e0b" />
      <!-- Disque solaire externe -->
      <rect x="5" y="3" width="6" height="10" fill="#b45309" />
      <rect x="3" y="5" width="10" height="6" fill="#b45309" />
      <!-- Disque solaire vif -->
      <rect x="5" y="4" width="6" height="8" fill="#fbbf24" />
      <rect x="4" y="5" width="8" height="6" fill="#fbbf24" />
      <!-- Cœur rayonnant blanc -->
      <rect x="6" y="6" width="4" height="4" fill="#ffffff" />
      <rect x="7" y="7" width="2" height="2" fill="#fef08a" />
    </svg>
  `,

  // 7. Croissant de Lune Nocturne (16x16)
  moon: `
    <svg class="pixel-icon pixel-icon-moon" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Contour bleu nuit -->
      <path d="M7 1h4v1h2v2h1v4h-1v2h-1v1h-2v2h-1v1h-1v1H6v-1H4v-2H3v-2H2V7h1V5h1V3h1V2h2V1z" fill="#0f172a" />
      <!-- Croissant d'argent bleuté -->
      <rect x="6" y="2" width="5" height="12" fill="#67e8f9" />
      <rect x="5" y="3" width="7" height="10" fill="#67e8f9" />
      <rect x="7" y="2" width="4" height="12" fill="#a5f3fc" />
      <!-- Masque intérieur créant le croissant -->
      <rect x="3" y="4" width="4" height="8" fill="#0f172a" />
      <rect x="4" y="3" width="4" height="10" fill="#0f172a" />
      <rect x="5" y="5" width="3" height="6" fill="#0f172a" />
      <!-- Étoile céleste scintillante à gauche -->
      <rect x="2" y="8" width="1" height="1" fill="#ffffff" />
      <rect x="13" y="3" width="1" height="1" fill="#ffffff" />
      <rect x="12" y="12" width="1" height="1" fill="#38bdf8" />
    </svg>
  `,

  // 8. Citadelle / Donjon / Forteresse (16x16)
  castle: `
    <svg class="pixel-icon pixel-icon-castle" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Contour pierre sombre -->
      <path d="M2 3h3v2h2V3h2v2h2V3h3v11H2V3z" fill="#0f172a" />
      <!-- Créneaux et tours -->
      <rect x="3" y="4" width="2" height="3" fill="#475569" />
      <rect x="7" y="5" width="2" height="2" fill="#475569" />
      <rect x="11" y="4" width="2" height="3" fill="#475569" />
      <!-- Corps de la muraille en pierre -->
      <rect x="3" y="6" width="10" height="7" fill="#64748b" />
      <!-- Lignes d'appareil de pierre -->
      <rect x="3" y="8" width="10" height="1" fill="#334155" />
      <rect x="3" y="11" width="10" height="1" fill="#334155" />
      <rect x="6" y="6" width="1" height="2" fill="#334155" />
      <rect x="9" y="9" width="1" height="2" fill="#334155" />
      <!-- Porte ogivale cintrée en bois renforcé -->
      <rect x="6" y="10" width="4" height="3" fill="#78350f" />
      <rect x="7" y="9" width="2" height="1" fill="#78350f" />
      <!-- Clou et ferrure de porte -->
      <rect x="7" y="11" width="1" height="1" fill="#fbbf24" />
      <!-- Bannière au sommet de la tour gauche -->
      <rect x="3" y="1" width="1" height="3" fill="#e2e8f0" />
      <rect x="4" y="1" width="2" height="1" fill="#ef4444" />
    </svg>
  `,

  // 9. Épée Royale Tranchante (16x16)
  sword: `
    <svg class="pixel-icon pixel-icon-sword" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Pointe de la lame en haut à droite -->
      <rect x="14" y="0" width="1" height="1" fill="#ffffff" />
      <rect x="13" y="1" width="2" height="1" fill="#e2e8f0" />
      <rect x="12" y="2" width="2" height="1" fill="#cbd5e1" />
      <!-- Lame diagonale en acier trempé -->
      <rect x="11" y="3" width="2" height="2" fill="#f8fafc" />
      <rect x="9" y="5" width="2" height="2" fill="#f8fafc" />
      <rect x="7" y="7" width="2" height="2" fill="#f8fafc" />
      <rect x="5" y="9" width="2" height="2" fill="#f8fafc" />
      <!-- Tranchant sombre et fil de lame -->
      <rect x="10" y="2" width="2" height="1" fill="#94a3b8" />
      <rect x="8" y="4" width="2" height="1" fill="#64748b" />
      <rect x="6" y="6" width="2" height="1" fill="#64748b" />
      <rect x="4" y="8" width="2" height="1" fill="#475569" />
      <!-- Garde dorée en croix -->
      <rect x="6" y="10" width="2" height="2" fill="#f59e0b" />
      <rect x="3" y="7" width="2" height="2" fill="#f59e0b" />
      <rect x="4" y="8" width="1" height="1" fill="#fbbf24" />
      <rect x="7" y="11" width="1" height="1" fill="#fbbf24" />
      <rect x="5" y="9" width="1" height="1" fill="#b45309" />
      <!-- Poignée / Manche en cuir marron -->
      <rect x="2" y="12" width="2" height="2" fill="#78350f" />
      <rect x="3" y="11" width="2" height="2" fill="#92400e" />
      <!-- Pommeau d'or au bout -->
      <rect x="0" y="14" width="2" height="2" fill="#f59e0b" />
      <rect x="1" y="14" width="1" height="1" fill="#fde047" />
    </svg>
  `,

  // 10. Bouclier d'Écu Médiéval (16x16)
  shield: `
    <svg class="pixel-icon pixel-icon-shield" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Contour acier forgé -->
      <path d="M2 2h12v1h1v6h-1v2h-2v2h-2v1h-2v1H7v-1H5v-2H3v-2H1V9H0V3h1V2h1z" fill="#0f172a" />
      <!-- Cerclage d'acier -->
      <rect x="2" y="3" width="12" height="6" fill="#475569" />
      <rect x="3" y="9" width="10" height="2" fill="#475569" />
      <rect x="5" y="11" width="6" height="2" fill="#475569" />
      <rect x="7" y="13" width="2" height="1" fill="#475569" />
      <!-- Corps de l'écu bleu royal / pourpre -->
      <rect x="3" y="4" width="10" height="4" fill="#1e3a8a" />
      <rect x="4" y="8" width="8" height="2" fill="#1e3a8a" />
      <rect x="6" y="10" width="4" height="2" fill="#1e3a8a" />
      <!-- Croix de chevalier dorée au centre -->
      <rect x="7" y="4" width="2" height="7" fill="#f59e0b" />
      <rect x="4" y="6" width="8" height="2" fill="#f59e0b" />
      <!-- Bossage central en or brillant -->
      <rect x="7" y="6" width="2" height="2" fill="#fde047" />
      <!-- Reflet d'acier supérieur -->
      <rect x="2" y="2" width="6" height="1" fill="#cbd5e1" />
    </svg>
  `,

  // 11. Dash / Bottes Ailées de Vitesse (16x16)
  dash: `
    <svg class="pixel-icon pixel-icon-dash" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Traînée de vent et souffle d'esquive -->
      <rect x="0" y="4" width="4" height="1" fill="#38bdf8" />
      <rect x="1" y="6" width="3" height="1" fill="#7dd3fc" />
      <rect x="0" y="9" width="5" height="1" fill="#0ea5e9" />
      <rect x="2" y="11" width="3" height="1" fill="#38bdf8" />
      <!-- Ailes de mercure sur la botte -->
      <rect x="7" y="3" width="3" height="2" fill="#ffffff" />
      <rect x="8" y="2" width="3" height="2" fill="#f0f9ff" />
      <rect x="6" y="5" width="2" height="2" fill="#bae6fd" />
      <!-- Botte de cuir de ranger -->
      <rect x="9" y="4" width="3" height="5" fill="#78350f" />
      <rect x="10" y="4" width="2" height="5" fill="#92400e" />
      <!-- Semelle et pied lancé vers l'avant -->
      <rect x="8" y="9" width="6" height="3" fill="#78350f" />
      <rect x="9" y="9" width="6" height="2" fill="#b45309" />
      <rect x="14" y="10" width="2" height="2" fill="#b45309" />
      <!-- Semelle d'acier forgé -->
      <rect x="8" y="12" width="8" height="1" fill="#1e293b" />
    </svg>
  `,

  // 12. Grimoire des Arcanes Magiques (16x16)
  book: `
    <svg class="pixel-icon pixel-icon-book" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Reliure cuir sombre -->
      <path d="M2 1h12v1h1v12h-1v1H2V1z" fill="#2e1065" />
      <!-- Couverture pourpre arcanique -->
      <rect x="3" y="2" width="10" height="12" fill="#6b21a8" />
      <rect x="3" y="2" width="2" height="12" fill="#3b0764" />
      <!-- Coins de renfort en laiton doré -->
      <rect x="11" y="2" width="2" height="2" fill="#f59e0b" />
      <rect x="11" y="12" width="2" height="2" fill="#f59e0b" />
      <rect x="12" y="3" width="1" height="1" fill="#fef08a" />
      <!-- Tranche des pages en parchemin -->
      <rect x="13" y="3" width="1" height="10" fill="#fef3c7" />
      <!-- Rune magique / Gemme arcanique au centre -->
      <rect x="7" y="6" width="3" height="4" fill="#a855f7" />
      <rect x="8" y="5" width="1" height="6" fill="#c084fc" />
      <rect x="6" y="7" width="5" height="2" fill="#c084fc" />
      <rect x="8" y="7" width="1" height="2" fill="#ffffff" />
    </svg>
  `,

  // 13. Cor de Guerre / Mégaphone Son (16x16)
  sound: `
    <svg class="pixel-icon pixel-icon-sound" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Pavillon en cuivre du cor -->
      <rect x="2" y="6" width="3" height="4" fill="#78350f" />
      <rect x="5" y="4" width="3" height="8" fill="#b45309" />
      <rect x="8" y="2" width="3" height="12" fill="#f59e0b" />
      <rect x="9" y="3" width="2" height="10" fill="#fbbf24" />
      <!-- Embouchure -->
      <rect x="1" y="7" width="1" height="2" fill="#fde047" />
      <!-- Ondes sonores pixelisées -->
      <rect x="13" y="6" width="1" height="4" fill="#38bdf8" />
      <rect x="14" y="5" width="1" height="1" fill="#38bdf8" />
      <rect x="14" y="10" width="1" height="1" fill="#38bdf8" />
      <rect x="15" y="3" width="1" height="2" fill="#7dd3fc" />
      <rect x="15" y="11" width="1" height="2" fill="#7dd3fc" />
    </svg>
  `,

  // 14. Engrenage de Forge / Paramètres (16x16)
  gear: `
    <svg class="pixel-icon pixel-icon-gear" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Dents de l'engrenage -->
      <rect x="6" y="0" width="4" height="2" fill="#475569" />
      <rect x="6" y="14" width="4" height="2" fill="#475569" />
      <rect x="0" y="6" width="2" height="4" fill="#475569" />
      <rect x="14" y="6" width="2" height="4" fill="#475569" />
      <rect x="2" y="2" width="2" height="2" fill="#475569" />
      <rect x="12" y="2" width="2" height="2" fill="#475569" />
      <rect x="2" y="12" width="2" height="2" fill="#475569" />
      <rect x="12" y="12" width="2" height="2" fill="#475569" />
      <!-- Corps de la roue en fer usé -->
      <rect x="4" y="2" width="8" height="12" fill="#64748b" />
      <rect x="2" y="4" width="12" height="8" fill="#64748b" />
      <rect x="3" y="3" width="10" height="10" fill="#94a3b8" />
      <!-- Axe central évidé -->
      <rect x="6" y="6" width="4" height="4" fill="#0f172a" />
      <rect x="7" y="7" width="2" height="2" fill="#1e293b" />
    </svg>
  `,

  // 15. Stèle de Pause Médiévale (16x16)
  pause: `
    <svg class="pixel-icon pixel-icon-pause" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Deux piliers de pierre sacrée dressés -->
      <rect x="3" y="2" width="4" height="12" fill="#0f172a" />
      <rect x="9" y="2" width="4" height="12" fill="#0f172a" />
      <rect x="4" y="3" width="2" height="10" fill="#64748b" />
      <rect x="10" y="3" width="2" height="10" fill="#64748b" />
      <rect x="4" y="3" width="1" height="10" fill="#94a3b8" />
      <rect x="10" y="3" width="1" height="10" fill="#94a3b8" />
      <!-- Gravures runiques au centre des stèles -->
      <rect x="5" y="6" width="1" height="2" fill="#38bdf8" />
      <rect x="11" y="6" width="1" height="2" fill="#38bdf8" />
    </svg>
  `,

  // 16. Porte de Maison / Auberge (16x16)
  house: `
    <svg class="pixel-icon pixel-icon-house" viewBox="0 0 16 16" width="100%" height="100%" shape-rendering="crispEdges">
      <!-- Toit de chaume / ardoise triangulaire -->
      <rect x="7" y="1" width="2" height="1" fill="#78350f" />
      <rect x="5" y="2" width="6" height="1" fill="#78350f" />
      <rect x="3" y="3" width="10" height="1" fill="#92400e" />
      <rect x="1" y="4" width="14" height="2" fill="#b45309" />
      <!-- Murs à colombages -->
      <rect x="2" y="6" width="12" height="9" fill="#fef3c7" />
      <rect x="2" y="6" width="1" height="9" fill="#451a03" />
      <rect x="13" y="6" width="1" height="9" fill="#451a03" />
      <rect x="2" y="14" width="12" height="1" fill="#451a03" />
      <!-- Porte en chêne sombre -->
      <rect x="6" y="9" width="4" height="5" fill="#78350f" />
      <rect x="7" y="8" width="2" height="1" fill="#78350f" />
      <rect x="9" y="11" width="1" height="1" fill="#f59e0b" />
      <!-- Fenêtre allumée jaune chaude -->
      <rect x="4" y="8" width="2" height="2" fill="#fde047" />
    </svg>
  `
};

/**
 * Retourne le code HTML d'une icône par son identifiant.
 * @param {string} iconName Nom de l'icône dans PIXEL_ICONS
 * @param {number} size Taille en pixels (défaut 18)
 * @returns {string} Balise SVG pixel-art
 */
export function getPixelIcon(iconName, size = 18) {
  const iconSvg = PIXEL_ICONS[iconName];
  if (!iconSvg) return '';
  return `<span class="pixel-icon-wrapper" style="width:${size}px; height:${size}px; display:inline-flex; align-items:center; justify-content:center;">${iconSvg}</span>`;
}
