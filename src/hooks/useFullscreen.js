import { useState, useCallback, useEffect } from 'react'

export function useFullscreen(targetRef) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const enter = useCallback(async () => {
    const el = targetRef?.current || document.documentElement
    try {
      const fn = el.requestFullscreen || el.webkitRequestFullscreen
      await fn?.call(el)
    } catch (err) {
      console.warn('Fullscreen request failed:', err)
    }
  }, [targetRef])

  const exit = useCallback(async () => {
    try {
      const fn = document.exitFullscreen || document.webkitExitFullscreen
      await fn?.call(document)
    } catch (err) {
      console.warn('Exit fullscreen failed:', err)
    }
  }, [])

  const toggle = useCallback(() => {
    document.fullscreenElement ? exit() : enter()
  }, [enter, exit])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  return { isFullscreen, enter, exit, toggle }
}
