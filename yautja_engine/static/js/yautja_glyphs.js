/**
 * Yautja Hunt - Glyph Renderer & Translation Matrix
 * Inspired by Predator (1987) wrist gauntlet countdown & Yautja alphabet
 * Based on Page 6 of the Yautja Hunt proposal document.
 */

const YAUTJA_PATHS = {
  'A': [
    { type: 'line', x1: 15, y1: 6, x2: 15, y2: 38 },
    { type: 'line', x1: 15, y1: 12, x2: 23, y2: 20 },
    { type: 'line', x1: 15, y1: 24, x2: 7, y2: 34 }
  ],
  'B': [
    { type: 'line', x1: 15, y1: 6, x2: 15, y2: 38 },
    { type: 'line', x1: 15, y1: 14, x2: 7, y2: 20 },
    { type: 'line', x1: 15, y1: 24, x2: 7, y2: 30 }
  ],
  'C': [
    { type: 'line', x1: 15, y1: 6, x2: 15, y2: 38 },
    { type: 'line', x1: 15, y1: 10, x2: 24, y2: 16 },
    { type: 'line', x1: 15, y1: 30, x2: 6, y2: 34 }
  ],
  'D': [
    { type: 'line', x1: 15, y1: 6, x2: 15, y2: 38 },
    { type: 'polyline', points: '15,12 6,22 15,32' }
  ],
  'E': [
    { type: 'line', x1: 15, y1: 6, x2: 15, y2: 38 },
    { type: 'line', x1: 15, y1: 10, x2: 7, y2: 14 },
    { type: 'line', x1: 15, y1: 22, x2: 7, y2: 26 },
    { type: 'line', x1: 15, y1: 34, x2: 7, y2: 38 }
  ],
  'F': [
    { type: 'line', x1: 15, y1: 6, x2: 15, y2: 38 },
    { type: 'line', x1: 15, y1: 12, x2: 24, y2: 18 },
    { type: 'line', x1: 15, y1: 24, x2: 24, y2: 30 },
    { type: 'circle', cx: 8, cy: 15, r: 2 }
  ],
  'G': [
    { type: 'polyline', points: '7,10 15,22 23,10' },
    { type: 'line', x1: 15, y1: 22, x2: 15, y2: 38 },
    { type: 'line', x1: 7, y1: 10, x2: 11, y2: 6 }
  ],
  'H': [
    { type: 'polyline', points: '7,8 15,18 7,28' },
    { type: 'polyline', points: '23,8 15,18 23,28' },
    { type: 'line', x1: 15, y1: 18, x2: 15, y2: 38 }
  ],
  'I': [
    { type: 'line', x1: 15, y1: 8, x2: 15, y2: 36 },
    { type: 'line', x1: 11, y1: 8, x2: 19, y2: 8 },
    { type: 'line', x1: 11, y1: 36, x2: 19, y2: 36 }
  ],
  'J': [
    { type: 'line', x1: 15, y1: 8, x2: 15, y2: 30 },
    { type: 'polyline', points: '15,30 11,36 6,32' },
    { type: 'circle', cx: 22, cy: 12, r: 2 }
  ],
  'K': [
    { type: 'line', x1: 15, y1: 6, x2: 15, y2: 38 },
    { type: 'line', x1: 15, y1: 22, x2: 24, y2: 10 },
    { type: 'line', x1: 15, y1: 22, x2: 24, y2: 34 }
  ],
  'L': [
    { type: 'line', x1: 15, y1: 6, x2: 15, y2: 38 },
    { type: 'line', x1: 15, y1: 34, x2: 24, y2: 34 }
  ],
  'M': [
    { type: 'polyline', points: '6,36 10,10 15,24 20,10 24,36' }
  ],
  'N': [
    { type: 'line', x1: 8, y1: 36, x2: 8, y2: 10 },
    { type: 'line', x1: 8, y1: 10, x2: 22, y2: 36 },
    { type: 'line', x1: 22, y1: 36, x2: 22, y2: 10 }
  ],
  'O': [
    { type: 'polygon', points: '15,8 24,22 15,36 6,22' },
    { type: 'circle', cx: 15, cy: 22, r: 2.5 }
  ],
  'P': [
    { type: 'line', x1: 12, y1: 6, x2: 12, y2: 38 },
    { type: 'polygon', points: '12,8 23,16 12,24' }
  ],
  'Q': [
    { type: 'polygon', points: '15,8 24,22 15,36 6,22' },
    { type: 'line', x1: 17, y1: 30, x2: 25, y2: 38 }
  ],
  'R': [
    { type: 'line', x1: 10, y1: 6, x2: 10, y2: 38 },
    { type: 'polyline', points: '10,8 22,14 10,22 22,38' }
  ],
  'S': [
    { type: 'polyline', points: '22,10 10,16 20,28 8,34' }
  ],
  'T': [
    { type: 'line', x1: 6, y1: 8, x2: 24, y2: 8 },
    { type: 'line', x1: 15, y1: 8, x2: 15, y2: 38 },
    { type: 'line', x1: 6, y1: 8, x2: 10, y2: 14 }
  ],
  'U': [
    { type: 'polyline', points: '8,8 8,30 15,36 22,30 22,8' }
  ],
  'V': [
    { type: 'polyline', points: '7,8 15,36 23,8' }
  ],
  'W': [
    { type: 'polyline', points: '6,8 9,34 15,18 21,34 24,8' }
  ],
  'X': [
    { type: 'line', x1: 7, y1: 8, x2: 23, y2: 36 },
    { type: 'line', x1: 23, y1: 8, x2: 7, y2: 36 },
    { type: 'circle', cx: 15, cy: 8, r: 2 }
  ],
  'Y': [
    { type: 'line', x1: 7, y1: 8, x2: 15, y2: 22 },
    { type: 'line', x1: 23, y1: 8, x2: 15, y2: 22 },
    { type: 'line', x1: 15, y1: 22, x2: 15, y2: 38 }
  ],
  'Z': [
    { type: 'polyline', points: '8,8 22,8 8,36 22,36' },
    { type: 'line', x1: 10, y1: 22, x2: 20, y2: 22 }
  ],
  '0': [
    { type: 'line', x1: 15, y1: 6, x2: 15, y2: 38 },
    { type: 'circle', cx: 7, cy: 22, r: 2.5 },
    { type: 'circle', cx: 23, cy: 22, r: 2.5 }
  ],
  '1': [
    { type: 'line', x1: 15, y1: 6, x2: 15, y2: 38 },
    { type: 'line', x1: 7, y1: 22, x2: 23, y2: 22 }
  ],
  '2': [
    { type: 'line', x1: 15, y1: 6, x2: 15, y2: 38 },
    { type: 'line', x1: 7, y1: 16, x2: 23, y2: 16 },
    { type: 'line', x1: 7, y1: 28, x2: 23, y2: 28 }
  ],
  '3': [
    { type: 'line', x1: 15, y1: 6, x2: 15, y2: 38 },
    { type: 'line', x1: 7, y1: 12, x2: 23, y2: 12 },
    { type: 'line', x1: 7, y1: 22, x2: 23, y2: 22 },
    { type: 'line', x1: 7, y1: 32, x2: 23, y2: 32 }
  ],
  '4': [
    { type: 'polygon', points: '15,8 23,18 15,28 7,18' },
    { type: 'line', x1: 15, y1: 28, x2: 15, y2: 38 },
    { type: 'line', x1: 15, y1: 34, x2: 22, y2: 38 }
  ],
  '5': [
    { type: 'polygon', points: '15,8 23,18 15,28 7,18' },
    { type: 'line', x1: 7, y1: 18, x2: 23, y2: 18 },
    { type: 'line', x1: 15, y1: 28, x2: 15, y2: 38 }
  ],
  '6': [
    { type: 'line', x1: 15, y1: 6, x2: 15, y2: 22 },
    { type: 'polygon', points: '15,22 23,30 15,38 7,30' }
  ],
  '7': [
    { type: 'polygon', points: '15,6 23,14 15,22 7,14' },
    { type: 'line', x1: 15, y1: 22, x2: 15, y2: 38 }
  ],
  '8': [
    { type: 'polygon', points: '15,6 22,14 15,22 8,14' },
    { type: 'polygon', points: '15,22 22,30 15,38 8,30' }
  ],
  '9': [
    { type: 'polygon', points: '15,6 23,16 15,26 7,16' },
    { type: 'line', x1: 7, y1: 16, x2: 23, y2: 16 },
    { type: 'line', x1: 15, y1: 26, x2: 15, y2: 38 }
  ]
};

