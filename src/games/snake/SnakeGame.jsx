import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSnakeSettings } from './hooks/useSnakeSettings.js'
import { useSnakeGame } from './hooks/useSnakeGame.js'
import { DIFFICULTIES, POWER_UP_TYPES } from './constants.js'
import PreGameScreen from './PreGameScreen.jsx'
import PauseMenu from './PauseMenu.jsx'
import GameOverScreen from './GameOverScreen.jsx'
import Leaderboard from './Leaderboard.jsx'
import HowToPlay from './HowToPlay.jsx'
import GameBoard from './GameBoard.jsx'
import DPad from './DPad.jsx'

// Detect touch/pointer-coarse devices
const isTouchDevice = () =>
  typeof navigator !== 'undefined' && (
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  )

function HUD({ score, personalBest, activeEffect, difficulty, powerupsOn, onPause }) {
  const diffConfig = DIFFICULTIES[difficulty]
  const diffColors = {
    casual: 'text-difficulty-easy border-difficulty-easy',
    classic: 'text-difficulty-medium border-difficulty-medium',
    hardcore: 'text-difficulty-hard border-difficulty-hard',
    insane: 'text-accent-violet border-accent-violet',
  }

  const effectTimeLeft = activeEffect
    ? Math.max(0, Math.ceil((activeEffect.expiresAt - Date.now()) / 1000))
    : 0
  const effectDuration = activeEffect ? (DIFFICULTIES[difficulty]?.speed ? 8 : 8) : 0
  const puConfig = activeEffect ? POWER_UP_TYPES[activeEffect.type] : null

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-vault-elevated border-b border-vault-border flex-shrink-0">
      {/* Score */}
      <div className="flex flex-col leading-none min-w-[60px]">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">Score</span>
        <span className="font-heading text-xl font-bold text-text-primary">{score}</span>
      </div>

      {/* Active effect */}
      <div className="flex-1 min-w-0">
        {activeEffect && puConfig && activeEffect.expiresAt !== Infinity && (
          <div className="flex items-center gap-2">
            <span className="text-sm">{puConfig.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium leading-none mb-1" style={{ color: puConfig.color }}>
                {puConfig.label}
              </p>
              <div className="h-1 bg-vault-muted rounded-full overflow-hidden w-full">
                <ActiveEffectBar effect={activeEffect} color={puConfig.color} />
              </div>
            </div>
            <span className="text-xs font-mono" style={{ color: puConfig.color }}>
              {effectTimeLeft}s
            </span>
          </div>
        )}
        {activeEffect && activeEffect.expiresAt === Infinity && puConfig && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{puConfig.icon}</span>
            <span className="text-xs font-medium" style={{ color: puConfig.color }}>{puConfig.label}</span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Personal best */}
        <div className="flex flex-col leading-none text-right">
          <span className="text-[10px] text-text-muted uppercase tracking-wider">Best</span>
          <span className="font-heading text-sm font-semibold text-text-secondary">{personalBest}</span>
        </div>

        {/* Difficulty badge */}
        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${diffColors[difficulty] || 'text-text-secondary border-vault-border'}`}>
          {diffConfig?.name}
        </span>

        {/* Pause button */}
        <button
          onClick={onPause}
          className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded hover:bg-vault-surface"
          title="Pause (Esc)"
        >
          ⏸
        </button>
      </div>
    </div>
  )
}

// Animated countdown bar — renders its own animation state
function ActiveEffectBar({ effect, color }) {
  if (!effect || effect.expiresAt === Infinity) return null
  const totalMs = effect.expiresAt - (effect.expiresAt - (effect.expiresAt % 1))
  // Use a CSS animation width from 100% → 0 over the duration
  const durationMs = effect.expiresAt - Date.now()
  if (durationMs <= 0) return null
  return (
    <div
      style={{
        height: '100%',
        backgroundColor: color,
        width: `${Math.max(0, Math.min(100, (durationMs / 8000) * 100))}%`,
        transition: 'width 1s linear',
        borderRadius: '2px',
      }}
    />
  )
}

export default function SnakeGame() {
  const [screen, setScreen] = useState('pregame')
  const [prevScreen, setPrevScreen] = useState('pregame')
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [finalPersonalBest, setFinalPersonalBest] = useState(0)
  const [prevPersonalBest, setPrevPersonalBest] = useState(0)
  const [isMobile] = useState(isTouchDevice)

  const {
    playerName, setPlayerName,
    skin, setSkin,
    settings, updateSettings,
    getPersonalBest, savePersonalBest,
    saveToLeaderboard, getLeaderboard,
  } = useSnakeSettings()

  const {
    snake, food, powerUpItem, activeEffect, obstacles,
    score, direction, shieldActive, isRunning, isGameOver,
    startGame, pauseGame, resumeGame, changeDirection, resetGame,
  } = useSnakeGame()

  // Personal best for current settings combo
  const personalBest = useMemo(() =>
    getPersonalBest(settings.gridSize, settings.difficulty),
    [settings.gridSize, settings.difficulty, getPersonalBest]
  )

  // Transition to game-over screen when hook signals it
  useEffect(() => {
    if (isGameOver && screen === 'playing') {
      const oldPb = getPersonalBest(settings.gridSize, settings.difficulty)
      const newRecord = savePersonalBest(settings.gridSize, settings.difficulty, score)
      const pb = getPersonalBest(settings.gridSize, settings.difficulty)
      setIsNewRecord(newRecord)
      setFinalPersonalBest(pb)
      setPrevPersonalBest(oldPb)
      saveToLeaderboard({
        name: playerName,
        score,
        gridSize: settings.gridSize,
        difficulty: settings.difficulty,
      })
      setScreen('gameover')
    }
  }, [isGameOver])

  // Keyboard handler
  useEffect(() => {
    const DIR_MAP = {
      ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
      w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
      W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT',
    }
    const onKey = (e) => {
      if (DIR_MAP[e.key] && screen === 'playing') {
        e.preventDefault()
        changeDirection(DIR_MAP[e.key])
        return
      }
      if (e.key === 'Escape' && !e.shiftKey) {
        e.stopPropagation() // don't let GameFrame see plain Esc
        if (screen === 'playing') {
          pauseGame()
          setScreen('paused')
        } else if (screen === 'paused') {
          resumeGame()
          setScreen('playing')
        }
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [screen, changeDirection, pauseGame, resumeGame])

  // ── Screen handlers ────────────────────────────────────────────────────
  const handlePlay = useCallback(() => {
    startGame(settings)
    setScreen('playing')
  }, [startGame, settings])

  const handlePause = useCallback(() => {
    pauseGame()
    setScreen('paused')
  }, [pauseGame])

  const handleResume = useCallback(() => {
    resumeGame()
    setScreen('playing')
  }, [resumeGame])

  const handleRestart = useCallback(() => {
    resetGame()
    setScreen('pregame')
  }, [resetGame])

  const handlePlayAgain = useCallback(() => {
    resetGame()
    setScreen('pregame')
  }, [resetGame])

  const openLeaderboard = useCallback((from) => {
    setPrevScreen(from || screen)
    setScreen('leaderboard')
  }, [screen])

  const closeLeaderboard = useCallback(() => {
    setScreen(prevScreen)
  }, [prevScreen])

  const openHowToPlay = useCallback((from) => {
    setPrevScreen(from || screen)
    setScreen('howtoplay')
  }, [screen])

  const closeHowToPlay = useCallback(() => {
    setScreen(prevScreen)
  }, [prevScreen])

  const showDPad = isMobile || settings.controlScheme === 'dpad'

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full h-full bg-[#0a0a0f] overflow-hidden relative">

      {/* PRE-GAME */}
      {screen === 'pregame' && (
        <PreGameScreen
          playerName={playerName}
          onPlayerNameChange={setPlayerName}
          selectedSkin={skin}
          onSkinChange={setSkin}
          settings={settings}
          onSettingsChange={updateSettings}
          onPlay={handlePlay}
          onLeaderboard={() => openLeaderboard('pregame')}
          onHowToPlay={() => openHowToPlay('pregame')}
        />
      )}

      {/* PLAYING / PAUSED */}
      {(screen === 'playing' || screen === 'paused') && (
        <>
          <HUD
            score={score}
            personalBest={personalBest}
            activeEffect={activeEffect}
            difficulty={settings.difficulty}
            powerupsOn={settings.powerupsOn}
            onPause={handlePause}
          />
          <div className={`flex-1 relative overflow-hidden ${showDPad ? 'flex flex-col' : ''}`}>
            <div className={showDPad ? 'flex-1 relative overflow-hidden' : 'w-full h-full'}>
              <GameBoard
                gridSize={settings.gridSize}
                snake={snake}
                food={food}
                powerUpItem={powerUpItem}
                obstacles={obstacles}
                direction={direction}
                skin={skin}
                onSwipe={settings.controlScheme !== 'dpad' ? changeDirection : undefined}
              />
            </div>
            {showDPad && <DPad onDirection={changeDirection} />}
            {screen === 'paused' && (
              <PauseMenu
                settings={settings}
                onSettingsChange={updateSettings}
                onResume={handleResume}
                onRestart={handleRestart}
                onLeaderboard={() => openLeaderboard('paused')}
                onHowToPlay={() => openHowToPlay('paused')}
              />
            )}
          </div>
        </>
      )}

      {/* GAME OVER */}
      {screen === 'gameover' && (
        <GameOverScreen
          score={score}
          gridSize={settings.gridSize}
          difficulty={settings.difficulty}
          playerName={playerName}
          isNewRecord={isNewRecord}
          personalBest={finalPersonalBest}
          prevPersonalBest={prevPersonalBest}
          onPlayAgain={handlePlayAgain}
          onLeaderboard={() => openLeaderboard('gameover')}
        />
      )}

      {/* LEADERBOARD overlay */}
      {screen === 'leaderboard' && (
        <Leaderboard
          entries={getLeaderboard()}
          playerName={playerName}
          onClose={closeLeaderboard}
        />
      )}

      {/* HOW TO PLAY overlay */}
      {screen === 'howtoplay' && (
        <HowToPlay onClose={closeHowToPlay} />
      )}
    </div>
  )
}
