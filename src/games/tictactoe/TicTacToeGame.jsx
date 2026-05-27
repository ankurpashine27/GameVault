import { useState, useEffect, useRef, useCallback } from 'react'
import { useTicTacToeSettings } from './hooks/useTicTacToeSettings.js'
import { useTicTacToeGame } from './hooks/useTicTacToeGame.js'
import { useAI } from './hooks/useAI.js'
import PreGameScreen from './PreGameScreen.jsx'
import GameBoard from './GameBoard.jsx'
import SeriesTracker from './SeriesTracker.jsx'
import PauseMenu from './PauseMenu.jsx'
import GameOverScreen from './GameOverScreen.jsx'
import Leaderboard from './Leaderboard.jsx'
import {
  BOARD_MODES, SERIES_MODES, POWER_UPS,
  P1_COLOR, P2_COLOR,
} from './constants.js'

// ─── Power-up HUD Button ───────────────────────────────────────────────────────
function PowerUpButton({ id, pu, used, armed, onClick, playerColor }) {
  const info = POWER_UPS[id]
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
        borderColor: playerColor,
        backgroundColor: playerColor + '22',
        color: playerColor,
        boxShadow: `0 0 8px ${playerColor}44`,
      } : undefined}
    >
      <span>{info.icon}</span>
      <span className="hidden sm:inline">{info.label}</span>
    </button>
  )
}