/**
 * Returns an SVG string representing a single Yautja glyph.
 */
function createYautjaGlyphSVG(char, size = 32, glowColor = '#ff2a2a') {
  const upper = char.toUpperCase();
  const elements = YAUTJA_PATHS[upper];

  if (!elements) {
    if (char === ' ') {
      return `<div style="display:inline-block; width:${size * 0.4}px; height:${size * 1.3}px;"></div>`;
    }
    // For punctuation or unsupported characters, display character in monospaced bracket
    return `<span class="yautja-fallback" style="display:inline-block; font-family:monospace; color:${glowColor}; font-size:${size * 0.8}px; width:${size * 0.7}px; text-align:center;">${char}</span>`;
  }

  let svgInner = '';
  for (const el of elements) {
    if (el.type === 'line') {
      svgInner += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${glowColor}" stroke-width="2.6" stroke-linecap="round" />`;
    } else if (el.type === 'polyline') {
      svgInner += `<polyline points="${el.points}" fill="none" stroke="${glowColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`;
    } else if (el.type === 'polygon') {
      svgInner += `<polygon points="${el.points}" fill="rgba(255, 42, 42, 0.25)" stroke="${glowColor}" stroke-width="2.4" stroke-linejoin="round" />`;
    } else if (el.type === 'circle') {
      svgInner += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${glowColor}" />`;
    }
  }

  const height = size * 1.4;
  return `
    <svg class="yautja-glyph" viewBox="0 0 30 44" width="${size}" height="${height}" style="vertical-align: middle; filter: drop-shadow(0 0 4px ${glowColor}); margin: 0 1px;">
      ${svgInner}
    </svg>
  `;
}

