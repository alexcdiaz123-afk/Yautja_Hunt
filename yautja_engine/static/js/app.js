/**
 * Yautja Hunt - Engine Dashboard Logic
 */

let appState = null;
let challengesData = [];

/**
 * Renders a stylized vector skull for trophies (Hunting Red, Claimed Green, Locked Charcoal).
 */
function getSkullVectorSVG(status, size = 42) {
  let mainColor = '#ff2a2a';
  let fillColor = 'rgba(255, 42, 42, 0.16)';
  let eyeColor = '#ff1a1a';
  let glow = 'filter: drop-shadow(0 0 6px #ff2a2a);';
  let extraElements = '';

  if (status === 'claimed') {
    mainColor = '#00ff77';
    fillColor = 'rgba(0, 255, 119, 0.22)';
    eyeColor = '#00ff88';
    glow = 'filter: drop-shadow(0 0 8px #00ff77);';
    extraElements = `
      <circle cx="52" cy="11" r="9" fill="#082b14" stroke="#00ff77" stroke-width="1.8" />
      <text x="52" y="15" fill="#00ff77" font-size="11" font-weight="900" text-anchor="middle" font-family="monospace">✓</text>
    `;
  } else if (status === 'locked') {
    mainColor = '#4a2525';
    fillColor = 'rgba(18, 9, 9, 0.6)';
    eyeColor = '#120606';
    glow = 'opacity: 0.55;';
    extraElements = `
      <rect x="44" y="6" width="14" height="12" rx="2" fill="#1f0909" stroke="#552222" stroke-width="1.4" />
      <path d="M47 6 V4 A3.5 3.5 0 0 1 55 4 V6" fill="none" stroke="#552222" stroke-width="1.4" />
    `;
  } else {
    // Active hunting target: Tactical reticle around skull
    extraElements = `
      <circle cx="32" cy="28" r="26" fill="none" stroke="rgba(255, 42, 42, 0.22)" stroke-width="1" stroke-dasharray="3,3" />
      <line x1="32" y1="0" x2="32" y2="7" stroke="#ff2a2a" stroke-width="1.5" />
      <line x1="32" y1="49" x2="32" y2="56" stroke="#ff2a2a" stroke-width="1.5" />
      <line x1="4" y1="28" x2="11" y2="28" stroke="#ff2a2a" stroke-width="1.5" />
      <line x1="53" y1="28" x2="60" y2="28" stroke="#ff2a2a" stroke-width="1.5" />
    `;
  }

  return `
    <svg viewBox="0 0 64 64" width="${size}" height="${size}" style="${glow} vertical-align: middle;">
      ${extraElements}
      <!-- Cranium Vault -->
      <path d="M16 25 C16 11, 48 11, 48 25 C48 32, 44 37, 41 41 L41 49 C41 51.5, 38.5 53, 36 53 L28 53 C25.5 53, 23 51.5, 23 49 L23 41 C20 37, 16 32, 16 25 Z" 
            fill="${fillColor}" stroke="${mainColor}" stroke-width="2.2" stroke-linejoin="round" />
      <!-- Brow Ridge -->
      <path d="M19 22 Q32 25 45 22" fill="none" stroke="${mainColor}" stroke-width="1.5" stroke-linecap="round" />
      <!-- Left Eye Socket -->
      <ellipse cx="24" cy="27" rx="4.5" ry="5.5" transform="rotate(7 24 27)" fill="${eyeColor}" stroke="${mainColor}" stroke-width="1.2" />
      <!-- Right Eye Socket -->
      <ellipse cx="40" cy="27" rx="4.5" ry="5.5" transform="rotate(-7 40 27)" fill="${eyeColor}" stroke="${mainColor}" stroke-width="1.2" />
      <!-- Nasal Aperture (Inverted Triangle) -->
      <polygon points="32,33 29.5,39 34.5,39" fill="${eyeColor}" stroke="${mainColor}" stroke-width="1" />
      <!-- Zygomatic Arches (Cheekbones) -->
      <path d="M17 32 L21 36 M47 32 L43 36" stroke="${mainColor}" stroke-width="1.4" stroke-linecap="round" />
      <!-- Teeth & Maxilla Cuts -->
      <line x1="27" y1="45" x2="27" y2="51" stroke="${mainColor}" stroke-width="1.5" />
      <line x1="32" y1="44" x2="32" y2="52" stroke="${mainColor}" stroke-width="1.5" />
      <line x1="37" y1="45" x2="37" y2="51" stroke="${mainColor}" stroke-width="1.5" />
      <line x1="24" y1="47" x2="40" y2="47" stroke="${mainColor}" stroke-width="1.1" />
      <!-- Trophy Vertebrae (Spine Fragment) -->
      <rect x="29" y="54.5" width="6" height="3" rx="1" fill="${fillColor}" stroke="${mainColor}" stroke-width="1.2" />
      <rect x="27.5" y="58.5" width="9" height="3" rx="1" fill="${fillColor}" stroke="${mainColor}" stroke-width="1.2" />
    </svg>
  `;
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  if (typeof generateBrazaleteGrid === 'function') {
    generateBrazaleteGrid('brazaleteAlphabetGrid');
  } else if (typeof generateCodexGrid === 'function') {
    generateCodexGrid('brazaleteAlphabetGrid');
  }
});

async function loadData() {
  try {
    const [challengesRes, statusRes] = await Promise.all([
      fetch('/api/challenges'),
      fetch('/api/status')
    ]);

    challengesData = (await challengesRes.json()).challenges;
    appState = await statusRes.json();

    renderDashboard();
  } catch (err) {
    console.error("Error loading Yautja Hunt data:", err);
  }
}

function setupEventListeners() {
  // Flag Submission Form
  const form = document.getElementById('flagForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('flagInput');
      const flag = input.value.trim();
      if (!flag) return;

      submitFlag(flag);
    });
  }

  // Live Translator Input
  const translatorInput = document.getElementById('translatorInput');
  if (translatorInput) {
    translatorInput.addEventListener('input', (e) => {
      handleBrazaleteInputChange(e.target.value);
    });
  }
}

