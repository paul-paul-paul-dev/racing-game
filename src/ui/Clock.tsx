import { useEffect, useRef, useState } from 'react'
import { addEffect } from '@react-three/fiber'
import { useStore } from '../store'
import { readableTime } from './LeaderBoard'

const getTime = (finished: number, start: number) => {
  const time = start && !finished ? Date.now() - start : 0
  return `${readableTime(time)}`
}

export function Clock() {
  const ref = useRef<HTMLSpanElement>(null)
  const { finished, start } = useStore(({ finished, start }) => ({ finished, start }))

  const [bestTime, setBestTime] = useState(0.0)
  const [lastLapTime, setLastLapTime] = useState(0.0)

  let text = getTime(finished, start)

  useEffect(() => {
    let lastTime = 0
    setBestTime(bestTime === 0 ? finished : bestTime > finished ? finished : bestTime)
    setLastLapTime(finished !== 0 ? finished : lastTime)
    return addEffect((time) => {
      if (!ref.current || time - lastTime < 100) return
      lastTime = time
      text = getTime(finished, start) + '\n' + readableTime(bestTime) + '\n' + readableTime(lastLapTime)
      if (ref.current.innerText !== text) {
        ref.current.innerText = text
      }
    })
  }, [finished, start])
  return (
    <div className="clock">
      <span ref={ref}>{text}</span>
    </div>
  )
}