/**
 * Converts a text string into an HTML block of Yautja glyphs.
 */
function renderYautjaString(text, size = 26, glowColor = '#ff3333') {
  let result = '<div class="yautja-text-wrapper" style="display:inline-flex; flex-wrap:wrap; align-items:center; gap:2px;">';
  for (let i = 0; i < text.length; i++) {
    result += createYautjaGlyphSVG(text[i], size, glowColor);
  }
  result += '</div>';
  return result;
}

/**
 * Generates the full Yautja Brazalete / Gauntlet alphabet grid (A-Z, 0-9) with interactive cards.
 */
function generateBrazaleteGrid(containerId) {
  const container = document.getElementById(containerId) || document.getElementById('codexAlphabetGrid');
  if (!container) return;

  const characters = Object.keys(YAUTJA_PATHS);
  let html = '<div class="codex-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 10px;">';

  for (const char of characters) {
    html += `
      <div class="codex-card" style="background:#0c0909; border:1px solid #4a1212; border-radius:4px; padding:8px 4px; text-align:center; transition: all 0.2s; cursor:pointer;" onclick="(window.selectBrazaleteLetter || window.selectCodexLetter)('${char}')" title="Insertar ${char} en el traductor">
        <div style="height:48px; display:flex; align-items:center; justify-content:center;">
          ${createYautjaGlyphSVG(char, 28, '#ff3333')}
        </div>
        <div style="font-family:'Courier New', monospace; font-size:1.1rem; font-weight:bold; color:#00ff88; margin-top:4px; border-top:1px dashed #331111; padding-top:4px;">
          ${char}
        </div>
      </div>
    `;
  }
  html += '</div>';
  container.innerHTML = html;
}

const generateCodexGrid = generateBrazaleteGrid;
