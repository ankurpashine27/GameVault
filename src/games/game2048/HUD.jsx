/**
 * 2048 HUD — React overlay (not canvas).
 *
 * Layout:
 *   Top bar   — Score · Best · Mode badge · timer/moves · Music · Pause
 *   Bottom bar — Undo · New Game · [Exit to Menu]
 *
 * The top bar uses pt-14 (56px) so score boxes clear the GameFrame title bar
 * (~48px tall) that sits at the very top of the viewport.
 * The exit button lives in the bottom bar to avoid overlapping the
 * GameFrame's fullscreen/close buttons at top-right.
 */

import { formatTime } from './utils.js'

export default function HUD({
  score, bestScore, mode, timeLeft, remainingMoves, comboMultiplier,
  undoCharges, canUndo,
  onPause, onUndo, onToggleMusic, onNewGame, onMenu,
  musicOn, onReshuffle,
}) {
  const showCombo = mode === 'time_attack' && comboMultiplier > 1.05

  return (
    /* Full-height transparent shell so top and bottom bars anchor to edges */
    <div className="absolute inset-0 z-10 pointer-events-none select-none">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      {/* pt-14 keeps score boxes below the GameFrame title bar             */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between gap-2 px-3 pt-14 pb-2">

        {/* Score tiles */}
        <div className="flex gap-1.5 flex-shrink-0">
          <ScoreBox label="SCORE" value={score.toLocaleString()} />
          <ScoreBox label="BEST"  value={bestScore.toLocaleString()} />
        </div>

        {/* Mode badge + live status (timer / moves / combo) */}
        <div className="flex flex-col items-center gap-1">
          <ModeBadge mode={mode} />
          {timeLeft !== null && <TimerBadge ms={timeLeft} />}
          {remainingMoves !== null && (
            <span className="bg-black/55 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              {remainingMoves} moves left
            </span>
          )}
          {showCombo && (
            <span className="bg-orange-500/85 text-white px-2 py-0.5 rounded-full text-xs font-black animate-pulse">
              ×{comboMultiplier.toFixed(1)} COMBO
            </span>
          )}
        </div>

        {/* Music + Pause — kept away from top-right GameFrame buttons */}
        <div className="flex gap-1.5 flex-shrink-0 pointer-events-auto">
          <HudBtn onClick={onToggleMusic} title={musicOn ? 'Mute music' : 'Unmute music'}>
            {musicOn ? '🎵' : '🔇'}
          </HudBtn>
          <HudBtn onClick={onPause} title="Pause (Esc)">⏸</HudBtn>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      {/* Exit button lives here — well clear of GameFrame's top-right     */}
      <div className="absolute bottom-0 left-0 right-0
        flex items-center justify-between gap-2 px-3 py-2 pointer-events-auto">

        {/* Left: undo + sandbox reshuffle */}
        <div className="flex gap-1.5">
          <HudBtn onClick={onUndo} disabled={!canUndo} title="Undo (Z or Ctrl+Z)">
            ↩&thinsp;{undoCharges === Infinity ? '∞' : `×${undoCharges}`}
          </HudBtn>
          {mode === 'sandbox' && (
            <HudBtn onClick={onReshuffle} title="Reshuffle tiles">🔀</HudBtn>
          )}
        </div>

        {/* Right: new game + exit */}
        <div className="flex gap-1.5">
          <HudBtn onClick={onNewGame} title="Start a new game">↺ New</HudBtn>
          <HudBtn onClick={onMenu} title="Exit to mode select" variant="danger">
            ✕ Exit
          </HudBtn>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ────────────────────────────────────────────────────────── */

function ScoreBox({ label, value }) {
  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center min-w-[60px] shadow">
      <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest leading-none mb-0.5">
        {label}
      </div>
      <div className="text-white font-black text-sm leading-tight tabular-nums">
        {value}
      </div>
    </div>
  )
}

function ModeBadge({ mode }) {
  const map = {
    classic:       '🎯 Classic',
    time_attack:   '⏱ Time Attack',
    limited_moves: '🎲 Limited',
    obstacle:      '🚧 Obstacle',
    sandbox:       '🏖 Sandbox',
    daily:         '📅 Daily',
  }
  return (
    <span className="bg-black/60 text-white/80 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow">
      {map[mode] || mode}
    </span>
  )
}

function TimerBadge({ ms }) {
  const secs = Math.ceil(ms / 1000)
  const urgent = secs <= 15
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono tabular-nums shadow
      ${urgent ? 'bg-red-500/90 text-white animate-pulse' : 'bg-black/60 text-white'}`}>
      {formatTime(ms)}
    </span>
  )
}

function HudBtn({ onClick, disabled, title, children, variant = 'default' }) {
  const styles = {
    default: 'bg-black/60 hover:bg-black/80 text-white',
    danger:  'bg-red-700/75 hover:bg-red-600/90 text-white',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold shadow
        transition-colors select-none backdrop-blur-sm
        ${styles[variant]}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  )
}
