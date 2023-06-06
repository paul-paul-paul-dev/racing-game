import { addEffect } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

import { mutation } from '../../store'

const getSpeed = () => `${(mutation.speed * 1.60934).toFixed()} kph / ${mutation.speed.toFixed()} mph` // mph to kph
const getGear = () => `${mutation.gear}`
const getRPM = () => `${mutation.rpmTarget.toFixed(0)} RPM`
const getForce = () => `${mutation.force.toFixed(0)} Nm`

export const Text = (): JSX.Element => {
  const refSpeed = useRef<HTMLSpanElement>(null)
  const refGear = useRef<HTMLSpanElement>(null)
  const refRPM = useRef<HTMLSpanElement>(null)
  const refForce = useRef<HTMLSpanElement>(null)

  let speed = getSpeed()
  let gear = getGear()
  let rpm = getRPM()
  let force = getForce()

  useEffect(() =>
    addEffect(() => {
      if (!refSpeed.current) return
      speed = getSpeed()
      if (refSpeed.current.innerText !== speed) {
        refSpeed.current.innerText = speed
      }
    }),
  )

  useEffect(() =>
    addEffect(() => {
      if (!refRPM.current) return
      rpm = getRPM()
      if (refRPM.current.innerText !== rpm) {
        refRPM.current.innerText = rpm
      }
    }),
  )

  useEffect(() =>
    addEffect(() => {
      if (!refGear.current) return
      gear = getGear()
      if (refGear.current.innerText !== gear) {
        refGear.current.innerText = gear
      }
    }),
  )

  useEffect(() =>
    addEffect(() => {
      if (!refForce.current) return
      force = getForce()
      if (refForce.current.innerText !== force) {
        refForce.current.innerText = force
      }
    }),
  )

  return (
    <div className="speed-text">
      <span ref={refSpeed}>{speed}</span>
      <span ref={refRPM}>{rpm}</span>
      <span ref={refGear}>{gear}</span>
      <span ref={refForce}>{force}</span>
    </div>
  )
}
