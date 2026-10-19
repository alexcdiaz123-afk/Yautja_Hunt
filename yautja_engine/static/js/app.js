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
      const output = document.getElementById('translatorOutput');
      output.innerHTML = renderYautjaString(e.target.value.toUpperCase() || 'YAUTJA', 28, '#ff2222');
    });
  }
}

function renderDashboard() {
  if (!appState || !challengesData) return;

  // Update HUD
  document.getElementById('hudHonor').textContent = appState.honor_score;
  document.getElementById('hudSkullsCount').textContent = `${appState.claimed_skulls.length} / 15`;
  document.getElementById('hudRank').textContent = appState.current_rank;
  document.getElementById('rankBannerTitle').textContent = `RANGO ACTUAL: ${appState.current_rank}`;

  renderTrophyRack();
  renderChallenges();
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

  let html = '';
  for (let i = 1; i <= 15; i++) {
    const skullId = `skull_${String(i).padStart(2, '0')}`;
    const isClaimed = appState.claimed_skulls.includes(skullId);
    const isUnlocked = isSkullUnlocked(i);

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
      <div class="skull-trophy ${statusKey === 'active' ? 'active-target' : statusKey}" 
           title="${tooltip}">
        <div class="skull-icon-wrapper">
          ${skullSVG}
        </div>
        <div style="font-size:0.75rem; font-weight:900; color:${labelColor}; letter-spacing:1px; margin-top:2px;">
          SKULL ${i}
        </div>
        <div class="skull-status-badge" style="color:${statusBadgeColor};">
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
              <div>
                <span class="challenge-title" style="color: #668899;">🔒 ${c.title}</span>
                <span class="badge-tag ${rankBadgeClass}" style="margin-left: 10px;">${c.rank}</span>
                <span class="badge-tag" style="background: rgba(80,80,80,0.2); color: #888; border: 1px solid #555; margin-left: 6px;">
                  ${c.skill}
                </span>
              </div>
              <div>
                <span class="badge-tag badge-locked-rank">🔒 FRECUENCIA BLOQUEADA</span>
              </div>
            </div>
            <div class="locked-rank-notice" style="border-color: rgba(0,229,255,0.2); background: rgba(0,229,255,0.03);">
              <div style="font-size: 1.6rem;">🔒</div>
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
              <div>
                <span class="challenge-title" style="color: #774444;">🔒 ${c.title}</span>
                <span class="badge-tag ${rankBadgeClass}" style="margin-left: 10px;">${c.rank}</span>
                <span class="badge-tag" style="background: rgba(40,15,15,0.6); color: #885555; margin-left: 6px;">${c.skill}</span>
              </div>
              <div style="text-align: right;">
                <span class="badge-tag badge-locked-rank">🔒 REQUIERE RANGO ${c.rank.toUpperCase()}</span>
              </div>
            </div>
            <div class="locked-rank-notice">
              <div style="font-size: 1.6rem;">🔒</div>
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
            <div>
              <span class="challenge-title" style="color: #00e5ff;">${c.title}</span>
              <span class="badge-tag ${rankBadgeClass}" style="margin-left: 10px;">${c.rank}</span>
              <span class="badge-tag" style="background: rgba(0,229,255,0.15); color: #00e5ff; border: 1px solid #00e5ff; margin-left: 6px;">
                ${c.skill}
              </span>
            </div>
            <div style="text-align: right;">
              <span class="badge-tag" style="background: rgba(255, 102, 0, 0.25); color: #ff6600; border: 1px solid #ff6600; font-weight: bold;">
                🔬 ESCÁNER TÁCTICO // MARCO TEÓRICO
              </span>
            </div>
          </div>

          <div class="thermal-theory-box">
            <div class="theory-section-title">📘 CONCEPTO DE SEGURIDAD & VULNERABILIDAD:</div>
            <p class="theory-text">${c.theory ? c.theory.concept : 'Análisis teórico no disponible.'}</p>

            <div class="theory-section-title">🛠️ METODOLOGÍA Y HERRAMIENTAS RECOMENDADAS:</div>
            <p class="theory-text">${c.theory ? c.theory.tools : 'N/A'}</p>

            <div class="theory-section-title">💡 ENFOQUE Y RAZONAMIENTO DEL ANALISTA:</div>
            <p class="theory-text" style="color: #80d8ff;">${c.theory ? c.theory.approach : 'N/A'}</p>

            <div class="theory-section-title">🛡️ MEDIDAS DE MITIGACIÓN Y HARDENING:</div>
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
            <div>
              <span class="challenge-title">${c.title}</span>
              <span class="badge-tag ${rankBadgeClass}" style="margin-left: 10px;">${c.rank}</span>
              <span class="badge-tag" style="background: rgba(0,210,255,0.1); color: #00d2ff; margin-left: 6px;">${c.skill}</span>
            </div>
            <div style="text-align: right;">
              <div style="color: ${isClaimed ? '#00ff77' : '#ff4d6d'}; font-weight: bold; font-size: 1.1rem;">
                ${isClaimed ? '✓ CRÁNEO RECLAMADO' : `+${c.points} HONOR`}
              </div>
              <div style="font-size: 0.75rem; color: #886666;">Dificultad: ${c.difficulty}</div>
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
      html += `
        <div class="hint-row" style="border-left: 3px solid #ff2a2a; flex-direction: column; align-items: flex-start;">
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #ff9999; font-weight: bold; font-size: 0.85rem;">[PISTA NIVEL ${h.level}: ${h.title.toUpperCase()}]</span>
            <button class="btn-unlock-hint" onclick="toggleHintTranslation('${challenge.id}', ${h.level})" style="font-size: 0.75rem; padding: 3px 8px;">
              🔄 Traducir / Alternar
            </button>
          </div>
          <div class="hint-content" id="hint_content_${challenge.id}_${h.level}">
            <div class="hint-yautja-box" style="margin: 6px 0; background: #000; padding: 10px; border-radius: 4px; border: 1px solid #331111;">
              ${renderYautjaString(h.yautja_text, 24, '#ff2222')}
            </div>
            <div class="hint-plain-box" style="display: none; color: #00ff77; font-size: 0.9rem; padding: 6px; background: rgba(0,255,119,0.05); border-left: 3px solid #00ff77;">
              <strong>Traducción humana:</strong> ${h.plain_text}
            </div>
          </div>
        </div>
      `;
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

  if (!confirm(`¿Deseas descifrar esta pista por ${cost} puntos de honor?`)) return;

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
      statusMsg.innerHTML = `<span style="color:#00ff77; font-weight:bold;">¡CRÁNEO CAPTURADO! +${data.points_added} Honor. ${data.message}</span>`;
      document.getElementById('flagInput').value = '';
      appState = data.state;
      renderDashboard();
      playSuccessEffect();
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

// Brazalete Yautja Modal Functions
function openBrazaleteModal() {
  const modal = document.getElementById('brazaleteModal') || document.getElementById('codexModal');
  if (modal) modal.style.display = 'flex';
}

function closeBrazaleteModal() {
  const modal = document.getElementById('brazaleteModal') || document.getElementById('codexModal');
  if (modal) modal.style.display = 'none';
}

function selectBrazaleteLetter(char) {
  const input = document.getElementById('translatorInput');
  if (input) {
    input.value += char;
    input.dispatchEvent(new Event('input'));
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
  }
});

window.addEventListener('click', (e) => {
  const brazaleteModal = document.getElementById('brazaleteModal') || document.getElementById('codexModal');
  const armasModal = document.getElementById('armasModal');
  if (e.target === brazaleteModal) closeBrazaleteModal();
  if (e.target === armasModal) closeArmasModal();
});
