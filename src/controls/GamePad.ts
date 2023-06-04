import { mutation, useStore } from '../store'
import { useEffect, useState } from 'react'
import { useGamepads } from 'react-gamepads'
import { calculateDrivingForce, getEngineBreakForce, getGearRatio, getRPMBySpeed, getTorqueAtRPM } from '../models'

interface GamepadRef {
  [key: number]: Gamepad
}

const DIFFERENTIAL = -2
const TRANSMISSION_EFFICIENCY = 1.0
const MAX_RPM = 15000
const MIN_RPM = 1000
const TOP_SPEED_VALUE = 400 //does not correlate to top speed -> examples -> 400 = 158 kph / 250 = 254kph / 300 = 212 kph / 200 = 317 kph
const automatic = true

export function GamePad() {
  const [, actions, binding] = useStore(({ actionInputMap, actions, binding }) => [actionInputMap, actions, binding])
  const [, vehicleConfig, wheelInfo] = useStore((s) => [s.chassisBody, s.vehicleConfig, s.wheelInfo, s.wheels])

  const [shiftedUp, setShiftedUp] = useState(false)
  const [shiftedDown, setShiftedDown] = useState(false)

  const [gamepads, setGamepads] = useState<GamepadRef>({})
  useGamepads((gamepads) => setGamepads(gamepads))

  useEffect(() => {
    if (binding) return
    if (!gamepads[0]) return

    if (gamepads[0].buttons[2].pressed) actions['reset']() // X

    actions['forward'](gamepads[0].buttons[7].value > 0) // RT
    actions['backward'](gamepads[0].buttons[6].value > 0) // LT
    actions['brake'](gamepads[0].buttons[1].pressed) // B

    // acceleration and breaking
    let rpmTarget = mutation.rpmTarget

    let force = 0
    const wheelRotationRate = (mutation.speed * 1.60934) / 3600 / wheelInfo.radius

    const rpmFromSpeed = Math.max(
      getRPMBySpeed(wheelRotationRate, getGearRatio(mutation.gear), getGearRatio(DIFFERENTIAL)) * TOP_SPEED_VALUE,
      mutation.gear === 1 && gamepads[0].buttons[7].value > 0 ? mutation.rpmTarget : MIN_RPM,
    )

    // rev the engine in neutral
    if (mutation.gear === 0) {
      if (rpmTarget < MAX_RPM) {
        rpmTarget += gamepads[0].buttons[7].value * 250
      }
    } else {
      rpmTarget = Math.min(rpmFromSpeed, MAX_RPM)
    }

    if (gamepads[0].buttons[7].value > 0 && mutation.gear !== -1) {
      force =
        (calculateDrivingForce(
          getTorqueAtRPM(mutation.rpmTarget),
          getGearRatio(mutation.gear),
          getGearRatio(DIFFERENTIAL),
          TRANSMISSION_EFFICIENCY,
          wheelInfo.radius,
        ) /
          2) *
        gamepads[0].buttons[7].value

      // Math.min(mutation.rpmTarget + 50 * gamepads[0].buttons[7].value, MAX_RPM)
    } else {
      // engine brake
      if (rpmTarget > MIN_RPM && mutation.gear !== 0) {
        force = getEngineBreakForce(mutation.rpmTarget, mutation.gear, mutation.speed)
        actions['backward'](true)
      } else if (rpmTarget > MIN_RPM) {
        rpmTarget -= 100
      }
    }

    if (gamepads[0].buttons[6].value > 0) {
      force += gamepads[0].buttons[6].value * 4000
    }

    // steering
    actions['left'](gamepads[0].axes[0] < -0.01) // LStick
    actions['right'](gamepads[0].axes[0] > 0.01) // LStick

    const speedFactor = Math.max(0, 1 - Math.sqrt(mutation.speed / (vehicleConfig.maxSpeed + 0.15 * vehicleConfig.maxSpeed)))
    const steer = Math.abs(Math.pow(gamepads[0].axes[0], 3) * vehicleConfig.steer * speedFactor) // LStick

    // gear shifting
    let gear = mutation.gear

    if (automatic) {
      // automatic shifting
      if (gear === 0) {
        gear += 1
      }

      if (rpmTarget > 14200 && mutation.gear !== 8) {
        gear += 1
      } else if (rpmTarget < 9400 && gear !== 1) {
        gear -= 1
      }
    } else {
      if (gamepads[0].buttons[5].pressed && mutation.gear !== 8 && !shiftedUp) {
        // RB
        setShiftedUp(true)
        gear += 1
      }
      if (!gamepads[0].buttons[5].pressed && shiftedUp) {
        setShiftedUp(false)
      }

      if (gamepads[0].buttons[4].pressed && mutation.gear !== -1 && !shiftedDown) {
        // LB
        setShiftedDown(true)
        gear -= 1
      }
      if (!gamepads[0].buttons[4].pressed && shiftedDown) {
        setShiftedDown(false)
      }
    }

    actions['honk'](gamepads[0].buttons[3].pressed) // Y

    // DRS
    actions['boost'](gamepads[0].buttons[0].pressed) // A
    if (gamepads[0].buttons[0].pressed) {
      force += force * 0.1 + (Math.floor(Math.random() * (500 - 300 + 1)) + 300)
    }

    if (rpmTarget <= MIN_RPM) rpmTarget += Math.floor(Math.random() * (500 - 300 + 1)) + 300

    Object.assign(mutation, { rpmTarget, steer, force, gear })
  }, [gamepads])

  return null
}
