import { useEffect, useRef } from 'react'
import { PositionalAudio } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'

import type { PositionalAudio as PositionalAudioImpl } from 'three'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { mutation, useStore } from '../../store'

const { lerp } = MathUtils

export const AccelerateAudio = () => {
  const ref = useRef<PositionalAudioImpl>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const maxSpeed = useStore(({ vehicleConfig: { maxSpeed } }) => maxSpeed)

  // porsche
  // const getVolume = () => ((1.2 * mutation.rpmTarget) / 15000) * 0.5
  // f1
  const getVolume = () => ((1.5 * mutation.rpmTarget) / 15000) * 0.2

  useFrame((_, delta) => {
    ref.current?.setVolume(getVolume())
    // porsche
    // ref.current?.setPlaybackRate(lerp(ref.current.playbackRate, mutation.rpmTarget / 18000 + (mutation.speed / maxSpeed) * 0.5, delta * 10))
    // f1
    ref.current?.setPlaybackRate(lerp(ref.current.playbackRate, mutation.rpmTarget / 10000 + 0.5, delta * 10))
  })

  useEffect(() => {
    if (ref.current && !ref.current.isPlaying) {
      ref.current.setVolume(getVolume())
      ref.current.play()
    }
    return () => {
      if (ref.current && ref.current.isPlaying) ref.current.stop()
    }
  }, [])

  return <PositionalAudio ref={ref} url="/sounds/accelerate.mp3" loop distance={5} />
}