function renderDashboard() {
  if (!appState || !challengesData) return;

  // Update HUD
  const honorEl = document.getElementById('hudHonor');
  if (honorEl) {
    honorEl.textContent = appState.honor_score;
    if (appState.honor_score <= (appState.berserker_trigger_honor || 800)) {
      honorEl.style.color = '#ff0033';
      honorEl.title = '¡Alerta de deshonor! Honor en límite Berserker (≤ 800)';
    } else {
      honorEl.style.color = '#ff9900';
      honorEl.title = 'Honor Yautja disponible';
    }
  }

  document.getElementById('hudSkullsCount').textContent = `${appState.claimed_skulls.length} / 15`;
  
  const hudRankEl = document.getElementById('hudRank');
  const berserkerHudItem = document.getElementById('berserkerHudItem');
  const hudBerserkerCount = document.getElementById('hudBerserkerCount');
  const berserkerAlertBanner = document.getElementById('berserkerAlertBanner');
  const rankBannerTitle = document.getElementById('rankBannerTitle');
  const rankBannerCategory = document.getElementById('rankBannerCategory');
  const rankBannerSubtext = document.getElementById('rankBannerSubtext');

  if (appState.is_berserker) {
    document.body.classList.add('berserker-mode');
    if (hudRankEl) {
      hudRankEl.textContent = `BERSERKER [${appState.berserker_clean_skulls || 0}/3]`;
      hudRankEl.style.color = '#ff0033';
    }
    if (berserkerHudItem) {
      berserkerHudItem.style.display = 'flex';
      if (hudBerserkerCount) {
        hudBerserkerCount.textContent = `${appState.berserker_clean_skulls || 0} / ${appState.berserker_skulls_needed || 3} LIMPIOS`;
      }
    }
    if (berserkerAlertBanner) berserkerAlertBanner.style.display = 'flex';

    if (rankBannerTitle) rankBannerTitle.textContent = 'RANGO: BERSERKER (MALA SANGRE)';
    if (rankBannerCategory) {
      rankBannerCategory.textContent = 'PENITENCIA POR DESHONOR';
      rankBannerCategory.style.color = '#ff1a40';
    }
    if (rankBannerSubtext) {
      rankBannerSubtext.innerHTML = '<span style="color:#ff4d6d;font-weight:bold;">¡Rango noble suspendido!</span> Exige 3 cráneos limpios para redención.';
    }

    // Update slots
    const cleanCount = appState.berserker_clean_skulls || 0;
    for (let s = 1; s <= 3; s++) {
      const slot = document.getElementById(`bslot_${s}`);
      if (slot) {
        if (s <= cleanCount) {
          slot.classList.add('redeemed');
          slot.textContent = '✓';
        } else {
          slot.classList.remove('redeemed');
          slot.textContent = s;
        }
      }
    }
  } else {
    document.body.classList.remove('berserker-mode');
    if (hudRankEl) {
      hudRankEl.textContent = appState.current_rank;
      hudRankEl.style.color = '#ff7733';
    }
    if (berserkerHudItem) berserkerHudItem.style.display = 'none';
    if (berserkerAlertBanner) berserkerAlertBanner.style.display = 'none';

    if (rankBannerTitle) rankBannerTitle.textContent = `RANGO ACTUAL: ${appState.current_rank}`;
    if (rankBannerCategory) {
      rankBannerCategory.textContent = 'ASCENSO DE CACERÍA';
      rankBannerCategory.style.color = '#885555';
    }
    if (rankBannerSubtext) {
      rankBannerSubtext.innerHTML = 'Sangre Joven (1-3) &rarr; Sangrado (4-7) &rarr; Élite (8-11) &rarr; Anciano (12-14) &rarr; Ancestral (15)';
    }
  }

  renderTrackerTrack();
  renderTrophyRack();
  renderChallenges();
}

function renderTrackerTrack() {
  const waypointsContainer = document.getElementById('trackerWaypoints');
  const railFill = document.getElementById('trackerRailFill');
  const runnerAvatar = document.getElementById('predatorRunnerAvatar');
  const targetLabel = document.getElementById('trackerTargetLabel');
  const progressCount = document.getElementById('trackerProgressCount');
  const hunterCallout = document.getElementById('hunterCallout');

  if (!waypointsContainer || !appState) return;

  const claimedCount = appState.claimed_skulls ? appState.claimed_skulls.length : 0;
  
  // Find current target skull index (0 to 14)
  let currentTargetIndex = 0;
  for (let i = 1; i <= 15; i++) {
    const skullId = `skull_${String(i).padStart(2, '0')}`;
    if (!appState.claimed_skulls.includes(skullId)) {
      currentTargetIndex = i - 1;
      break;
    }
    if (i === 15) currentTargetIndex = 14;
  }

  // Calculate progress on the rail
  const percentFill = (claimedCount / 15) * 100;
  // Hunter avatar traverses from 0% (Skull 1) to 100% (Skull 15)
  const hunterLeft = (currentTargetIndex / 14) * 100;

  if (railFill) railFill.style.width = `${percentFill}%`;
  if (runnerAvatar) runnerAvatar.style.left = `${hunterLeft}%`;

  if (progressCount) progressCount.textContent = `${claimedCount} / 15 CRÁNEOS`;

  if (claimedCount === 15) {
    if (targetLabel) targetLabel.textContent = '¡CACERÍA SUPREMA! TODOS LOS CRÁNEOS COBRADOS';
    if (hunterCallout) hunterCallout.textContent = 'ANCESTRAL';
  } else if (appState.is_berserker) {
    if (targetLabel) targetLabel.textContent = `ACECHANDO SKULL ${String(currentTargetIndex + 1).padStart(2, '0')} // MODO BERSERKER`;
    if (hunterCallout) hunterCallout.textContent = `BERSERKER [${appState.berserker_clean_skulls || 0}/3]`;
  } else {
    if (targetLabel) targetLabel.textContent = `ACECHANDO SKULL ${String(currentTargetIndex + 1).padStart(2, '0')}`;
    if (hunterCallout) hunterCallout.textContent = `SKULL ${currentTargetIndex + 1}`;
  }

  // Render the 15 telemetry waypoints along the track
  let wpHTML = '';
  for (let i = 1; i <= 15; i++) {
    const skullId = `skull_${String(i).padStart(2, '0')}`;
    const isClaimed = appState.claimed_skulls.includes(skullId);
    const isTarget = (i - 1 === currentTargetIndex) && !isClaimed;
    const isUnlocked = isSkullUnlocked(i);

    let wpClass = 'rail-waypoint';
    if (isClaimed) wpClass += ' claimed';
    else if (isTarget) wpClass += ' active-target';
    else if (!isUnlocked) wpClass += ' locked';

    wpHTML += `
      <div class="${wpClass}" title="Sector Skull ${i}${isClaimed ? ' (Cobrado ✓)' : (isTarget ? ' [OBJETIVO]' : ' [BLOQUEADO]')}">
        ${isClaimed ? '✓' : i}
      </div>
    `;
  }
  waypointsContainer.innerHTML = wpHTML;
}

