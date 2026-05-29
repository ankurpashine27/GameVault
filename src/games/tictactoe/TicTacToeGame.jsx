import { useState, useEffect, useRef, useCallback } from 'react'
import { useTicTacToeSettings } from './hooks/useTicTacToeSettings.js'
import { useTicTacToeGame }    from './hooks/useTicTacToeGame.js'
import { useAI }               from './hooks/useAI.js'
import { useAudio }            from './hooks/useAudio.js'
import PreGameScreen           from './PreGameScreen.jsx'
import GameCanvas              from './GameCanvas.jsx'
import SeriesTracker           from './SeriesTracker.jsx'
import PauseMenu               from './PauseMenu.jsx'
import GameOverScreen          from './GameOverScreen.jsx'
import Leaderboard             from './Leaderboard.jsx'
import {
  BOARD_MODES, SERIES_MODES, POWER_UPS,
  P1_COLOR, P2_COLOR,
} from './constants.js'

// ─── Power-up HUD Button ───────────────────────────────────────────────────────
function PowerUpButton({ id, used, armed, onClick, playerColor }) {
  const info    = POWER_UPS[id]
  const isArmed = armed === id
  return (
    <button
      onClick={() => !used && onClick(id)}
      disabled={used}
      title={info.description}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium
        transition-all duration-150 select-none
        ${used
          ? 'opacity-30 cursor-not-allowed border-vault-border text-text-muted'
          : isArmed
            ? 'scale-105 border-2'
            : 'border-vault-border hover:border-vault-muted text-text-secondary hover:text-text-primary cursor-pointer'
        }`}
      style={isArmed ? {
        borderColor:     playerColor,
        backgroundColor: playerColor + '22',
        color:           playerColor,
        boxShadow:       `0 0 8px ${playerColor}44`,
      } : undefined}
    >
      <span>{info.icon}</span>
      <span className="hidden sm:inline">{info.label}</span>
    </button>
  )
}

// ─── HUD bar ──────────────────────────────────────────────────────────────────
function HUD({
  currentPlayer, gameStatus,
  p1Name, p2Name, p1Avatar, p2Avatar,
  vsAI, aiDifficulty,
  powerUps, armedPowerUp, extraTurnActive,
  timerLeft, timerSeconds,
  muted, onToggleMute,
  onArmPowerUp,
  onPause,
}) {
  const isP1      = currentPlayer === 'X'
  const curName   = isP1 ? p1Name : (vsAI ? `AI (${aiDifficulty})` : p2Name)
  const curAvatar = isP1 ? p1Avatar : p2Avatar
  const curColor  = isP1 ? P1_COLOR : P2_COLOR
  const isThinking = gameStatus === 'ai_thinking'
  const curPu     = powerUps[currentPlayer]
  const hasPowerUps = curPu && !Object.values(curPu).every(Boolean)

  return (
    <div className="flex items-center gap-3 pl-3 pr-24 py-2
      bg-vault-surface border-b border-vault-border flex-shrink-0">

      {/* Current player */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-xl flex-shrink-0"
          style={{ filter: `drop-shadow(0 0 6px ${curColor}88)` }}>
          {curAvatar}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold truncate" style={{ color: curColor }}>
              {curName}
            </span>
            {isThinking && (
              <span className="text-[10px] text-text-muted italic">thinking…</span>
            )}
            {extraTurnActive && (
              <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1 rounded font-medium">
                ⚡ Extra
              </span>
            )}
            {armedPowerUp && (
              <span className="text-[10px] bg-accent-blue/20 text-accent-blue px-1 rounded font-medium animate-pulse">
                Armed
              </span>
            )}
          </div>
          <div className="text-[10px] text-text-muted">
            {isThinking
              ? '...'
              : armedPowerUp === 'block'
                ? 'Click empty cell to block'
                : armedPowerUp === 'swap'
                  ? "Click opponent's piece"
                  : 'Your turn'}
          </div>
        </div>
      </div>

      {/* Timer */}
      {timerSeconds > 0 && timerLeft > 0 && !isThinking && (
        <div className="flex flex-col items-center flex-shrink-0">
          <span
            className="font-mono font-bold text-sm"
            style={{ color: timerLeft <= 3 ? '#ef4444' : '#94A3B8' }}
          >
            {timerLeft}s
          </span>
          <div className="w-12 h-1 bg-vault-muted rounded-full overflow-hidden mt-0.5">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${(timerLeft / timerSeconds) * 100}%`,
                backgroundColor: timerLeft <= 3 ? '#ef4444' : curColor,
              }}
            />
          </div>
        </div>
      )}

      {/* Power-ups (current human player only) */}
      {hasPowerUps && !isThinking && gameStatus === 'playing' && (
        <div className="flex gap-1 flex-shrink-0">
          {Object.keys(POWER_UPS).map(id => (
            <PowerUpButton
              key={id} id={id}
              used={curPu[id]}
              armed={armedPowerUp}
              onClick={onArmPowerUp}
              playerColor={curColor}
            />
          ))}
        </div>
      )}

      {/* Mute */}
      <button
        onClick={onToggleMute}
        className="text-text-muted hover:text-text-primary transition-colors
          w-8 h-8 flex items-center justify-center rounded-lg hover:bg-vault-elevated flex-shrink-0"
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      {/* Pause */}
      <button
        onClick={onPause}
        className="text-text-muted hover:text-text-primary transition-colors
          w-8 h-8 flex items-center justify-center rounded-lg hover:bg-vault-elevated flex-shrink-0"
        aria-label="Pause"
      >
        ⏸
      </button>
    </div>
  )
}

