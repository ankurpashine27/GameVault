/**
 * GameThumbnail — unique SVG illustrations per game.
 * Rendered inside the GameCard's aspect-video container (16:9, logical 160×90).
 * Each thumbnail has its own background so the generic gradient is fully covered.
 */

/* ── Snake ───────────────────────────────────────────────────────────────── */
function SnakeThumbnail() {
  // Snake winding: right → left → turn up → right
  const segs = [
    [126,45],[117,45],[108,45],[99,45],[90,45],[81,45],[72,45],
    [72,36],[72,27],[81,27],[90,27],[99,27],
  ]
  return (
    <svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="snBg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#0d2a0d"/>
          <stop offset="100%" stopColor="#060f06"/>
        </radialGradient>
      </defs>
      <rect width="160" height="90" fill="url(#snBg)"/>
      {/* Subtle grid */}
      {[...Array(18)].map((_,i) => (
        <line key={`v${i}`} x1={i*9} y1={0} x2={i*9} y2={90} stroke="#1a4a1a" strokeWidth="0.4"/>
      ))}
      {[...Array(11)].map((_,i) => (
        <line key={`h${i}`} x1={0} y1={i*9} x2={160} y2={i*9} stroke="#1a4a1a" strokeWidth="0.4"/>
      ))}
      {/* Body segments — gradient green */}
      {segs.slice(1).map(([x,y], i) => (
        <rect key={i} x={x-4} y={y-4} width={8} height={8} rx={2}
          fill={`hsl(142,${55+i*3}%,${28+i*2}%)`}/>
      ))}
      {/* Head */}
      <rect x={segs[0][0]-4} y={segs[0][1]-4} width={8} height={8} rx={2} fill="#4ade80"/>
      {/* Eyes */}
      <circle cx={segs[0][0]+2.5} cy={segs[0][1]-1.5} r={1.6} fill="#fff"/>
      <circle cx={segs[0][0]+2.5} cy={segs[0][1]-1.5} r={0.8} fill="#111"/>
      {/* Food */}
      <circle cx={36} cy={63} r={5.5} fill="#ef4444"/>
      <circle cx={34} cy={61} r={1.8} fill="#fca5a5" opacity="0.65"/>
      <line x1={36} y1={58} x2={37} y2={55} stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Border glow */}
      <rect x={1} y={1} width={158} height={88} rx={4} fill="none"
        stroke="#22c55e" strokeWidth="1" opacity="0.18"/>
      {/* Score label */}
      <text x="8" y="12" fill="#4ade80" fontFamily="monospace" fontSize="7"
        fontWeight="bold" opacity="0.7">HIGH SCORE</text>
      <text x="8" y="21" fill="#fff" fontFamily="monospace" fontSize="8"
        fontWeight="bold" opacity="0.6">12840</text>
    </svg>
  )
}