function isSkullUnlocked(skullNumber) {
  if (!appState || !appState.claimed_skulls) return skullNumber <= 3;
  const count = appState.claimed_skulls.length;
  if (skullNumber <= 3) return true; // Sangre Joven (Skulls 1-3)
  if (skullNumber <= 7) return count >= 3; // Sangrado (Skulls 4-7)
  if (skullNumber <= 11) return count >= 7; // Élite (Skulls 8-11)
  if (skullNumber <= 14) return count >= 11; // Anciano (Skulls 12-14)
  if (skullNumber === 15) return count >= 14; // Ancestral (Skull 15)
  return false;
}

function renderTrophyRack() {
  const rack = document.getElementById('trophyRack');
  if (!rack) return;

  // Find active hunting target skull index
  let currentTargetIndex = 0;
  for (let k = 1; k <= 15; k++) {
    const sId = `skull_${String(k).padStart(2, '0')}`;
    if (!appState.claimed_skulls.includes(sId)) {
      currentTargetIndex = k - 1;
      break;
    }
    if (k === 15) currentTargetIndex = 14;
  }

  let html = '';
  for (let i = 1; i <= 15; i++) {
    const skullId = `skull_${String(i).padStart(2, '0')}`;
    const isClaimed = appState.claimed_skulls.includes(skullId);
    const isUnlocked = isSkullUnlocked(i);
    const isTarget = (i - 1 === currentTargetIndex) && !isClaimed;

    let statusKey = 'active';
    let statusBadgeText = 'EN MIRA';
    let statusBadgeColor = '#ff4d6d';
    let labelColor = '#ff3b3b';
    let tooltip = 'Presa en la Mira del Cazador';

    if (isClaimed) {
      statusKey = 'claimed';
      statusBadgeText = 'COBRADO';
      statusBadgeColor = '#00ff77';
      labelColor = '#00ff77';
      tooltip = 'Cráneo Capturado (✓)';
    } else if (isTarget) {
      statusKey = 'active';
      statusBadgeText = '>> BLANCO';
      statusBadgeColor = '#ff2222';
      labelColor = '#ff2222';
      tooltip = '[OBJETIVO] Actual fijado por el Cazador Yautja';
    } else if (!isUnlocked) {
      statusKey = 'locked';
      statusBadgeText = 'BLOQUEADO';
      statusBadgeColor = '#664444';
      labelColor = '#664444';
      if (i <= 7) tooltip = 'Bloqueado: Requiere Rango Sangrado (3 Cráneos previos)';
      else if (i <= 11) tooltip = 'Bloqueado: Requiere Rango Élite (7 Cráneos previos)';
      else if (i <= 14) tooltip = 'Bloqueado: Requiere Rango Anciano (11 Cráneos previos)';
      else tooltip = 'Bloqueado: Requiere Rango Ancestral (14 Cráneos previos)';
    }

    const skullSVG = getSkullVectorSVG(statusKey, 42);

    html += `
      <div class="skull-trophy ${statusKey === 'active' ? 'active-target' : statusKey} ${isTarget ? 'current-hunt-focus' : ''}" 
           title="${tooltip}">
        <div class="skull-icon-wrapper">
          ${skullSVG}
        </div>
        <div style="font-size:0.75rem; font-weight:900; color:${labelColor}; letter-spacing:1px; margin-top:2px;">
          SKULL ${i}
        </div>
        <div class="skull-status-badge" style="color:${statusBadgeColor}; font-weight: ${isTarget ? '900' : '700'};">
          ${statusBadgeText}
        </div>
      </div>
    `;
  }
  rack.innerHTML = html;
}

