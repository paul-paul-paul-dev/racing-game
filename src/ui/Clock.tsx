import { useEffect, useRef } from 'react'
import { addEffect } from '@react-three/fiber'
import { useStore } from '../store'
import { readableTime } from './LeaderBoard'

const getTime = (finished: number, start: number) => {
  const time = start && !finished ? Date.now() - start : 0
  return `${readableTime(time)}`
}

export function Clock() {
  const ref = useRef<HTMLSpanElement>(null)
  const { finished, start, bestFinish, lastFinish, timePenalty } = useStore(({ finished, start, bestFinish, lastFinish, timePenalty }) => ({
    finished,
    start,
    bestFinish,
    lastFinish,
    timePenalty,
  }))

  let text = getTime(finished, start)

  useEffect(() => {
    let lastTime = 0
    return addEffect((time) => {
      if (!ref.current || time - lastTime < 100) return
      lastTime = time
      text = getTime(finished, start) + '\nB: ' + readableTime(bestFinish) + '\nL: ' + readableTime(lastFinish) + '\n+ ' + timePenalty
      if (ref.current.innerText !== text) {
        ref.current.innerText = text
      }
    })
  }, [finished, start, timePenalty, bestFinish, lastFinish])
  return (
    <div className="clock">
      <span ref={ref}>{text}</span>
    </div>
  )
}
