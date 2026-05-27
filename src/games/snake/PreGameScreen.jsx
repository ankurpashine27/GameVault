import SkinSelector from './SkinSelector.jsx'
import { GRID_SIZES, DIFFICULTIES } from './constants.js'

export default function PreGameScreen({
  playerName, onPlayerNameChange,
  selectedSkin, onSkinChange,
  settings, onSettingsChange,
  onPlay, onLeaderboard, onHowToPlay,
}) {
  const { gridSize, difficulty, powerupsOn } = settings

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#0a0a0f]">
      <div className="max-w-lg mx-auto w-full px-5 py-5 flex flex-col gap-5">

        {/* Title */}
        <div className="text-center pt-1">
          <h1 className="font-heading text-4xl font-bold gradient-text">Snake</h1>
          <p className="text-text-muted text-sm mt-1">Configure your round</p>
        </div>

        {/* Player name */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">
            Player Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={e => onPlayerNameChange(e.target.value)}
            onBlur={e => onPlayerNameChange(e.target.value || 'Anonymous')}
            placeholder="Anonymous"
            maxLength={24}
            className="w-full px-3 py-2 rounded-lg text-sm
              bg-vault-surface border border-vault-border
              text-text-primary placeholder:text-text-muted
              focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30
              transition-colors duration-200"
          />
        </div>

        {/* Skin selector */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">
            Snake Skin
          </label>
          <SkinSelector selectedSkin={selectedSkin} onSelect={onSkinChange} />
        </div>

        {/* Grid size */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">
            Grid Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {GRID_SIZES.map(g => {
              const isSelected = gridSize === g.id
              return (
                <button
                  key={g.id}
                  onClick={() => onSettingsChange({ gridSize: g.id })}
                  className={`flex flex-col items-center py-2.5 px-1 rounded-lg border transition-all duration-150
                    ${isSelected
                      ? 'border-accent-blue bg-accent-blue/10 text-accent-blue shadow-glow-sm'
                      : 'border-vault-border bg-vault-surface text-text-secondary hover:border-vault-muted'
                    }`}
                >
                  <span className="font-heading text-sm font-semibold">{g.name}</span>
                  <span className="text-xs opacity-70">{g.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">
            Difficulty
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DIFFICULTIES).map(([key, diff]) => {
              const isSelected = difficulty === key
              const colors = {
                casual:   isSelected ? 'border-difficulty-easy bg-emerald-500/10 text-difficulty-easy' : 'border-vault-border text-text-secondary hover:border-emerald-600',
                classic:  isSelected ? 'border-difficulty-medium bg-amber-500/10 text-difficulty-medium' : 'border-vault-border text-text-secondary hover:border-amber-600',
                hardcore: isSelected ? 'border-difficulty-hard bg-red-500/10 text-difficulty-hard' : 'border-vault-border text-text-secondary hover:border-red-600',
                insane:   isSelected ? 'border-accent-violet bg-violet-500/10 text-accent-violet' : 'border-vault-border text-text-secondary hover:border-violet-600',
              }
              return (
                <button
                  key={key}
                  onClick={() => onSettingsChange({ difficulty: key })}
                  className={`flex flex-col items-start p-3 rounded-lg border transition-all duration-150 text-left
                    ${colors[key]}`}
                >
                  <span className="font-heading text-sm font-semibold">{diff.name}</span>
                  <span className="text-xs opacity-70 mt-0.5 leading-tight">{diff.description}</span>
                  <span className="text-xs opacity-60 mt-1">×{diff.multiplier} score</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Power-ups toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Power-ups</p>
            <p className="text-xs text-text-muted">Special items appear on the board</p>
          </div>
          <button
            onClick={() => onSettingsChange({ powerupsOn: !powerupsOn })}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0
              ${powerupsOn ? 'bg-accent-blue' : 'bg-vault-muted'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
              ${powerupsOn ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pb-2">
          <button
            onClick={onHowToPlay}
            title="How to Play"
            className="px-3 py-3 rounded-lg border border-vault-border text-text-muted
              hover:border-accent-blue hover:text-accent-blue transition-colors duration-200
              font-heading font-bold text-sm flex-shrink-0"
          >
            ?
          </button>
          <button
            onClick={onLeaderboard}
            className="flex-1 py-3 rounded-lg border border-vault-border text-text-secondary
              hover:border-accent-blue hover:text-accent-blue transition-colors duration-200
              font-heading font-semibold text-sm"
          >
            🏆 Scores
          </button>
          <button
            onClick={onPlay}
            className="flex-[2] px-8 py-3 rounded-lg bg-accent-blue hover:bg-blue-500 text-white
              font-heading font-bold text-lg transition-all duration-200
              shadow-glow-sm hover:shadow-glow-blue hover:scale-105 active:scale-100"
          >
            ▶ Play
          </button>
        </div>
      </div>
    </div>
  )
}