/* ── Tetris ───────────────────────────────────────────────────────────────── */
function TetrisThumbnail() {
  const cs = 13
  const bx = 15  // (160-130)/2
  const by = 18
  const C = { I:'#06b6d4', O:'#eab308', T:'#a855f7', S:'#22c55e', Z:'#ef4444', J:'#3b82f6', L:'#f97316' }

  // 5 rows × 10 cols.  null = empty
  const board = [
    [null,null,null,null,'T',null,null,null,null,null],
    [null,null,null,'T','T','T',null,null,null,null],
    [null,'Z',null,'I',null,null,'J',null,null,null],
    ['Z','Z','I','I','I','J','J','O',null,null],
    ['L','Z','I','S','O','O','J','O','L','L'],
  ]

  return (
    <svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="90" fill="#080812"/>
      {/* Board background */}
      <rect x={bx} y={by} width={10*cs} height={5*cs} rx={2} fill="#0d0d20"/>
      {/* Blocks */}
      {board.map((row, ri) =>
        row.map((cell, ci) => cell ? (
          <g key={`${ri}-${ci}`}>
            <rect x={bx+ci*cs+1} y={by+ri*cs+1} width={cs-2} height={cs-2} rx={2}
              fill={C[cell]}/>
            {/* Top highlight */}
            <rect x={bx+ci*cs+2} y={by+ri*cs+2} width={cs-4} height={3} rx={1}
              fill="#fff" opacity="0.25"/>
          </g>
        ) : null)
      )}
      {/* Grid overlay */}
      {[...Array(11)].map((_,i) => (
        <line key={`cv${i}`} x1={bx+i*cs} y1={by} x2={bx+i*cs} y2={by+5*cs}
          stroke="#ffffff" strokeWidth="0.3" opacity="0.08"/>
      ))}
      {[...Array(6)].map((_,i) => (
        <line key={`ch${i}`} x1={bx} y1={by+i*cs} x2={bx+10*cs} y2={by+i*cs}
          stroke="#ffffff" strokeWidth="0.3" opacity="0.08"/>
      ))}
      {/* HUD labels */}
      <text x="8" y="15" fill="#a855f7" fontFamily="monospace" fontSize="9"
        fontWeight="bold">TETRIS</text>
      <text x="8" y="26" fill="#888" fontFamily="monospace" fontSize="6.5">SCORE</text>
      <text x="8" y="35" fill="#fff" fontFamily="monospace" fontSize="8"
        fontWeight="bold">86400</text>
      <text x="8" y="50" fill="#888" fontFamily="monospace" fontSize="6.5">LEVEL</text>
      <text x="8" y="59" fill="#06b6d4" fontFamily="monospace" fontSize="8"
        fontWeight="bold">07</text>
      {/* Next piece hint */}
      <text x="152" y="15" fill="#888" fontFamily="monospace" fontSize="6.5"
        textAnchor="end">NEXT</text>
      {/* Mini O-piece preview */}
      {[[0,0],[1,0],[0,1],[1,1]].map(([dc,dr]) => (
        <rect key={`nx${dc}${dr}`} x={143+dc*8} y={18+dr*8} width={7} height={7} rx={1}
          fill={C.O}/>
      ))}
    </svg>
  )
}

/* ── Flappy Bird ─────────────────────────────────────────────────────────── */
function FlappyBirdThumbnail() {
  return (
    <svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="fbSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f2a4a"/>
          <stop offset="100%" stopColor="#1a5a8a"/>
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="160" height="90" fill="url(#fbSky)"/>
      {/* Distant clouds */}
      <ellipse cx="25"  cy="22" rx="16" ry="7"  fill="#1e4a6a" opacity="0.6"/>
      <ellipse cx="38"  cy="19" rx="10" ry="6"  fill="#1e4a6a" opacity="0.6"/>
      <ellipse cx="130" cy="16" rx="14" ry="6"  fill="#1e4a6a" opacity="0.45"/>
      <ellipse cx="120" cy="19" rx="10" ry="5"  fill="#1e4a6a" opacity="0.45"/>
      {/* Left pipe — top section */}
      <rect x={50} y={0}  width={22} height={29} rx={2} fill="#2d7a1f"/>
      <rect x={47} y={22} width={28} height={9}  rx={2} fill="#3a9a28"/>
      {/* Left pipe — bottom section */}
      <rect x={50} y={52} width={22} height={38} rx={2} fill="#2d7a1f"/>
      <rect x={47} y={52} width={28} height={9}  rx={2} fill="#3a9a28"/>
      {/* Right pipe — top section */}
      <rect x={112} y={0}  width={22} height={18} rx={2} fill="#2d7a1f"/>
      <rect x={109} y={11} width={28} height={9}  rx={2} fill="#3a9a28"/>
      {/* Right pipe — bottom section */}
      <rect x={112} y={44} width={22} height={46} rx={2} fill="#2d7a1f"/>
      <rect x={109} y={44} width={28} height={9}  rx={2} fill="#3a9a28"/>
      {/* Ground */}
      <rect x={0} y={78} width={160} height={12} fill="#2d5a1f"/>
      <rect x={0} y={78} width={160} height={4}  fill="#3a7a28"/>
      {/* Bird body */}
      <circle cx={88} cy={39} r={9}  fill="#fbbf24"/>
      {/* Wing */}
      <ellipse cx={85} cy={42} rx={7} ry={3.5} fill="#f59e0b"
        transform="rotate(-20,85,42)"/>
      {/* White eye sclera */}
      <circle cx={93} cy={36} r={3.5} fill="#fff"/>
      <circle cx={94} cy={36} r={1.8} fill="#111"/>
      {/* Pupil shine */}
      <circle cx={94.5} cy={35.2} r={0.6} fill="#fff"/>
      {/* Beak */}
      <polygon points="96,39 104,37 96,35" fill="#f97316"/>
      {/* Score */}
      <text x="80" y="14" fill="#fff" fontFamily="sans-serif" fontSize="11"
        fontWeight="bold" textAnchor="middle">3</text>
    </svg>
  )
}

