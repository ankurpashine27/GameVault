/**
 * GameVault Game Registry
 * ========================
 * Maps game IDs (from games.json) to their React components.
 *
 * HOW TO ADD A NEW GAME — 3 Steps:
 *
 * Step 1 — Add an entry to src/data/games.json with a unique "id" field.
 *
 * Step 2 — Create your game component at src/games/<id>/index.jsx
 *   The component should fill its container (width: 100%, height: 100%).
 *   Use a canvas ref + requestAnimationFrame for game loops.
 *   Always clean up on unmount (return a cleanup function from useEffect).
 *
 *   Example:
 *     export default function YourGame() {
 *       const canvasRef = useRef(null)
 *       useEffect(() => {
 *         const canvas = canvasRef.current
 *         let raf
 *         const loop = () => { raf = requestAnimationFrame(loop) }
 *         raf = requestAnimationFrame(loop)
 *         return () => cancelAnimationFrame(raf)
 *       }, [])
 *       return <canvas ref={canvasRef} className="w-full h-full" />
 *     }
 *
 * Step 3 — Import and register below. The key MUST exactly match the "id"
 *   in games.json. Unregistered IDs show the "Coming Soon" screen in GameFrame.
 *
 *   import YourGame from './your-id/index.jsx'
 *   export const gameRegistry = { ...gameRegistry, 'your-id': YourGame }
 */

import Snake from './snake/index.jsx'
import TicTacToe from './tictactoe/index.jsx'
import Nexus from './nexus/index.jsx'
import FlappyBird from './flappybird/index.jsx'

export const gameRegistry = {
  'snake':       Snake,
  'tictactoe':   TicTacToe,
  'nexus':       Nexus,
  'flappybird':  FlappyBird,
  // Uncomment as games are implemented:
  // 'tetris':       Tetris,
  // 'memory-match': MemoryMatch,
  // 'pong':         Pong,
}
