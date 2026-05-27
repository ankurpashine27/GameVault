import { useState } from 'react'
import AvatarSelector from './AvatarSelector.jsx'
import {
  BOARD_MODES, AI_DIFFICULTIES, SERIES_MODES, TIMER_OPTIONS,
  P1_COLOR, P2_COLOR,
} from './constants.js'

function SectionTitle({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2.5">
      {children}
    </p>
  )
}

function RadioCard({ selected, onClick, children, accentColor }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-150
        ${selected
          ? 'text-text-primary'
          : 'border-vault-border bg-vault-elevated text-text-muted hover:text-text-secondary hover:border-vault-muted'
        }`}
      style={selected ? {
        borderColor: accentColor,
        backgroundColor: accentColor + '18',
        color: accentColor,
      } : undefined}
    >
      {children}
    </button>
  )
}

export default function PreGameScreen({
  p1Name, setP1Name, p2Name, setP2Name,
  p1Avatar, setP1Avatar, p2Avatar, setP2Avatar,
  settings, updateSettings,
  onPlay, onLeaderboard,
}) {
  const [avatarPlayer, setAvatarPlayer] = useState(null) // null | 1 | 2

  const { boardMode, vsAI, aiDifficulty, seriesMode, powerupsOn, timerSeconds } = settings

  const inputCls = `w-full bg-vault-elevated border border-vault-border rounded-lg px-3 py-2
    text-sm text-text-primary placeholder-text-muted
    focus:outline-none focus:border-accent-blue transition-colors`

  return (
    <div className="flex flex-col h-full bg-vault-bg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3
        border-b border-vault-border flex-shrink-0 bg-vault-surface">
        <h2 className="font-heading text-xl font-bold gradient-text">Tic-Tac-Toe</h2>
        <button
          onClick={onLeaderboard}
          className="text-xs text-text-muted hover:text-text-primary transition-colors
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-vault-border
            hover:border-vault-muted bg-vault-elevated"
        >
          🏆 Leaderboard
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-6">

          {/* Players */}
          <div>
            <SectionTitle>Players</SectionTitle>
            <div className="flex gap-3">
              {/* P1 */}
              <div className="flex-1">
                <p className="text-xs mb-1.5" style={{ color: P1_COLOR }}>Player 1</p>
                <div className="flex gap-2 items-center mb-2">
                  <button
                    onClick={() => setAvatarPlayer(avatarPlayer === 1 ? null : 1)}
                    className="text-2xl w-10 h-10 rounded-lg bg-vault-elevated border flex items-center justify-center
                      hover:bg-vault-muted transition-colors flex-shrink-0"
                    style={{ borderColor: avatarPlayer === 1 ? P1_COLOR : '#1E2D45' }}
                  >
                    {p1Avatar}
                  </button>
                  <input
                    value={p1Name}
                    onChange={e => setP1Name(e.target.value)}
                    maxLength={14}
                    placeholder="Player 1"
                    className={inputCls}
                    style={{ borderColor: avatarPlayer === 1 ? P1_COLOR : undefined }}
                  />
                </div>
              </div>
              {/* P2 */}
              <div className="flex-1">
                <p className="text-xs mb-1.5" style={{ color: P2_COLOR }}>
                  {vsAI ? 'AI' : 'Player 2'}
                </p>
                <div className="flex gap-2 items-center mb-2">
                  <button
                    onClick={() => !vsAI && setAvatarPlayer(avatarPlayer === 2 ? null : 2)}
                    className="text-2xl w-10 h-10 rounded-lg bg-vault-elevated border flex items-center justify-center
                      hover:bg-vault-muted transition-colors flex-shrink-0"
                    style={{
                      borderColor: avatarPlayer === 2 ? P2_COLOR : '#1E2D45',
                      opacity: vsAI ? 0.5 : 1,
                      cursor: vsAI ? 'default' : 'pointer',
                    }}
                  >
                    {p2Avatar}
                  </button>
                  <input
                    value={vsAI ? 'AI' : p2Name}
                    onChange={e => !vsAI && setP2Name(e.target.value)}
                    readOnly={vsAI}
                    maxLength={14}
                    placeholder="Player 2"
                    className={inputCls}
                    style={{
                      opacity: vsAI ? 0.5 : 1,
                      borderColor: avatarPlayer === 2 ? P2_COLOR : undefined,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Avatar picker panel */}
            {avatarPlayer !== null && (
              <div className="bg-vault-elevated border border-vault-border rounded-xl p-3 animate-fadeIn">
                <p className="text-xs text-text-muted mb-2">
                  Choose avatar for <span className="font-medium" style={{ color: avatarPlayer === 1 ? P1_COLOR : P2_COLOR }}>
                    {avatarPlayer === 1 ? p1Name : p2Name}
                  </span>
                </p>
                <AvatarSelector
                  selectedAvatar={avatarPlayer === 1 ? p1Avatar : p2Avatar}
                  onSelect={av => {
                    if (avatarPlayer === 1) setP1Avatar(av)
                    else setP2Avatar(av)
                    setAvatarPlayer(null)
                  }}
                  disabledAvatars={avatarPlayer === 1 ? [p2Avatar] : [p1Avatar]}
                  playerColor={avatarPlayer === 1 ? P1_COLOR : P2_COLOR}
                />
              </div>
            )}
          </div>

          {/* Game Mode */}
          <div>
            <SectionTitle>Opponent</SectionTitle>
            <div className="flex gap-2">
              <RadioCard
                selected={vsAI}
                onClick={() => updateSettings({ vsAI: true })}
                accentColor={P1_COLOR}
              >
                vs AI
              </RadioCard>
              <RadioCard
                selected={!vsAI}
                onClick={() => updateSettings({ vsAI: false })}
                accentColor={P1_COLOR}
              >
                2 Players
              </RadioCard>
            </div>
          </div>

          {/* AI Difficulty (only if vsAI) */}
          {vsAI && (
            <div>
              <SectionTitle>AI Difficulty</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(AI_DIFFICULTIES).map(d => (
                  <button
                    key={d.id}
                    onClick={() => updateSettings({ aiDifficulty: d.id })}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all duration-150 text-left
                      ${aiDifficulty === d.id
                        ? 'border-accent-blue bg-accent-blue/10 text-text-primary'
                        : 'border-vault-border bg-vault-elevated text-text-muted hover:border-vault-muted hover:text-text-secondary'
                      }`}
                  >
                    <div className="font-medium">{d.label}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">{d.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Board Mode */}
          <div>
            <SectionTitle>Board</SectionTitle>
            <div className="flex flex-col gap-2">
              {Object.values(BOARD_MODES).map(m => (
                <button
                  key={m.id}
                  onClick={() => updateSettings({ boardMode: m.id })}
                  className={`px-4 py-3 rounded-xl border text-sm transition-all duration-150 text-left
                    ${boardMode === m.id
                      ? 'border-accent-blue bg-accent-blue/10 text-text-primary'
                      : 'border-vault-border bg-vault-elevated text-text-muted hover:border-vault-muted hover:text-text-secondary'
                    }`}
                >
                  <div className="font-heading font-semibold">{m.label}</div>
                  <div className="text-xs text-text-muted mt-0.5">{m.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Series Mode */}
          <div>
            <SectionTitle>Series</SectionTitle>
            <div className="flex gap-2 flex-wrap">
              {SERIES_MODES.map(s => (
                <RadioCard
                  key={s.id}
                  selected={seriesMode === s.id}
                  onClick={() => updateSettings({ seriesMode: s.id })}
                  accentColor={P1_COLOR}
                >
                  {s.label}
                </RadioCard>
              ))}
            </div>
          </div>

          {/* Turn Timer */}
          <div>
            <SectionTitle>Turn Timer</SectionTitle>
            <div className="flex gap-2 flex-wrap">
              {TIMER_OPTIONS.map(t => (
                <RadioCard
                  key={t.value}
                  selected={timerSeconds === t.value}
                  onClick={() => updateSettings({ timerSeconds: t.value })}
                  accentColor={P1_COLOR}
                >
                  {t.label}
                </RadioCard>
              ))}
            </div>
          </div>

          {/* Power-ups */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <SectionTitle>Power-ups</SectionTitle>
              <button
                onClick={() => updateSettings({ powerupsOn: !powerupsOn })}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0
                  ${powerupsOn ? 'bg-accent-blue' : 'bg-vault-muted'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow
                  transition-transform duration-200
                  ${powerupsOn ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </button>
            </div>
            {powerupsOn && (
              <div className="text-xs text-text-muted bg-vault-elevated border border-vault-border rounded-xl p-3 space-y-1.5">
                <p>🚫 <span className="font-medium text-text-secondary">Block</span> — Use your turn to block an empty cell.</p>
                <p>🔄 <span className="font-medium text-text-secondary">Swap</span> — Remove one of your opponent's pieces, then place yours.</p>
                <p>⚡ <span className="font-medium text-text-secondary">Extra Turn</span> — Place your piece and take another turn.</p>
                <p className="text-text-muted/60 mt-1">Each power-up can be used once per game.</p>
              </div>
            )}
          </div>

          <div className="pb-2" />
        </div>
      </div>

      {/* Play button */}
      <div className="px-4 py-3 border-t border-vault-border flex-shrink-0 bg-vault-surface">
        <button
          onClick={onPlay}
          className="w-full py-3.5 rounded-xl bg-accent-blue hover:bg-blue-500 text-white
            font-heading font-bold text-lg transition-all duration-200
            hover:scale-[1.02] active:scale-100
            shadow-glow-blue hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
        >
          ▶ Play
        </button>
      </div>
    </div>
  )
}