/* ── Tic-Tac-Toe ─────────────────────────────────────────────────────────── */
function TicTacToeThumbnail() {
  const cs = 25, bx = 42, by = 8

  const X = (col, row) => {
    const cx = bx + col*cs + cs/2, cy = by + row*cs + cs/2, s = 7
    return (
      <g>
        <line x1={cx-s} y1={cy-s} x2={cx+s} y2={cy+s}
          stroke="#60a5fa" strokeWidth="3" strokeLinecap="round"/>
        <line x1={cx+s} y1={cy-s} x2={cx-s} y2={cy+s}
          stroke="#60a5fa" strokeWidth="3" strokeLinecap="round"/>
      </g>
    )
  }

  const O = (col, row) => {
    const cx = bx + col*cs + cs/2, cy = by + row*cs + cs/2
    return <circle cx={cx} cy={cy} r="8" fill="none" stroke="#fb923c" strokeWidth="3"/>
  }

  return (
    <svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="90" fill="#080814"/>
      {/* Grid lines */}
      <line x1={bx+cs}   y1={by+3}      x2={bx+cs}   y2={by+3*cs-3} stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
      <line x1={bx+2*cs} y1={by+3}      x2={bx+2*cs} y2={by+3*cs-3} stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
      <line x1={bx+3}    y1={by+cs}     x2={bx+3*cs-3} y2={by+cs}   stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
      <line x1={bx+3}    y1={by+2*cs}   x2={bx+3*cs-3} y2={by+2*cs} stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
      {/* Pieces — X wins diagonal (0,0)-(1,1)-(2,2) */}
      {X(0,0)} {O(1,0)} {O(2,0)}
      {O(0,1)} {X(1,1)}
      {X(2,2)} {O(1,2)}
      {/* Win glow + line */}
      <line x1={bx+cs/2} y1={by+cs/2} x2={bx+2.5*cs} y2={by+2.5*cs}
        stroke="#93c5fd" strokeWidth="7" strokeLinecap="round" opacity="0.18"/>
      <line x1={bx+cs/2} y1={by+cs/2} x2={bx+2.5*cs} y2={by+2.5*cs}
        stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      {/* Side text */}
      <text x="8"   y="45" fill="#60a5fa" fontFamily="monospace" fontSize="8"
        fontWeight="bold" opacity="0.6">X</text>
      <text x="148" y="45" fill="#fb923c" fontFamily="monospace" fontSize="8"
        fontWeight="bold" opacity="0.6" textAnchor="end">O</text>
      {/* Decorative dots */}
      <circle cx="8"   cy="68" r="2" fill="#60a5fa" opacity="0.3"/>
      <circle cx="8"   cy="75" r="2" fill="#60a5fa" opacity="0.2"/>
      <circle cx="152" cy="68" r="2" fill="#fb923c" opacity="0.3"/>
      <circle cx="152" cy="75" r="2" fill="#fb923c" opacity="0.2"/>
    </svg>
  )
}

