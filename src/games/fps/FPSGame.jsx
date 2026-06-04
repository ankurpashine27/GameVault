/**
 * Grimhold — root component & screen state machine.
 * screens: menu | episodes | story | playing | levelcomplete | armory |
 *          gameover | leaderboard | achievements | pause | victory
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import GameCanvas from './GameCanvas.jsx'
import HUD from './HUD.jsx'
import MainMenuScreen from './MainMenuScreen.jsx'
import EpisodeSelectScreen from './EpisodeSelectScreen.jsx'
import StoryScreen from './StoryScreen.jsx'
import ArmoryScreen from './ArmoryScreen.jsx'
import LevelCompleteScreen from './LevelCompleteScreen.jsx'
import GameOverScreen from './GameOverScreen.jsx'
import PauseMenu from './PauseMenu.jsx'
import Leaderboard from './Leaderboard.jsx'
import AchievementsPanel from './AchievementsPanel.jsx'
import HowToPlay from './HowToPlay.jsx'
import { useFPSSettings } from './hooks/useFPSSettings.js'
import { useAudio } from './hooks/useAudio.js'
import { usePointerLock } from './hooks/usePointerLock.js'
import { useFPSGame } from './hooks/useFPSGame.js'
import { EPISODES, LEVEL_META, buildCampaignLevel, buildTutorialLevel, levelMeta, episodeLevels, nextLevelId } from './levels/index.js'
import { endlessFloor } from './engine/infiniteGenerator.js'
import { ACHIEVEMENTS } from './data/achievements.js'

export default function FPSGame({ onClose }) {
  const settingsApi = useFPSSettings()
  const audio = useAudio(settingsApi.settings)
  const canvasRef = useRef(null)
  const [screen, setScreen] = useState('menu')
  const screenRef = useRef('menu')
  const go = useCallback((s) => { screenRef.current = s; setScreen(s) }, [])

  const [story, setStory] = useState(null)
  const [levelResult, setLevelResult] = useState(null)
  const [gameOverResult, setGameOverResult] = useState(null)
  const [toasts, setToasts] = useState([])
  const [engaged, setEngaged] = useState(false)
  const currentLevelId = useRef(null)

  const toast = useCallback((id) => {
    const a = ACHIEVEMENTS.find(x => x.id === id); if (!a) return
    const tid = Date.now() + Math.random()
    setToasts(t => [...t, { tid, name: a.name }])
    setTimeout(() => setToasts(t => t.filter(x => x.tid !== tid)), 3200)
  }, [])

  const onLockChange = useCallback((locked) => {
    const s = screenRef.current
    if (locked) { if (s === 'pause' || s === 'playing') { gameRef.current && game.resume(); go('playing') } }
    else { if (s === 'playing' && game.isRunning()) { setEngaged(false); game.pause(); go('pause') } }
  }, []) // eslint-disable-line

  const pointer = usePointerLock(canvasRef, onLockChange)
  const game = useFPSGame({
    audio, settingsApi, canvasRef, pointer,
    callbacks: {
      toast,
      onAutoPause: () => go('pause'),
      onLevelComplete: (r) => { setLevelResult(r); go('levelcomplete') },
      onGameOver: (r) => onGameOver(r),
    },
  })
  const gameRef = game.gameRef

  // Exit pointer lock whenever we leave gameplay.
  useEffect(() => { if (screen !== 'playing' && document.pointerLockElement) document.exitPointerLock?.() }, [screen])

  // ─── Flow helpers ────────────────────────────────────────────────────────
  const beginCampaign = (diff) => { game.newRun(diff, false); openEpisode(1) }
  const openEpisode = (ep) => {
    game.runRef.current.episode = ep
    const e = EPISODES.find(x => x.id === ep)
    const firstId = episodeLevels(ep)[0].id
    setStory({ title: `Episode ${ep}: ${e.name}`, text: e.intro, label: 'Enter', next: () => startLevel(firstId) })
    go('story')
  }
  const startEpisode = (ep) => { game.newRun(settingsApi.settings.difficulty, false); openEpisode(ep) }
  const startEndless = () => { game.newRun(settingsApi.settings.difficulty, true); loadFloor(1) }
  const startTutorial = () => {
    game.newRun(settingsApi.settings.difficulty, false)
    game.runRef.current.episode = 1
    currentLevelId.current = 'tutorial'
    setEngaged(false)
    game.loadLevel(buildTutorialLevel())
    go('playing')
  }

  const startLevel = (id) => {
    currentLevelId.current = id
    setEngaged(false)
    game.runRef.current.episode = levelMeta(id).ep
    game.loadLevel(buildCampaignLevel(id))
    go('playing')
  }
  const loadFloor = (floor) => {
    setEngaged(false)
    game.runRef.current.floor = floor
    if (floor >= 10) toastIf('endless_10'); if (floor >= 25) toastIf('endless_25')
    game.loadLevel(endlessFloor(floor, game.runRef.current.diffName))
    go('playing')
  }
  const toastIf = (id) => { if (settingsApi.unlockAchievement(id)) toast(id) }

  const clickToPlay = () => { setEngaged(true); game.resume(); go('playing'); if (pointer.supported) pointer.request() }

  const onContinueComplete = () => {
    const run = game.runRef.current
    if (currentLevelId.current === 'tutorial') { game.stop(); go('menu'); return }
    if (run.endless) { loadFloor(run.floor + 1); return }
    const cur = levelMeta(currentLevelId.current)
    if (levelResult.isBoss) {
      // Episode complete
      const ep = cur.ep
      if (ep === 1) toastIf('ep1'); if (ep === 2) toastIf('ep2')
      if (run.diffName === 'nightmare') toastIf('nightmare_ep')
      const prog = settingsApi.getProgress()
      settingsApi.saveProgress({ ...prog, episodesUnlocked: Math.max(prog.episodesUnlocked || 1, ep + 1) })
      settingsApi.addCampaignRecord({ playerName: settingsApi.playerName, episode: ep, time: Math.round(run._epTime || 0), gold: run.gold, diff: run.diffName })
      const next = nextLevelId(currentLevelId.current)
      const epDef = EPISODES.find(e => e.id === ep)
      if (next) {
        setStory({
          title: `${epDef.name} — Cleared`, text: epDef.outro, label: 'Descend',
          next: () => openEpisode(ep + 1),
        })
        go('story')
      } else {
        toastIf('full_campaign')
        setStory({ title: 'Castle Dread Falls', text: epDef.outro + '\n\nYou are the hunter who walked out of Grimhold alive.', label: 'Roll Credits', next: () => go('menu') })
        go('victory')
      }
    } else {
      go('armory')
    }
  }

  const onArmoryContinue = () => { const next = nextLevelId(currentLevelId.current); if (next) startLevel(next); else go('menu') }

  function onGameOver(r) {
    const run = game.runRef.current
    if (run.endless) {
      const score = Math.round(r.gold * Math.max(1, r.floor))
      settingsApi.addEndlessScore({ playerName: settingsApi.playerName, score, floor: r.floor, diff: r.diffName })
    }
    // count-based achievements
    if ((settingsApi.stats.totalKills || 0) >= 100) toastIf('headhunter')
    if ((settingsApi.stats.totalGold || 0) >= 5000) toastIf('treasure')
    setGameOverResult(r); go('gameover')
  }

  const restartLevel = () => {
    const run = game.runRef.current
    if (run.endless) loadFloor(run.floor)
    else startLevel(currentLevelId.current)
  }

  // Esc fallback (when pointer lock unsupported / not engaged)
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !e.shiftKey && screenRef.current === 'playing') { e.stopPropagation(); game.pause(); go('pause') } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }) // eslint-disable-line

  const unlocked = (settingsApi.getProgress().episodesUnlocked) || 1
  const showOverlay = screen === 'playing' && !pointer.locked && !engaged

  return (
    <div className="relative w-full h-full bg-black overflow-hidden" style={{ touchAction: 'none' }}>
      {/* Canvas — present during play and result screens so the frozen frame shows */}
      <div className="absolute inset-0" style={{ display: ['playing', 'pause', 'levelcomplete', 'gameover'].includes(screen) ? 'block' : 'none' }}>
        <GameCanvas ref={canvasRef} onCanvasClick={showOverlay ? clickToPlay : undefined} />
      </div>

      {screen === 'playing' && <HUD hud={game.hud} onMinimap={() => { const g = gameRef.current; if (g) g.showMinimap = !g.showMinimap }} />}

      {showOverlay && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 cursor-pointer" onClick={clickToPlay}>
          <div className="text-center">
            <div className="text-2xl font-black text-red-300 mb-2">Click to play</div>
            <div className="text-white/50 text-sm">WASD move · Mouse aim · Click/Space fire · E interact · Tab map · 1–8 weapons · Esc pause</div>
          </div>
        </div>
      )}

      {screen === 'menu' && (
        <MainMenuScreen settingsApi={settingsApi}
          onPlay={beginCampaign} onEpisodes={() => go('episodes')}
          onLeaderboard={() => go('leaderboard')} onAchievements={() => go('achievements')}
          onHowTo={() => go('howto')} onClose={onClose} />
      )}
      {screen === 'episodes' && (
        <EpisodeSelectScreen unlocked={unlocked} onStartEpisode={startEpisode} onEndless={startEndless} onBack={() => go('menu')} />
      )}
      {(screen === 'story' || screen === 'victory') && story && (
        <StoryScreen title={story.title} text={story.text} buttonLabel={story.label} onContinue={story.next} />
      )}
      {screen === 'levelcomplete' && levelResult && (
        <LevelCompleteScreen result={levelResult} onContinue={onContinueComplete} />
      )}
      {screen === 'armory' && (
        <ArmoryScreen run={game.runRef.current} onContinue={onArmoryContinue} />
      )}
      {screen === 'gameover' && gameOverResult && (
        <GameOverScreen result={gameOverResult} onRetry={restartLevel} onMenu={() => { game.stop(); go('menu') }} />
      )}
      {screen === 'pause' && (
        <PauseMenu settings={settingsApi.settings} updateSettings={settingsApi.updateSettings}
          onResume={clickToPlay} onRestart={restartLevel} onMenu={() => { game.stop(); go('menu') }} />
      )}
      {screen === 'leaderboard' && <Leaderboard data={settingsApi.getLeaderboard()} onClose={() => go('menu')} />}
      {screen === 'achievements' && <AchievementsPanel unlocked={settingsApi.achievements} onClose={() => go('menu')} />}
      {screen === 'howto' && <HowToPlay onClose={() => go('menu')} onTutorial={startTutorial} />}

      {/* Achievement toasts */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 space-y-1.5 pointer-events-none">
        {toasts.map(t => (
          <div key={t.tid} className="bg-red-700/90 text-white font-bold text-sm rounded-lg px-4 py-2 shadow-lg">🏅 {t.name}</div>
        ))}
      </div>
    </div>
  )
}
