interface QrGlyphProps {
  /** String encoded into the pattern — usually the exhibit code. */
  seed: string;
  size?: number;
  className?: string;
  label?: string;
}

const MODULES = 25;
const QUIET = 1;

function fnv1a(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function inFinderZone(x: number, y: number): boolean {
  const zones: [number, number][] = [
    [0, 0],
    [MODULES - 7, 0],
    [0, MODULES - 7],
  ];
  return zones.some(([zx, zy]) => x >= zx - 1 && x <= zx + 7 && y >= zy - 1 && y <= zy + 7);
}

/** Deterministic QR-style matrix (decorative — no encoding standard claimed). */
function buildMatrix(seed: string): boolean[][] {
  const random = mulberry32(fnv1a(seed));
  const grid: boolean[][] = Array.from({ length: MODULES }, () =>
    Array.from({ length: MODULES }, () => false),
  );

  const drawFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const ring = x === 0 || x === 6 || y === 0 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[oy + y][ox + x] = ring || core;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(MODULES - 7, 0);
  drawFinder(0, MODULES - 7);

  for (let i = 8; i < MODULES - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  for (let y = 0; y < MODULES; y++) {
    for (let x = 0; x < MODULES; x++) {
      if (inFinderZone(x, y) || x === 6 || y === 6) continue;
      grid[y][x] = random() > 0.52;
    }
  }

  // alignment block, bottom right
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const edge = x === 0 || x === 4 || y === 0 || y === 4;
      const core = x === 2 && y === 2;
      grid[MODULES - 6 + y][MODULES - 6 + x] = edge || core;
    }
  }

  return grid;
}

export default function QrGlyph({ seed, size = 112, className = '', label }: QrGlyphProps) {
  const grid = buildMatrix(seed);
  const total = MODULES + QUIET * 2;

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      width={size}
      height={size}
      role="img"
      aria-label={label ?? `QR pattern for ${seed}`}
      className={`shrink-0 ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect width={total} height={total} fill="#f2ece0" />
      {grid.map((row, y) =>
        row.map((filled, x) =>
          filled ? (
            <rect
              key={`${x}-${y}`}
              x={x + QUIET}
              y={y + QUIET}
              width={1}
              height={1}
              fill="#0b0f14"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
