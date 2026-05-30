/**
 * 2048 — Entry point. Receives { onClose } from GameFrame.
 */

import Game2048 from './Game2048.jsx'

export default function Game2048Entry({ onClose }) {
  return <Game2048 onClose={onClose} />
}