/* ── Nexus ───────────────────────────────────────────────────────────────── */
function NexusThumbnail() {
  const cx = 80, cy = 45, r = 29
  // Pentagon: first node at top (-90°), clockwise
  const angles = [-90, -18, 54, 126, 198]
  const nodes = angles.map(a => [
    cx + r * Math.cos(a * Math.PI / 180),
    cy + r * Math.sin(a * Math.PI / 180),
  ])
  const nodeColors = ['#a78bfa','#818cf8','#6366f1','#8b5cf6','#7c3aed']

  return (
    <svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="nxBg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#14002e"/>
          <stop offset="100%" stopColor="#06000e"/>
        </radialGradient>
      </defs>
      <rect width="160" height="90" fill="url(#nxBg)"/>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r+12} fill="none" stroke="#7c3aed" strokeWidth="0.5" opacity="0.25"/>
      {/* Spoke lines to center */}
      {nodes.map(([x,y], i) => (
        <line key={`sp${i}`} x1={cx} y1={cy} x2={x} y2={y}
          stroke="#8b5cf6" strokeWidth="1" opacity="0.45"/>
      ))}
      {/* Pentagon edges between adjacent nodes */}
      {nodes.map(([x,y], i) => {
        const [nx,ny] = nodes[(i+1) % 5]
        return <line key={`pg${i}`} x1={x} y1={y} x2={nx} y2={ny}
          stroke="#6d28d9" strokeWidth="0.8" opacity="0.3"/>
      })}
      {/* Node glows */}
      {nodes.map(([x,y], i) => (
        <circle key={`ng${i}`} cx={x} cy={y} r={13} fill={nodeColors[i]} opacity="0.1"/>
      ))}
      {/* Outer nodes */}
      {nodes.map(([x,y], i) => (
        <g key={`nd${i}`}>
          <circle cx={x} cy={y} r={9} fill="#16002a" stroke={nodeColors[i]} strokeWidth="1.5"/>
          <circle cx={x} cy={y} r={3} fill={nodeColors[i]}/>
        </g>
      ))}
      {/* Center glow */}
      <circle cx={cx} cy={cy} r={21} fill="#7c3aed" opacity="0.18"/>
      {/* Center node */}
      <circle cx={cx} cy={cy} r={15} fill="#16002a" stroke="#c4b5fd" strokeWidth="2"/>
      <text x={cx} y={cy+6} fill="#c4b5fd" fontFamily="serif" fontSize="18"
        textAnchor="middle" fontWeight="bold">?</text>
      {/* Label */}
      <text x="80" y="86" fill="#7c3aed" fontFamily="monospace" fontSize="6.5"
        textAnchor="middle" opacity="0.7">GUESS THE CATEGORY</text>
    </svg>
  )
}

/* ── Default (fallback for unlisted game IDs) ────────────────────────────── */
function DefaultThumbnail() {
  return (
    <svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="90" fill="#0a0a18"/>
      <text x="80" y="50" fill="white" fontFamily="sans-serif" fontSize="32"
        textAnchor="middle" dominantBaseline="middle" opacity="0.35">🎮</text>
    </svg>
  )
}

/* ── Public component ────────────────────────────────────────────────────── */
const THUMBNAIL_MAP = {
  snake:      SnakeThumbnail,
  tetris:     TetrisThumbnail,
  flappybird: FlappyBirdThumbnail,
  tictactoe:  TicTacToeThumbnail,
  nexus:      NexusThumbnail,
}

export default function GameThumbnail({ gameId }) {
  const Component = THUMBNAIL_MAP[gameId] || DefaultThumbnail
  return <Component />
}
