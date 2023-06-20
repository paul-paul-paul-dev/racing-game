import { useState, useEffect } from 'react'
import { Layers } from 'three'
import { Canvas } from '@react-three/fiber'
import { Physics, Debug } from '@react-three/cannon'
import { Sky, Environment, PerspectiveCamera, OrbitControls, Stats } from '@react-three/drei'

import type { DirectionalLight } from 'three'

import { HideMouse, Keyboard } from './controls'
import { Cameras } from './effects'
import { Vehicle } from './models'
import { angularVelocity, levelLayer, position, rotation, useStore } from './store'
import { Clock, Speed, Intro, Editor, Checkpoint } from './ui'
import { useToggle } from './useToggle'
import { GamePad } from './controls/GamePad'
import { TestGround, TestHeightmap, TestTrack, TrackElements } from './models/test-track'

const layers = new Layers()
layers.enable(levelLayer)

export function App(): JSX.Element {
  const [light, setLight] = useState<DirectionalLight | null>(null)
  const [, dpr, editor, shadows] = useStore((s) => [s.actions, s.dpr, s.editor, s.shadows])
  const ToggledCheckpoint = useToggle(Checkpoint, 'latestCheckpoint')
  // const ToggledFinished = useToggle(Finished, 'finished')
  // const ToggledMap = useToggle(Minimap, 'map')
  const ToggledStats = useToggle(Stats, 'stats')
  const ToggledDebug = useToggle(Debug, 'debug')
  const ToggledEditor = useToggle(Editor, 'editor')
  const ToggledOrbitControls = useToggle(OrbitControls, 'editor')

  useEffect(() => {
    // Check if the wake lock API is supported
    if ('wakeLock' in navigator) {
      let wakeLock: WakeLockSentinel | null = null

      // Function to request a wake lock
      const requestWakeLock = async () => {
        try {
          wakeLock = await navigator.wakeLock.request('screen')
          console.log('Screen wake lock is active')
        } catch (error) {
          console.error('Failed to acquire wake lock:', error)
        }
      }

      // Function to release the wake lock
      const releaseWakeLock = () => {
        if (wakeLock !== null) {
          wakeLock.release()
          console.log('Screen wake lock is released')
        }
      }

      // Request wake lock on user interaction
      document.addEventListener('click', requestWakeLock)

      // Release wake lock when the document is unloaded or visibility changes
      document.addEventListener('visibilitychange', releaseWakeLock)
      window.addEventListener('beforeunload', releaseWakeLock)
    } else {
      console.warn('Screen wake lock API is not supported')
    }
  })

  return (
    <Intro>
      <Canvas key={`${dpr}${shadows}`} dpr={[1, dpr]} shadows={shadows} camera={{ position: [0, 5, 15], fov: 50 }}>
        {/* <fog attach="fog" args={['white', 0, 500]} /> */}
        <Sky sunPosition={[1000, 1000, 1000]} distance={5000} />
        <ambientLight layers={layers} intensity={0.1} />
        {/* <Environment background near={1} far={1000} files="images/realistic_blue_skies_on_a_road.hdr"/> */}
        <directionalLight
          ref={setLight}
          layers={layers}
          position={[-1000, 1000, 1500]}
          intensity={1}
          shadow-bias={-0.001}
          shadow-mapSize={[4096, 4096]}
          shadow-camera-left={-1500}
          shadow-camera-right={150}
          shadow-camera-top={1500}
          shadow-camera-bottom={-1500}
          castShadow
        />
        <PerspectiveCamera makeDefault={editor} fov={75} position={[0, 20, 20]} />
        <Physics gravity={[0, -9.81, 0]} allowSleep broadphase="SAP" defaultContactMaterial={{ contactEquationRelaxation: 4, friction: 1.6 }} stepSize={1 / 60}>
          <ToggledDebug scale={1.0001} color="white">
            <Vehicle angularVelocity={[...angularVelocity]} position={[...position]} rotation={[...rotation]}>
              {light && <primitive object={light.target} />}
              <Cameras />
            </Vehicle>
            <TrackElements />
            {/* <Train />
            <Ramp args={[30, 6, 8]} position={[2, -1, 168.55]} rotation={[0, 0.49, Math.PI / 15]} />
            <Heightmap elementSize={0.5085} position={[327 - 66.5, -3.3, -473 + 213]} rotation={[-Math.PI / 2, 0, -Math.PI]} />
            <Goal args={[0.001, 10, 18]} onCollideBegin={onFinish} rotation={[0, -1.2, 0]} position={[-104, 1, -189]} />*/}
            <TestHeightmap elementSize={0.8} position={[(1920 * 0.8) / 2, 0, -(1080 * 0.8) / 2]} rotation={[-Math.PI / 2, 0, -Math.PI]} />
            <TestGround rotation={[Math.PI / 2, 0, Math.PI / 2]} position={[-320, 30, -16]} />
            {/* <BoundingBox {...{ depth: 1920, height: 10, position: [0, 0, -((1024 * 6) / 2)], width: 1080 }} /> */}
          </ToggledDebug>
        </Physics>
        {/* <Track /> */}
        <TestTrack scale={1.6} rotation={[0, -Math.PI / 2, 0]} position={[-100, 5.5, -63.5]} />
        <Environment files="textures/dikhololo_night_1k.hdr" />
        {/* <ToggledMap /> */}
        <ToggledOrbitControls />
      </Canvas>
      <Clock />
      <ToggledEditor />
      {/* <ToggledFinished />
      <Help /> */}
      <Speed />
      <ToggledStats />
      <ToggledCheckpoint />
      {/* <LeaderBoard />
      <PickColor /> */}
      <HideMouse />
      <Keyboard />
      <GamePad />
    </Intro>
  )
}