// ─── HUD (shown during play and pause) ────────────────────────────────────────
function HUD({
  currentPlayer, gameStatus,
  p1Name, p2Name, p1Avatar, p2Avatar,
  vsAI, aiDifficulty,
  powerUps, armedPowerUp, extraTurnActive,
  timerLeft, timerSeconds,
  onArmPowerUp,
  onPause,
}) {
  const isP1 = currentPlayer === 'X'
  const curName  = isP1 ? p1Name  : (vsAI ? `AI (${aiDifficulty})` : p2Name)
  const curAvatar = isP1 ? p1Avatar : p2Avatar
  const curColor = isP1 ? P1_COLOR : P2_COLOR

  const isThinking = gameStatus === 'ai_thinking'
  const curPu = powerUps[currentPlayer]
  const hasPowerUps = curPu && !Object.values(curPu).every(Boolean) // at least one unused

  return (
    <div className="flex items-center gap-3 px-3 py-2
      bg-vault-surface border-b border-vault-border flex-shrink-0">

      {/* Current player indicator */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span
          className="text-xl flex-shrink-0"
          style={{ filter: `drop-shadow(0 0 6px ${curColor}88)` }}
        >
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
            {isThinking ? '...' : armedPowerUp === 'block' ? 'Click empty cell to block' : armedPowerUp === 'swap' ? "Click opponent's piece to swap" : 'Your turn'}
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

      {/* Power-up buttons (only show for current human player) */}
      {hasPowerUps && !isThinking && gameStatus === 'playing' && (
        <div className="flex gap-1 flex-shrink-0">
          {Object.keys(POWER_UPS).map(id => (
            <PowerUpButton
              key={id}
              id={id}
              used={curPu[id]}
              armed={armedPowerUp}
              onClick={onArmPowerUp}
              playerColor={curColor}
            />
          ))}
        </div>
      )}

      {/* Pause */}
      <button
        onClick={onPause}
        className="text-text-muted hover:text-text-primary transition-colors
          w-8 h-8 flex items-center justify-center rounded-lg
          hover:bg-vault-elevated flex-shrink-0"
        aria-label="Pause"
      >
        ⏸
      </button>
    </div>
  )
}

// ─── Root Component ────────────────────────────────────────────────────────────
export default function TicTacToeGame() {
  const {
    p1Name, setP1Name, p2Name, setP2Name,
    p1Avatar, setP1Avatar, p2Avatar, setP2Avatar,
    settings, updateSettings,
    saveMatchToHistory, getHistory,
  } = useTicTacToeSettings()

  const {
    board, currentPlayer, gameStatus, winResult,
    seriesScore, seriesWinner,
    powerUps, armedPowerUp, extraTurnActive, blockedCells,
    timerLeft,
    startGame, startNextGame, resetAll,
    placePiece, applyAIMove, armPowerUp,
    getConfig,
  } = useTicTacToeGame()

  const { computeMove } = useAI()

  // Screen: 'pregame' | 'playing' | 'paused' | 'gameover' | 'leaderboard'
  const [screen, setScreen] = useState('pregame')
  const [prevScreen, setPrevScreen] = useState('pregame')

  const cancelAIRef = useRef(null)

  // ── Trigger AI when status === 'ai_thinking' ─────────────────────────────────
  useEffect(() => {
    if (gameStatus !== 'ai_thinking' || screen !== 'playing') return

    const cfg = getConfig()
    const { size, winLength } = BOARD_MODES[cfg.boardMode]

    const cancel = computeMove(
      board, size, winLength, cfg.aiDifficulty, 'O', 'X',
      ([r, c]) => applyAIMove(r, c)
    )
    cancelAIRef.current = cancel
    return () => {
      if (cancelAIRef.current) cancelAIRef.current()
    }
  }, [gameStatus, screen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save match to history when a full series or single game ends ─────────────
  const savedRef = useRef(false)
  useEffect(() => {
    if (gameStatus !== 'gameover' || savedRef.current) return

    const cfg = getConfig()
    const isSeries = cfg.seriesWinsNeeded > 1
    const seriesEnded = !!seriesWinner

    // For single games, always save; for series, save only when series ends
    if (!isSeries || seriesEnded) {
      savedRef.current = true
      saveMatchToHistory({
        boardMode: cfg.boardMode,
        vsAI: cfg.vsAI,
        aiDifficulty: cfg.aiDifficulty,
        seriesMode: settings.seriesMode,
        p1Name, p2Name,
        p1Avatar, p2Avatar,
        winner: winResult?.draw ? 'draw' : (winResult?.winner || null),
        p1Score: seriesScore.X,
        p2Score: seriesScore.O,
      })
    }
  }, [gameStatus, seriesWinner]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset savedRef on new game
  useEffect(() => {
    if (gameStatus === 'playing') savedRef.current = false
  }, [gameStatus])

  // ── When gameStatus becomes 'gameover', show gameover screen ────────────────
  useEffect(() => {
    if (gameStatus === 'gameover' && screen === 'playing') {
      setScreen('gameover')
    }
  }, [gameStatus, screen])

  // ── Keyboard handler ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      // Let GameFrame handle Shift+Esc
      if (e.key === 'Escape' && e.shiftKey) return

      if (e.key === 'Escape') {
        e.stopPropagation()
        if (screen === 'playing') setScreen('paused')
        else if (screen === 'paused') setScreen('playing')
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [screen])

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handlePlay = useCallback(() => {
    const seriesModeObj = SERIES_MODES.find(s => s.id === settings.seriesMode) || SERIES_MODES[0]
    startGame({
      boardMode: settings.boardMode,
      vsAI: settings.vsAI,
      aiDifficulty: settings.aiDifficulty,
      seriesWinsNeeded: seriesModeObj.wins,
      powerupsOn: settings.powerupsOn,
      timerSeconds: settings.timerSeconds,
    })
    setScreen('playing')
  }, [settings, startGame])

  const handleNextGame = useCallback(() => {
    const cfg = getConfig()
    startNextGame(cfg)
    setScreen('playing')
  }, [getConfig, startNextGame])

  const handlePlayAgain = useCallback(() => {
    resetAll()
    setScreen('pregame')
  }, [resetAll])

  const handleRestart = useCallback(() => {
    const cfg = getConfig()
    resetAll()
    setScreen('pregame')
  }, [getConfig, resetAll])

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

  // ── Derive display values ─────────────────────────────────────────────────────
  const cfg = getConfig()
  const modeConfig = BOARD_MODES[cfg.boardMode] || BOARD_MODES.classic
  // Keep board visible during gameover so the winning move is shown behind the result overlay
  const isShowingBoard = screen === 'playing' || screen === 'paused' || screen === 'gameover'

  return (
    <div className="flex flex-col h-full bg-vault-bg">

      {/* ── PRE-GAME ── */}
      {screen === 'pregame' && (
        <PreGameScreen
          p1Name={p1Name} setP1Name={setP1Name}
          p2Name={p2Name} setP2Name={setP2Name}
          p1Avatar={p1Avatar} setP1Avatar={setP1Avatar}
          p2Avatar={p2Avatar} setP2Avatar={setP2Avatar}
          settings={settings}
          updateSettings={updateSettings}
          onPlay={handlePlay}
          onLeaderboard={handleLeaderboard}
        />
      )}

      {/* ── PLAYING / PAUSED / GAME OVER (board stays mounted) ── */}
      {isShowingBoard && board && (
        <>
          {/* Hide HUD when game is over — it's distracting */}
          {screen !== 'gameover' && (
            <HUD
              currentPlayer={currentPlayer}
              gameStatus={gameStatus}
              p1Name={p1Name} p2Name={p2Name}
              p1Avatar={p1Avatar} p2Avatar={p2Avatar}
              vsAI={cfg.vsAI}
              aiDifficulty={cfg.aiDifficulty}
              powerUps={powerUps}
              armedPowerUp={armedPowerUp}
              extraTurnActive={extraTurnActive}
              timerLeft={timerLeft}
              timerSeconds={cfg.timerSeconds}
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

          <div className="flex-1 relative overflow-hidden flex flex-col"
            style={{ minHeight: 0 }}>
            <GameBoard
              board={board}
              size={modeConfig.size}
              winCells={winResult?.cells}
              blockedCells={blockedCells}
              currentPlayer={currentPlayer}
              armedPowerUp={screen === 'playing' ? armedPowerUp : null}
              gameStatus={gameStatus}
              p1Avatar={p1Avatar}
              p2Avatar={p2Avatar}
              onCellClick={handleCellClick}
              isAIThinking={gameStatus === 'ai_thinking'}
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

          {/* Game Over panel — anchored below the board so winning cells stay fully visible */}
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
