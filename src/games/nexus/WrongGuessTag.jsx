export default function WrongGuessTag({ text }) {
  return (
    <span className="nexus-bounce-in inline-flex items-center gap-1 px-2.5 py-1 rounded-full
      bg-red-900/30 border border-red-500/30 text-red-300 text-xs font-medium">
      {text}
      <span className="text-red-400 text-xs">✗</span>
    </span>
  )
}