function renderChallenges() {
  const container = document.getElementById('challengesList');
  if (!container) return;

  const isThermal = document.body.classList.contains('thermal-vision');
  const banner = document.getElementById('thermalModeBanner');
  if (banner) {
    banner.style.display = isThermal ? 'flex' : 'none';
  }

  let html = '';
  for (const c of challengesData) {
    const isClaimed = appState.claimed_skulls.includes(c.id);
    const isUnlocked = isSkullUnlocked(c.number);

    // Rank Badge Class
    let rankBadgeClass = 'badge-rank-young';
    if (c.rank === 'Sangrado') rankBadgeClass = 'badge-rank-blooded';
    else if (c.rank === 'Élite') rankBadgeClass = 'badge-rank-elite';
    else if (c.rank === 'Anciano') rankBadgeClass = 'badge-rank-elder';
    else if (c.rank === 'Ancestral') rankBadgeClass = 'badge-rank-ancestral';

    if (!isUnlocked) {
      // ESTADO BLOQUEADO POR RANGO INSUFICIENTE
      if (isThermal) {
        html += `
          <div class="challenge-card locked-rank" id="card_${c.id}">
            <div class="challenge-header">
              <div class="challenge-header-left">
                <span class="challenge-title" style="color: #668899;">[BLOQUEADO] ${c.title}</span>
                <span class="badge-tag ${rankBadgeClass}">${c.rank}</span>
                <span class="badge-tag" style="background: rgba(80,80,80,0.2); color: #888; border: 1px solid #555;">
                  ${c.skill}
                </span>
              </div>
              <div class="challenge-header-right">
                <span class="badge-tag badge-locked-rank">[ FRECUENCIA BLOQUEADA ]</span>
              </div>
            </div>
            <div class="locked-rank-notice" style="border-color: rgba(0,229,255,0.2); background: rgba(0,229,255,0.03);">
              <div style="font-size: 1.3rem; font-family: monospace; font-weight: bold; color: #00e5ff;">[ ⊘ ]</div>
              <div>
                <div style="font-weight: bold; color: #00e5ff; letter-spacing: 1px;">ESCÁNER TÁCTICO // FRECUENCIA BLOQUEADA</div>
                <div style="font-size: 0.82rem; color: #80d8ff; margin-top: 3px;">
                  El análisis espectral de este vector requiere el rango <strong>${c.rank}</strong>. Captura los cráneos de rangos anteriores para sintonizar el escáner táctico.
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="challenge-card locked-rank" id="card_${c.id}">
            <div class="challenge-header">
              <div class="challenge-header-left">
                <span class="challenge-title" style="color: #774444;">[BLOQUEADO] ${c.title}</span>
                <span class="badge-tag ${rankBadgeClass}">${c.rank}</span>
                <span class="badge-tag" style="background: rgba(40,15,15,0.6); color: #885555;">${c.skill}</span>
              </div>
              <div class="challenge-header-right">
                <span class="badge-tag badge-locked-rank">[ REQUIERE RANGO ${c.rank.toUpperCase()} ]</span>
              </div>
            </div>
            <div class="locked-rank-notice">
              <div style="font-size: 1.3rem; font-family: monospace; font-weight: bold; color: var(--y-red);">[ ⊘ ]</div>
              <div>
                <div style="font-weight: bold; color: #ff5555; letter-spacing: 1px;">PRESA BLOQUEADA — RANGO INSUFICIENTE</div>
                <div style="font-size: 0.82rem; color: #aa7777; margin-top: 3px;">
                  Este desafío está reservado para cazadores de rango <strong>${c.rank}</strong> o superior. Reclama los cráneos de rangos previos para desbloquear su rastro en tu consola.
                </div>
              </div>
            </div>
          </div>
        `;
      }
    } else if (isThermal) {
      // MODO ESCÁNER TÁCTICO DESBLOQUEADO: Despliega la TEORÍA y METODOLOGÍA sin dar las respuestas
      html += `
        <div class="challenge-card ${isClaimed ? 'completed' : 'hunting'}" id="card_${c.id}">
          <div class="challenge-header">
            <div class="challenge-header-left">
              <span class="challenge-title" style="color: #00e5ff;">${c.title}</span>
              <span class="badge-tag ${rankBadgeClass}">${c.rank}</span>
              <span class="badge-tag" style="background: rgba(0,229,255,0.15); color: #00e5ff; border: 1px solid #00e5ff;">
                ${c.skill}
              </span>
            </div>
            <div class="challenge-header-right">
              <span class="badge-tag" style="background: rgba(255, 102, 0, 0.25); color: #ff6600; border: 1px solid #ff6600; font-weight: bold;">
                [ ESCÁNER TÁCTICO // MARCO TEÓRICO ]
              </span>
            </div>
          </div>

          <div class="thermal-theory-box">
            <div class="theory-section-title">[+] CONCEPTO DE SEGURIDAD & VULNERABILIDAD:</div>
            <p class="theory-text">${c.theory ? c.theory.concept : 'Análisis teórico no disponible.'}</p>

            <div class="theory-section-title">[+] METODOLOGÍA Y HERRAMIENTAS RECOMENDADAS:</div>
            <p class="theory-text">${c.theory ? c.theory.tools : 'N/A'}</p>

            <div class="theory-section-title">[+] ENFOQUE Y RAZONAMIENTO DEL ANALISTA:</div>
            ${appState.is_berserker ? `
              <div class="theory-berserker-warning">
                [!] INTERFERENCIA DE FRENESÍ BERSERKER: El deshonor nubla los sensores de orientación paso a paso.
                Debes examinar los servicios y utilizar las herramientas sugeridas (${c.theory ? c.theory.tools : 'herramientas de Kali'}) para deducir el vector de explotación por tu cuenta.
              </div>
            ` : `
              <p class="theory-text" style="color: #80d8ff;">${c.theory ? c.theory.approach : 'N/A'}</p>
            `}

            <div class="theory-section-title">[+] MEDIDAS DE MITIGACIÓN Y HARDENING:</div>
            <p class="theory-text" style="color: #69f0ae;">${c.theory ? c.theory.mitigation : 'N/A'}</p>
          </div>

          <div style="margin-top: 12px; font-size: 0.8rem; color: #80d8ff; display: flex; justify-content: space-between; align-items: center;">
            <span>[✓] Escáner de conocimiento activo (Orientación teórica sin penalización de honor).</span>
            <span style="color: ${isClaimed ? '#39ff14' : '#ff6600'}; font-weight: bold;">
              ${isClaimed ? '✓ CRÁNEO COBRADO' : `VALOR: +${c.points} HONOR`}
            </span>
          </div>
        </div>
      `;
    } else {
      // MODO NORMAL (BIOMÁSCARA) DESBLOQUEADO: Muestra narrativa de cacería y pistas en glifos Yautja
      html += `
        <div class="challenge-card ${isClaimed ? 'completed' : 'hunting'}" id="card_${c.id}">
          <div class="challenge-header">
            <div class="challenge-header-left">
              <span class="challenge-title">${c.title}</span>
              <span class="badge-tag ${rankBadgeClass}">${c.rank}</span>
              <span class="badge-tag" style="background: rgba(0,210,255,0.1); color: #00d2ff;">${c.skill}</span>
            </div>
            <div class="challenge-header-right">
              <div style="text-align: right;">
                <div style="color: ${isClaimed ? '#00ff77' : '#ff4d6d'}; font-weight: bold; font-size: 1.1rem;">
                  ${isClaimed ? '✓ CRÁNEO RECLAMADO' : `+${c.points} HONOR`}
                </div>
                <div style="font-size: 0.75rem; color: #886666;">Dificultad: ${c.difficulty}</div>
              </div>
            </div>
          </div>

          <p style="color: #d1c4c4; font-size: 0.92rem; line-height: 1.5; margin-bottom: 1rem;">
            ${c.description}
          </p>

          <!-- Hints System -->
          <div class="hints-container">
            <div style="font-size: 0.85rem; color: #ff8888; font-weight: bold; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <span>[ PISTAS EN ESCRITURA YAUTJA // BRAZALETE ]</span>
              <span style="font-size: 0.75rem; color: #886666;">Descifra los glifos con tu Brazalete</span>
            </div>
            ${renderHintsForChallenge(c)}
          </div>
        </div>
      `;
    }
  }
  container.innerHTML = html;
}

