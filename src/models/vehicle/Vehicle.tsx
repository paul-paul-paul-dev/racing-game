import { MathUtils, Vector3 } from 'three'
import { useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useRaycastVehicle } from '@react-three/cannon'

import type { PropsWithChildren } from 'react'
import type { BoxProps, RaycastVehicleProps, WheelInfoOptions } from '@react-three/cannon'

import { AccelerateAudio, BoostAudio, BrakeAudio, Dust, EngineAudio, HonkAudio, Skid } from '../../effects'
import { getState, mutation, useStore } from '../../store'
import { useToggle } from '../../useToggle'
import { Wheel } from './Wheel'

import type { Camera, Controls, WheelInfo } from '../../store'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { F1Chassis } from './F1Chassis'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PorscheChassis } from './PorscheChassis'

const { lerp } = MathUtils
const v = new Vector3()

type VehicleProps = PropsWithChildren<Pick<BoxProps, 'angularVelocity' | 'position' | 'rotation'>>
type DerivedWheelInfo = WheelInfo & Required<Pick<WheelInfoOptions, 'chassisConnectionPointLocal' | 'isFrontWheel'>>

export function Vehicle({ angularVelocity, children, position, rotation }: VehicleProps) {
  const defaultCamera = useThree((state) => state.camera)
  const [chassisBody, vehicleConfig, wheelInfo, wheels] = useStore((s) => [s.chassisBody, s.vehicleConfig, s.wheelInfo, s.wheels])
  const { back, front, height, maxSpeed, width } = vehicleConfig

  const wheelInfos = wheels.map((_, index): DerivedWheelInfo => {
    const length = index < 2 ? front : back
    const sideMulti = index % 2 ? 0.5 : -0.5
    return {
      ...wheelInfo,
      chassisConnectionPointLocal: [width * sideMulti, height, length],
      isFrontWheel: Boolean(index % 2),
    }
  })

  const raycast: RaycastVehicleProps = {
    chassisBody,
    wheels,
    wheelInfos,
  }

  const [, api] = useRaycastVehicle(() => raycast, null, [wheelInfo])

  useLayoutEffect(() => api.sliding.subscribe((sliding) => (mutation.sliding = sliding)), [api])

  let camera: Camera
  let editor: boolean
  let controls: Controls
  let engineValue = 0
  let i = 0
  let speed = 0
  let steeringValue = 0
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const swaySpeed = 0
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const swayTarget = 0
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const swayValue = 0
  let myForce = 0
  let mySteer = 0
  let myBreakForce = 0

  useFrame((state, delta) => {
    camera = getState().camera
    editor = getState().editor
    controls = getState().controls
    speed = mutation.speed
    myForce = mutation.force
    mySteer = mutation.steer
    myBreakForce = Math.max(mutation.breakForce, 10)

    engineValue = lerp(engineValue, controls.forward || controls.backward ? myForce * (controls.forward && !controls.backward ? -1 : 1) : 0, delta * 40)
    steeringValue = lerp(steeringValue, controls.left || controls.right ? mySteer * (controls.left && !controls.right ? 1 : -1) : 0, delta * 20)
    for (i = 2; i < 4; i++) api.applyEngineForce(speed < maxSpeed ? engineValue : 0, i)
    for (i = 0; i < 2; i++) api.setSteeringValue(steeringValue, i)
    for (i = 0; i < 4; i++) api.setBrake(controls.brake ? myBreakForce : 0, i)
    // for (i = 2; i < 4; i++) api.setSteeringValue(-steeringValue * 0.1, i) // rear wheel steering

    if (!editor) {
      if (camera === 'FIRST_PERSON') {
        v.set(0.3 + (Math.sin(-steeringValue) * speed) / 30, 0.4, -0.1)
      } else if (camera === 'DEFAULT') {
        v.set((Math.sin(steeringValue) * speed) / 50, 1.25 + (engineValue / 1000) * -0.1, -5 - speed / 50 + (controls.brake ? 1 : 0))
        //   (LEFT-RIGHT Swing,           3 / 50  ^ , UP-DOWN Swing                   ^ ,              ^ 30 / 50          NEAR-FAR Swing)
      }

      // ctrl.left-ctrl.right, up-down, near-far
      defaultCamera.position.lerp(v, delta)
      return
      // // ctrl.left-ctrl.right swivel
      // defaultCamera.rotation.z = lerp(
      //   defaultCamera.rotation.z,
      //   (camera !== 'BIRD_EYE' ? 0 : Math.PI) + (-steeringValue * speed) / (camera === 'DEFAULT' ? 40 : 60),
      //   delta,
      // )
    }

    // // lean chassis
    // chassisBody.current!.children[0].rotation.z = MathUtils.lerp(chassisBody.current!.children[0].rotation.z, (-steeringValue * speed) /  1, delta * 10)

    // Camera sway
    // swaySpeed = 20
    // swayTarget =(speed / maxSpeed) * 2
    // swayValue = MathUtils.lerp(swayValue, swayTarget, delta * 10)
    // defaultCamera.rotation.z += (Math.sin(state.clock.elapsedTime * swaySpeed * 0.9) / 1000) * swayValue
    // defaultCamera.rotation.x += (Math.sin(state.clock.elapsedTime * swaySpeed) / 1000) * swayValue

    // Vibrations
    // chassisBody.current!.children[0].rotation.x = (Math.sin(state.clock.getElapsedTime() * 20) * (speed / maxSpeed)) / 100
    // chassisBody.current!.children[0].rotation.z = (Math.cos(state.clock.getElapsedTime() * 20) * (speed / maxSpeed)) / 100
  })

  const ToggledAccelerateAudio = useToggle(AccelerateAudio, ['ready', 'sound'])
  const ToggledEngineAudio = useToggle(EngineAudio, ['ready', 'sound'])

  return (
    <group>
      <F1Chassis ref={chassisBody} {...{ angularVelocity, position, rotation }}>
        <ToggledAccelerateAudio />
        <BoostAudio />
        <BrakeAudio />2
        <ToggledEngineAudio />
        <HonkAudio />
        {/* <Boost /> */}
        {children}
      </F1Chassis>
      <>
        {wheels.map((wheel, index) => (
          <Wheel ref={wheel} leftSide={!(index % 2)} key={index} />
        ))}
      </>
      <Dust />
      <Skid />
    </group>
  )
}
