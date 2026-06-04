/**
 * Grimhold — level complete stats screen.
 */
import { formatTime } from './utils.js'

export default function LevelCompleteScreen({ result, onContinue }) {
  const underPar = result.time <= result.parTime
  const killPct = result.totalEnemies ? Math.round(result.kills / result.totalEnemies * 100) : 100
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at 50% 40%, #140a05, #06040a 70%)' }}>
      <div className="w-full max-w-sm bg-black/50 border border-amber-700/40 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-2">{result.isBoss ? '☠' : '🏰'}</div>
        <h2 className="font-heading text-2xl font-black text-amber-300 mb-1">{result.isBoss ? 'Boss Vanquished' : 'Floor Cleared'}</h2>
        <p className="text-white/60 text-sm mb-4">{result.name}</p>

        <div className="space-y-2 text-left text-sm mb-5">
          <Row label="Time" value={<span className={underPar ? 'text-amber-300 font-bold' : 'text-white'}>{formatTime(result.time)} {underPar && '🏆'}</span>} sub={`par ${formatTime(result.parTime)}`} />
          <Row label="Kills" value={`${result.kills}/${result.totalEnemies}`} sub={`${killPct}%`} />
          <Row label="Secrets" value={`${result.secretsFound}/${result.totalSecrets}`} />
          <Row label="Gold earned" value={`● ${result.levelGold + result.bonus}`} sub={`+${result.bonus} bonus`} />
          <Row label="Total gold" value={<span className="text-yellow-400 font-bold">● {result.totalGold}</span>} />
        </div>

        <button onClick={onContinue} className="w-full py-3 rounded-lg bg-red-700 hover:bg-red-600 text-white font-black">
          {result.isBoss ? 'Onward →' : 'To the Armory →'}
        </button>
      </div>
    </div>
  )
}

function Row({ label, value, sub }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
      <span className="text-white/50">{label}</span>
      <span className="text-white text-right">{value}{sub && <span className="text-white/30 text-xs ml-2">{sub}</span>}</span>
    </div>
  )
}