function renderHintsForChallenge(challenge) {
  if (!challenge.hints || challenge.hints.length === 0) {
    return '<div style="color: #664444; font-size: 0.8rem;">Sin pistas registradas.</div>';
  }

  const unlockedList = appState.unlocked_hints[challenge.id] || [];
  let html = '';

  for (const h of challenge.hints) {
    const isUnlocked = unlockedList.includes(h.level);

    if (isUnlocked) {
      const runes = textToYautjaRunes(h.yautja_text);
      const safeText = (h.yautja_text || '').replace(/'/g, "\\'");
      const safeRunes = runes.replace(/'/g, "\\'");

      html += `
        <div class="hint-row" style="border-left: 3px solid #ff2a2a; flex-direction: column; align-items: flex-start; margin-bottom: 12px; padding: 10px;">
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <span style="color: #ff9999; font-weight: bold; font-size: 0.85rem;">[PISTA NIVEL ${h.level}: ${h.title.toUpperCase()}]</span>
            <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
              <button class="btn-unlock-hint" onclick="copyHintRunes('${safeRunes}')" title="Copiar símbolos alienígenas al portapapeles" style="font-size: 0.75rem; padding: 3px 8px; border-color: #ff7700; color: #ffaa44;">
                📋 COPIAR SÍMBOLOS
              </button>
              <button class="btn-unlock-hint" onclick="openBrazaleteWithRunes('${safeRunes}')" title="Abrir y descifrar automáticamente en el Brazalete Yautja" style="font-size: 0.75rem; padding: 3px 8px; border-color: #00d2ff; color: #00d2ff;">
                🛸 ABRIR EN BRAZALETE
              </button>
            </div>
          </div>
          <div class="hint-content" id="hint_content_${challenge.id}_${h.level}" style="width: 100%;">
            <div class="hint-yautja-box" style="margin: 8px 0; background: #000; padding: 12px; border-radius: 4px; border: 1px solid #331111;">
              ${renderYautjaString(h.yautja_text, 24, '#ff2222')}
              
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #331111; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                <span style="font-size: 0.75rem; color: #885555;">SÍMBOLOS SELECCIONABLES (COPIA CON CLIC O ARRASTRE):</span>
                <span class="yautja-runes-selectable" style="color: #ff4444; font-family: monospace; font-size: 1.15rem; letter-spacing: 2px; user-select: all; cursor: pointer; background: #080303; padding: 2px 8px; border-radius: 3px; border: 1px solid #2a0808;" onclick="copyHintRunes('${safeRunes}')" title="Haz clic para copiar los símbolos">${runes}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      if (appState.is_berserker) {
        if (h.level === 3) {
          html += `
            <div class="hint-row" style="border-left: 3px solid #66111a;">
              <div>
                <span style="color: #995555; font-size: 0.85rem;">Pista Nivel 3 (${h.title})</span>
                <span style="color: #ff3344; font-size: 0.75rem; margin-left: 10px; font-weight: bold;">[BLOQUEO BERSERKER: SIN PISTAS DIRECTAS]</span>
              </div>
              <span class="btn-unlock-hint berserker-disabled">[ DESACTIVADA EN BERSERKER ]</span>
            </div>
          `;
        } else {
          const bCost = Math.round(h.cost * 1.5);
          html += `
            <div class="hint-row" style="border-left: 3px solid #ff0033;">
              <div>
                <span style="color: #aaa; font-size: 0.85rem;">Pista Nivel ${h.level} (${h.title})</span>
                <span style="color: #ff3344; font-size: 0.75rem; margin-left: 10px;">Penalización Berserker: -${bCost} Honor</span>
              </div>
              <button class="btn-unlock-hint" style="border-color: #ff0033; color: #ff6677;" onclick="unlockHint('${challenge.id}', ${h.level}, ${bCost})">
                Desbloquear (-${bCost} Honor) [Reinicia Redención]
              </button>
            </div>
          `;
        }
      } else {
        html += `
          <div class="hint-row">
            <div>
              <span style="color: #aaa; font-size: 0.85rem;">Pista Nivel ${h.level} (${h.title})</span>
              <span style="color: #ff5555; font-size: 0.75rem; margin-left: 10px;">Penalización: -${h.cost} Honor</span>
            </div>
            <button class="btn-unlock-hint" onclick="unlockHint('${challenge.id}', ${h.level}, ${h.cost})">
              Desbloquear Pista en Glifos (-${h.cost})
            </button>
          </div>
        `;
      }
    }
  }

  return html;
}

function toggleHintTranslation(challengeId, level) {
  const container = document.getElementById(`hint_content_${challengeId}_${level}`);
  if (!container) return;
  const plainBox = container.querySelector('.hint-plain-box');
  if (plainBox) {
    plainBox.style.display = plainBox.style.display === 'none' ? 'block' : 'none';
  }
}

async function unlockHint(challengeId, level, cost) {
  if (appState.honor_score < cost) {
    alert("¡Honor insuficiente para reclamar esta pista ancestral!");
    return;
  }

  if (appState.is_berserker) {
    if (level === 3) {
      alert("¡BLOQUEO BERSERKER!\n\nUn cazador en frenesí no recibe pistas de solución directa (Nivel 3). Debes deducir el vector con tu propia astucia.");
      return;
    }
    const needed = appState.berserker_skulls_needed || 3;
    if (!confirm(`[ADVERTENCIA BERSERKER]\nDesbloquear esta pista cuesta ${cost} puntos de honor y REINICIARÁ tu progreso de redención a 0/${needed} cráneos limpios.\n\n¿Deseas continuar?`)) {
      return;
    }
  } else {
    const trigger = appState.berserker_trigger_honor || 800;
    const remaining = appState.honor_score - cost;
    if (remaining <= trigger) {
      if (!confirm(`⚠️ ¡ADVERTENCIA DE DESHONOR!\nSi descifras esta pista por ${cost} puntos, tu honor caerá a ${remaining} pts (≤ ${trigger}).\n\n¡SERÁS DEGRADADO AL RANGO BERSERKER Y PERDERÁS TU RANGO NOBLE!\n\n¿Deseas descifrarla de todas formas?`)) {
        return;
      }
    } else {
      if (!confirm(`¿Deseas descifrar esta pista por ${cost} puntos de honor?`)) return;
    }
  }

  try {
    const res = await fetch('/api/unlock_hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge_id: challengeId, level: level })
    });
    const result = await res.json();
    if (result.success) {
      appState = result.state;
      renderDashboard();

      if (result.became_berserker) {
        alert(
          "⚡ ¡ALERTA DE DESHONOR YAUTJA! ⚡\n\n" +
          "Tu honor ha descendido a " + result.state.honor_score + " puntos (límite ≤ 800).\n" +
          "Has sido despojado de tu casta noble y degradado al rango BERSERKER.\n\n" +
          "Efectos activos de Berserker:\n" +
          "• Pistas directas (Nivel 3) BLOQUEADAS.\n" +
          "• Recargo de honor en pistas restantes (+50%).\n" +
          "• Interferencia táctica en el visor térmico.\n" +
          "• Defensas perimetrales de OWLF en alerta reforzada.\n\n" +
          "Para salir de Berserker y restaurar tu rango, debes capturar 3 cráneos de forma limpia (sin usar pistas)."
        );
      }
    } else {
      alert(result.message || "Error al desbloquear pista.");
    }
  } catch (err) {
    console.error(err);
  }
}

async function submitFlag(flag) {
  const statusMsg = document.getElementById('flagStatusMsg');
  statusMsg.innerHTML = '<span style="color:#ffb703;">Analizando firma de honor del cráneo...</span>';

  try {
    const res = await fetch('/api/submit_flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag: flag })
    });

    const data = await res.json();

    if (data.success) {
      document.getElementById('flagInput').value = '';
      const oldRank = appState ? appState.current_rank : null;
      appState = data.state;
      renderDashboard();
      playSuccessEffect();

      if (data.redeemed) {
        statusMsg.innerHTML = `<span style="color:#00ff77; font-weight:bold;">¡REDENCIÓN YAUTJA! Cráneo capturado y has purificado el deshonor. ¡Restaurado rango ${data.new_rank.toUpperCase()}!</span>`;
      } else if (data.is_berserker) {
        const needed = data.state.berserker_skulls_needed || 3;
        if (data.was_clean) {
          statusMsg.innerHTML = `<span style="color:#ffaa00; font-weight:bold;">¡CRÁNEO COBRADO SIN PISTAS! Penitencia Berserker: ${data.state.berserker_clean_skulls}/${needed} limpios.</span>`;
        } else {
          statusMsg.innerHTML = `<span style="color:#ff4d6d; font-weight:bold;">¡Cráneo cobrado! Pero usaste pistas. En Berserker la redención exige cráneos puros sin auxilio (Progreso reiniciado a 0/${needed}).</span>`;
        }
      } else {
        statusMsg.innerHTML = `<span style="color:#00ff77; font-weight:bold;">¡CRÁNEO CAPTURADO! +${data.points_added} Honor. ${data.message}</span>`;
      }

      // Trigger celebratory Predator trophy animation!
      triggerSkullTrophyCelebration(data, oldRank);
    } else {
      statusMsg.innerHTML = `<span style="color:#ff4d6d; font-weight:bold;">✕ PRESA ERRÓNEA: ${data.message}</span>`;
    }
  } catch (err) {
    statusMsg.innerHTML = '<span style="color:#ff4d6d;">Error en la comunicación con el Yautja Engine.</span>';
  }
}

function playSuccessEffect() {
  // Flash biomask effect
  document.body.style.boxShadow = 'inset 0 0 100px #00ff66';
  setTimeout(() => {
    document.body.style.boxShadow = 'none';
  }, 700);
}

// Brazalete Yautja Modal & Universal Cipher Controller
window.lastCopiedRunes = '';

function openBrazaleteModal() {
  const modal = document.getElementById('brazaleteModal') || document.getElementById('codexModal');
  if (modal) modal.style.display = 'flex';
  const input = document.getElementById('translatorInput');
  if (input) {
    if (!input.value.trim() && window.lastCopiedRunes) {
      input.value = window.lastCopiedRunes;
    }
    handleBrazaleteInputChange(input.value);
    input.focus();
  }
}

function closeBrazaleteModal() {
  const modal = document.getElementById('brazaleteModal') || document.getElementById('codexModal');
  if (modal) modal.style.display = 'none';
}

function selectBrazaleteRune(rune, char) {
  const input = document.getElementById('translatorInput');
  if (input) {
    input.value += (rune || char);
    input.dispatchEvent(new Event('input'));
  }
}

function selectBrazaleteLetter(char) {
  const rune = (window.YAUTJA_UNICODE_MAP && window.YAUTJA_UNICODE_MAP[char]) || char;
  selectBrazaleteRune(rune, char);
}

function handleBrazaleteInputChange(rawVal) {
  rawVal = rawVal || '';
  const trimmed = rawVal.trim();
  const badge = document.getElementById('brazaleteModeBadge');
  const decodedEl = document.getElementById('brazaleteDecodedOutput');
  const runesEl = document.getElementById('brazaleteRunesOutput');
  const outputSvg = document.getElementById('translatorOutput');

  if (!trimmed) {
    if (badge) {
      badge.textContent = 'MODO: EN ESPERA';
      badge.style.color = '#888';
      badge.style.borderColor = '#444';
      badge.style.background = 'rgba(255,255,255,0.05)';
    }
    if (decodedEl) decodedEl.textContent = '(Pega símbolos o escribe en la caja superior para ver el resultado)';
    if (runesEl) runesEl.textContent = '—';
    if (outputSvg) outputSvg.innerHTML = renderYautjaString('YAUTJA', 24, '#ff2222');
    return;
  }

  if (isYautjaRunic(trimmed)) {
    // Mode: Deciphering Yautja Runes -> Latin Spanish
    const decoded = yautjaRunesToText(trimmed);
    if (badge) {
      badge.textContent = 'MODO: DESCIFRANDO GLIFOS YAUTJA ➔ ESPAÑOL';
      badge.style.color = '#00ff88';
      badge.style.borderColor = '#00ff88';
      badge.style.background = 'rgba(0,255,136,0.1)';
    }
    if (decodedEl) decodedEl.textContent = decoded;
    if (runesEl) runesEl.textContent = trimmed;
    if (outputSvg) outputSvg.innerHTML = renderYautjaString(decoded, 24, '#ff2222');
  } else {
    // Mode: Transcribing Latin Spanish -> Yautja Runes
    const upper = trimmed.toUpperCase();
    const runes = textToYautjaRunes(upper);
    if (badge) {
      badge.textContent = 'MODO: TRANSCRIBIENDO ESPAÑOL ➔ GLIFOS YAUTJA';
      badge.style.color = '#00d2ff';
      badge.style.borderColor = '#00d2ff';
      badge.style.background = 'rgba(0,210,255,0.1)';
    }
    if (decodedEl) decodedEl.textContent = upper;
    if (runesEl) runesEl.textContent = runes;
    if (outputSvg) outputSvg.innerHTML = renderYautjaString(upper, 24, '#ff2222');
  }
}

function copyHintRunes(runes) {
  if (!runes) return;
  window.lastCopiedRunes = runes;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(runes).then(() => {
      alert(`[BRAZALETE YAUTJA]\n\n¡Símbolos alienígenas copiados al portapapeles!\n\n${runes}\n\nPuedes abrirlos en el Brazalete con el botón [🛸 ABRIR EN BRAZALETE] o pegarlos con Ctrl+V.`);
    }).catch(() => {
      prompt("Copia los símbolos alienígenas:", runes);
    });
  } else {
    prompt("Copia los símbolos alienígenas:", runes);
  }
}

function openBrazaleteWithRunes(runes) {
  window.lastCopiedRunes = runes;
  openBrazaleteModal();
  const input = document.getElementById('translatorInput');
  if (input) {
    input.value = runes;
    input.dispatchEvent(new Event('input'));
  }
}

async function pasteToBrazalete() {
  const input = document.getElementById('translatorInput');
  if (!input) return;

  if (navigator.clipboard && navigator.clipboard.readText) {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        input.value = text;
        input.dispatchEvent(new Event('input'));
        return;
      }
    } catch (e) {
      // Permission blocked
    }
  }

  if (window.lastCopiedRunes) {
    input.value = window.lastCopiedRunes;
    input.dispatchEvent(new Event('input'));
  } else {
    const userText = prompt("Pega aquí los símbolos alienígenas o texto latino:");
    if (userText) {
      input.value = userText;
      input.dispatchEvent(new Event('input'));
    }
  }
}

function loadLastHintToBrazalete() {
  const input = document.getElementById('translatorInput');
  if (!input) return;

  if (window.lastCopiedRunes) {
    input.value = window.lastCopiedRunes;
    input.dispatchEvent(new Event('input'));
    return;
  }

  if (appState && appState.unlocked_hints && challengesData) {
    for (let i = challengesData.length - 1; i >= 0; i--) {
      const c = challengesData[i];
      const unl = appState.unlocked_hints[c.id];
      if (unl && unl.length > 0 && c.hints) {
        const maxLvl = Math.max(...unl);
        const hintObj = c.hints.find(h => h.level === maxLvl);
        if (hintObj) {
          const runes = textToYautjaRunes(hintObj.yautja_text);
          window.lastCopiedRunes = runes;
          input.value = runes;
          input.dispatchEvent(new Event('input'));
          return;
        }
      }
    }
  }

  const defaultSample = textToYautjaRunes("LA BALIZA MILITAR TRANSMITE EN UN PUERTO TCP ALTO");
  input.value = defaultSample;
  input.dispatchEvent(new Event('input'));
}

function clearBrazaleteInput() {
  const input = document.getElementById('translatorInput');
  if (input) {
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.focus();
  }
}

function copyDecodedText() {
  const el = document.getElementById('brazaleteDecodedOutput');
  const text = el ? el.textContent.trim() : '';
  if (!text || text.startsWith('(')) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      alert(`[BRAZALETE YAUTJA]\nTraducción copiada al portapapeles:\n\n${text}`);
    });
  } else {
    prompt("Copia la traducción:", text);
  }
}

function copyRuneText() {
  const el = document.getElementById('brazaleteRunesOutput');
  const runes = el ? el.textContent.trim() : '';
  if (!runes || runes === '—') return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(runes).then(() => {
      alert(`[BRAZALETE YAUTJA]\nSímbolos Yautja copiados al portapapeles:\n\n${runes}`);
    });
  } else {
    prompt("Copia los símbolos:", runes);
  }
}

// Backward compatibility aliases
const openCodexModal = openBrazaleteModal;
const closeCodexModal = closeBrazaleteModal;
const selectCodexLetter = selectBrazaleteLetter;

// Thermal Vision Toggle
function toggleVisionMode() {
  document.body.classList.toggle('thermal-vision');
  const isThermal = document.body.classList.contains('thermal-vision');
  const btn = document.getElementById('btnVision');

  if (isThermal) {
    btn.textContent = 'VISIÓN: TÉRMICA (TEORÍA)';
    btn.style.borderColor = '#00e5ff';
    btn.style.color = '#00e5ff';
  } else {
    btn.textContent = 'VISIÓN: BIOMÁSCARA';
    btn.style.borderColor = '#ff2a2a';
    btn.style.color = '#ff2a2a';
  }

  // Re-render immediately to switch cards between challenge lore and theory mode
  renderChallenges();
}

// Reset Lab State
async function resetLab() {
  if (!confirm("¿Reiniciar la cacería y borrar todos los cráneos y puntuación?")) return;
  try {
    const res = await fetch('/api/reset', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      appState = data.state;
      renderDashboard();
      alert("Cacería restaurada. Comienza como Sangre Joven.");
    }
  } catch (err) {
    console.error(err);
  }
}

// Armas Yautja (Kali Linux) Modal Functions
function openArmasModal() {
  const modal = document.getElementById('armasModal');
  if (modal) modal.style.display = 'flex';
}

function closeArmasModal() {
  const modal = document.getElementById('armasModal');
  if (modal) modal.style.display = 'none';
}

function toggleArmaGuide(guideId) {
  const el = document.getElementById(guideId);
  if (!el) return;
  const isHidden = el.style.display === 'none' || !el.style.display;
  el.style.display = isHidden ? 'block' : 'none';
}

function copyArmaCmd(cmd) {
  if (!cmd) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(cmd).then(() => {
      alert(`[ARMAMENTO YAUTJA]\nComando copiado al portapapeles:\n\n${cmd}`);
    }).catch(() => {
      prompt("Copia el comando táctico:", cmd);
    });
  } else {
    prompt("Copia el comando táctico:", cmd);
  }
}

// Global Modal Handlers (Close on Escape key or clicking outside)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeBrazaleteModal();
    closeArmasModal();
    closeTrophyCelebration();
  }
});

window.addEventListener('click', (e) => {
  const brazaleteModal = document.getElementById('brazaleteModal') || document.getElementById('codexModal');
  const armasModal = document.getElementById('armasModal');
  const celebrationOverlay = document.getElementById('predatorCelebrationOverlay');

  if (e.target === brazaleteModal) closeBrazaleteModal();
  if (e.target === armasModal) closeArmasModal();
  if (e.target === celebrationOverlay) closeTrophyCelebration();
});

/* ========================================================
   PREDATOR TROPHY CELEBRATION LOGIC & RETRO AUDIO
   ======================================================== */
let celebrationDismissTimer = null;

function triggerSkullTrophyCelebration(data, oldRank) {
  const overlay = document.getElementById('predatorCelebrationOverlay');
  if (!overlay) return;

  if (celebrationDismissTimer) {
    clearTimeout(celebrationDismissTimer);
    celebrationDismissTimer = null;
  }

  // Play retro 8-bit Yautja victory roar and laser chimes
  playYautjaTrophySound();

  const titleEl = document.getElementById('celebrationSkullTitle');
  const rankEl = document.getElementById('celebrationRankTag');
  const pointsEl = document.getElementById('celebrationPoints');
  const totalHonorEl = document.getElementById('celebrationTotalHonor');
  const rankUpBox = document.getElementById('celebrationRankUpBox');
  const rankUpText = document.getElementById('celebrationRankUpText');
  const sprite = document.getElementById('celebrationSprite');

  if (titleEl) titleEl.textContent = data.message || "CRÁNEO DE CACERÍA COBRADO";
  if (data.is_berserker && rankEl) {
    rankEl.textContent = `RANGO: BERSERKER (REDENCIÓN: ${data.state.berserker_clean_skulls || 0}/${data.state.berserker_skulls_needed || 3} LIMPIOS)`;
    rankEl.style.color = '#ff1a40';
  } else if (rankEl && appState) {
    rankEl.textContent = `RANGO: ${appState.current_rank.toUpperCase()}`;
    rankEl.style.color = '#ff9900';
  }
  if (pointsEl) pointsEl.textContent = `+${data.points_added || 100} HONOR YAUTJA`;
  if (totalHonorEl && appState) totalHonorEl.textContent = `PUNTUACIÓN TOTAL: ${appState.honor_score} PTS`;

  // Check if rank upgraded or redeemed
  if (data.redeemed) {
    if (rankUpBox && rankUpText) {
      rankUpText.textContent = `¡REDENCIÓN YAUTJA! RANGO RESTAURADO A ${data.new_rank.toUpperCase()}`;
      rankUpBox.style.display = 'flex';
      rankUpBox.style.border = '1px solid #00ff77';
      rankUpBox.style.color = '#00ff77';
    }
  } else if (data.new_rank && oldRank && data.new_rank !== oldRank && !data.is_berserker) {
    if (rankUpBox && rankUpText) {
      rankUpText.textContent = `¡ASCENSO DE RANGO! AHORA ERES ${data.new_rank.toUpperCase()}`;
      rankUpBox.style.display = 'flex';
      rankUpBox.style.border = '1px solid #ff7700';
      rankUpBox.style.color = '#ffcc00';
    }
  } else if (rankUpBox) {
    rankUpBox.style.display = 'none';
  }

  // Re-trigger rising animation on sprite
  if (sprite) {
    sprite.style.animation = 'none';
    void sprite.offsetWidth; // Force CSS reflow
    sprite.style.animation = 'trophySpriteRise 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, trophyVictoryIdle 1.5s infinite ease-in-out 0.6s';
  }

  overlay.style.display = 'flex';

  // Auto-dismiss after 6.5 seconds
  celebrationDismissTimer = setTimeout(() => {
    closeTrophyCelebration();
  }, 6500);
}

function closeTrophyCelebration(e) {
  if (e && e.target && e.target.closest && e.target.closest('.trophy-celebration-card') && e.type === 'click' && !e.target.closest('.celebration-btn')) {
    return;
  }
  const overlay = document.getElementById('predatorCelebrationOverlay');
  if (overlay) overlay.style.display = 'none';
  if (celebrationDismissTimer) {
    clearTimeout(celebrationDismissTimer);
    celebrationDismissTimer = null;
  }
}


// Synthesize authentic 8-bit arcade Yautja triumph audio using Web Audio API
function playYautjaTrophySound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;

    // 1. Guttural Bass Roar / Plasma sweep (Low Sawtooth with pitch drop)
    const oscRoar = ctx.createOscillator();
    const gainRoar = ctx.createGain();
    oscRoar.type = 'sawtooth';
    oscRoar.frequency.setValueAtTime(120, now);
    oscRoar.frequency.exponentialRampToValueAtTime(32, now + 0.45);
    gainRoar.gain.setValueAtTime(0.35, now);
    gainRoar.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    oscRoar.connect(gainRoar);
    gainRoar.connect(ctx.destination);
    oscRoar.start(now);
    oscRoar.stop(now + 0.52);

    // 2. Tri-Laser Target Lock Chimes (880Hz, 1174Hz, 1760Hz)
    [0.15, 0.28, 0.42].forEach((timeOffset, idx) => {
      const oscChirp = ctx.createOscillator();
      const gainChirp = ctx.createGain();
      oscChirp.type = 'sine';
      const freqs = [880, 1174, 1760];
      oscChirp.frequency.setValueAtTime(freqs[idx], now + timeOffset);
      gainChirp.gain.setValueAtTime(0.2, now + timeOffset);
      gainChirp.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.16);
      oscChirp.connect(gainChirp);
      gainChirp.connect(ctx.destination);
      oscChirp.start(now + timeOffset);
      oscChirp.stop(now + timeOffset + 0.18);
    });

    // 3. Victorious Arcade Arpeggio (C5 -> E5 -> G5 -> C6)
    const victoryNotes = [523.25, 659.25, 783.99, 1046.50];
    victoryNotes.forEach((f, i) => {
      const oscV = ctx.createOscillator();
      const gainV = ctx.createGain();
      oscV.type = 'triangle';
      const startT = now + 0.52 + (i * 0.09);
      oscV.frequency.setValueAtTime(f, startT);
      gainV.gain.setValueAtTime(0.22, startT);
      gainV.gain.exponentialRampToValueAtTime(0.001, startT + 0.32);
      oscV.connect(gainV);
      gainV.connect(ctx.destination);
      oscV.start(startT);
      oscV.stop(startT + 0.35);
    });
  } catch (err) {
    console.log("Audio synthesis not available or blocked:", err);
  }
}

// Configurar enlaces directos entre la plataforma Yautja y la Presa (OWLF)
document.addEventListener('DOMContentLoaded', () => {
  const preyLink = document.getElementById('linkToPrey');
  if (preyLink) {
    const currentHost = window.location.hostname || '127.0.0.1';
    preyLink.href = `http://${currentHost}:8080/`;
  }
});