// ─── Root Component ────────────────────────────────────────────────────────────
export default function TicTacToeGame({ onClose }) {
  const {
    p1Name, setP1Name, p2Name, setP2Name,
    p1Avatar, setP1Avatar, p2Avatar, setP2Avatar,
    settings, updateSettings,
    saveMatchToHistory, getHistory,
  } = useTicTacToeSettings()

  // ── Audio ─────────────────────────────────────────────────────────────────
  // Build the audio-settings object from game settings.
  // The hook re-reads settingsRef so stable destructured references are safe.
  const audioSettings = {
    sfxVol:     settings.sfxVol  ?? 1.0,
    musicVol:   settings.musicVol ?? 0.35,
    musicTrack: settings.musicTrack ?? 'ambient',
  }
  const { play, startTrack, stopTrack, ensureCtx } = useAudio(audioSettings)

  // muted = sfxVol === 0 (single toggle for both SFX/music)
  const muted         = audioSettings.sfxVol <= 0 && audioSettings.musicVol <= 0
  const toggleMute    = useCallback(() => {
    if (muted) {
      updateSettings({ sfxVol: 1.0, musicVol: 0.35 })
    } else {
      updateSettings({ sfxVol: 0, musicVol: 0 })
    }
  }, [muted, updateSettings])

  const {
    board, currentPlayer, gameStatus, winResult,
    seriesScore, seriesWinner,
    powerUps, armedPowerUp, extraTurnActive, blockedCells,
    timerLeft, lastEvent,
    startGame, startNextGame, resetAll,
    placePiece, applyAIMove, armPowerUp,
    getConfig,
  } = useTicTacToeGame()

  const { computeMove } = useAI()

  // Screen: 'pregame' | 'playing' | 'paused' | 'gameover' | 'leaderboard'
  const [screen, setScreen] = useState('pregame')
  const [prevScreen, setPrevScreen] = useState('pregame')

  const cancelAIRef = useRef(null)

  // ── AI trigger ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameStatus !== 'ai_thinking' || screen !== 'playing') return
    const cfg = getConfig()
    const { size, winLength } = BOARD_MODES[cfg.boardMode]
    const cancel = computeMove(
      board, size, winLength, cfg.aiDifficulty, 'O', 'X',
      ([r, c]) => applyAIMove(r, c)
    )
    cancelAIRef.current = cancel
    return () => { if (cancelAIRef.current) cancelAIRef.current() }
  }, [gameStatus, screen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save match history ────────────────────────────────────────────────────
  const savedRef = useRef(false)
  useEffect(() => {
    if (gameStatus !== 'gameover' || savedRef.current) return
    const cfg = getConfig()
    const isSeries   = cfg.seriesWinsNeeded > 1
    const seriesEnded = !!seriesWinner
    if (!isSeries || seriesEnded) {
      savedRef.current = true
      saveMatchToHistory({
        boardMode: cfg.boardMode, vsAI: cfg.vsAI, aiDifficulty: cfg.aiDifficulty,
        seriesMode: settings.seriesMode,
        p1Name, p2Name, p1Avatar, p2Avatar,
        winner: winResult?.draw ? 'draw' : (winResult?.winner || null),
        p1Score: seriesScore.X, p2Score: seriesScore.O,
      })
    }
  }, [gameStatus, seriesWinner]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (gameStatus === 'playing') savedRef.current = false
  }, [gameStatus])

  // ── Screen transitions ────────────────────────────────────────────────────
  useEffect(() => {
    if (gameStatus === 'gameover' && screen === 'playing') setScreen('gameover')
  }, [gameStatus, screen])

  // ── Music lifecycle ───────────────────────────────────────────────────────
  useEffect(() => {
    if (screen === 'playing') {
      startTrack(settings.musicTrack)
    } else {
      stopTrack()
    }
  }, [screen, settings.musicTrack]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── SFX from game events ──────────────────────────────────────────────────
  useEffect(() => {
    if (!lastEvent) return
    if (lastEvent.type === 'place') {
      play('place')
    } else if (lastEvent.type === 'gameover') {
      if      (lastEvent.result === 'draw') play('draw')
      else if (lastEvent.result === 'X')    play('win')
      else if (lastEvent.result === 'O')    play(lastEvent.vsAI ? 'lose' : 'win')
    } else if (lastEvent.type === 'powerUpArm') {
      play('powerUpArm')
    }
  }, [lastEvent]) // eslint-disable-line react-hooks/exhaustive-deps

  // Timer tick SFX
  const prevTimerRef = useRef(null)
  useEffect(() => {
    if (timerLeft <= 3 && timerLeft > 0 && timerLeft !== prevTimerRef.current && screen === 'playing') {
      play('timerTick')
    }
    prevTimerRef.current = timerLeft
  }, [timerLeft]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && e.shiftKey) return   // let GameFrame handle Shift+Esc
      if (e.key === 'Escape') {
        e.stopPropagation()
        if      (screen === 'playing') setScreen('paused')
        else if (screen === 'paused')  setScreen('playing')
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [screen])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePlay = useCallback(() => {
    const seriesModeObj = SERIES_MODES.find(s => s.id === settings.seriesMode) || SERIES_MODES[0]
    startGame({
      boardMode: settings.boardMode, vsAI: settings.vsAI,
      aiDifficulty: settings.aiDifficulty, seriesWinsNeeded: seriesModeObj.wins,
      powerupsOn: settings.powerupsOn, timerSeconds: settings.timerSeconds,
    })
    ensureCtx()   // warm the AudioContext on user gesture
    setScreen('playing')
  }, [settings, startGame, ensureCtx])

  const handleNextGame = useCallback(() => {
    startNextGame(getConfig())
    setScreen('playing')
  }, [getConfig, startNextGame])

  const handlePlayAgain = useCallback(() => {
    resetAll()
    setScreen('pregame')
  }, [resetAll])

  const handleRestart = useCallback(() => {
    resetAll()
    setScreen('pregame')
  }, [resetAll])

  const handleLeaderboard = useCallback(() => {
    setPrevScreen(screen)
    setScreen('leaderboard')
  }, [screen])

  const handleCloseLeaderboard = useCallback(() => {
    setScreen(prevScreen)
  }, [prevScreen])

  const handleCellClick = useCallback((r, c) => {
    placePiece(r, c)
  }, [placePiece])

  // ── Derived values ─────────────────────────────────────────────────────────
  const cfg            = getConfig()
  const isShowingBoard = screen === 'playing' || screen === 'paused' || screen === 'gameover'

  return (
    <div className="flex flex-col h-full"
      style={{
        // Background colour fills the border/padding areas outside the canvas
        backgroundColor: '#080B14',
      }}
    >

      {/* ── PRE-GAME ── */}
      {screen === 'pregame' && (
        <PreGameScreen
          p1Name={p1Name}       setP1Name={setP1Name}
          p2Name={p2Name}       setP2Name={setP2Name}
          p1Avatar={p1Avatar}   setP1Avatar={setP1Avatar}
          p2Avatar={p2Avatar}   setP2Avatar={setP2Avatar}
          settings={settings}
          updateSettings={updateSettings}
          onPlay={handlePlay}
          onLeaderboard={handleLeaderboard}
          onClose={onClose}
        />
      )}

      {/* ── PLAYING / PAUSED / GAME-OVER (board stays mounted) ── */}
      {isShowingBoard && board && (
        <>
          {screen !== 'gameover' && (
            <HUD
              currentPlayer={currentPlayer} gameStatus={gameStatus}
              p1Name={p1Name} p2Name={p2Name}
              p1Avatar={p1Avatar} p2Avatar={p2Avatar}
              vsAI={cfg.vsAI} aiDifficulty={cfg.aiDifficulty}
              powerUps={powerUps} armedPowerUp={armedPowerUp}
              extraTurnActive={extraTurnActive}
              timerLeft={timerLeft} timerSeconds={cfg.timerSeconds}
              muted={muted} onToggleMute={toggleMute}
              onArmPowerUp={armPowerUp}
              onPause={() => setScreen(screen === 'playing' ? 'paused' : 'playing')}
            />
          )}

          <SeriesTracker
            seriesScore={seriesScore}
            seriesWinsNeeded={cfg.seriesWinsNeeded}
            p1Name={p1Name} p2Name={p2Name}
            p1Avatar={p1Avatar} p2Avatar={p2Avatar}
            currentPlayer={currentPlayer}
            seriesMode={settings.seriesMode}
          />

          {/* Canvas board fills remaining space */}
          <div className="flex-1 flex flex-col relative overflow-hidden" style={{ minHeight: 0 }}>
            <GameCanvas
              board={board}
              size={BOARD_MODES[cfg.boardMode]?.size || 3}
              winCells={winResult?.cells}
              blockedCells={blockedCells}
              currentPlayer={currentPlayer}
              armedPowerUp={screen === 'playing' ? armedPowerUp : null}
              gameStatus={gameStatus}
              p1Avatar={p1Avatar}
              p2Avatar={p2Avatar}
              onCellClick={handleCellClick}
              isAIThinking={gameStatus === 'ai_thinking'}
              background={settings.background}
            />

            {screen === 'paused' && (
              <PauseMenu
                settings={settings}
                onSettingsChange={updateSettings}
                onResume={() => setScreen('playing')}
                onRestart={handleRestart}
                onLeaderboard={handleLeaderboard}
              />
            )}
          </div>

          {screen === 'gameover' && (
            <GameOverScreen
              winResult={winResult}
              seriesScore={seriesScore}
              seriesWinner={seriesWinner}
              seriesWinsNeeded={cfg.seriesWinsNeeded}
              settings={settings}
              p1Name={p1Name} p2Name={p2Name}
              p1Avatar={p1Avatar} p2Avatar={p2Avatar}
              vsAI={cfg.vsAI}
              onPlayAgain={handlePlayAgain}
              onNextGame={handleNextGame}
              onLeaderboard={handleLeaderboard}
            />
          )}
        </>
      )}

      {/* ── LEADERBOARD ── */}
      {screen === 'leaderboard' && (
        <Leaderboard
          history={getHistory()}
          p1Name={p1Name}
          p2Name={p2Name}
          onClose={handleCloseLeaderboard}
        />
      )}
    </div>
  )
}
