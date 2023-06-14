import { mutation, useStore } from '../store'
import { useEffect, useState } from 'react'
import { useGamepads } from 'react-gamepads'
import { calculateDrivingForce, getEngineBreakForce, getGearRatio, getRPMBySpeed, getTorqueAtRPM } from '../models'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Euler, Quaternion, Vector3 } from 'three'

interface GamepadRef {
  [key: number]: Gamepad
}

const DIFFERENTIAL = -2
const TRANSMISSION_EFFICIENCY = 1.0
const MAX_RPM = 15000
const MIN_RPM = 1000
const TOP_SPEED_VALUE = 400 //does not correlate to top speed -> examples -> 400 = 158 kph / 250 = 254kph / 300 = 212 kph / 200 = 317 kph
const DRS_VALUE = 7.5
let automatic = true

// for TrackElements position
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function copyToClipboard(text: string): void {
  // Create a temporary input element
  const tempInput = document.createElement('input')

  // Set the value of the input element to the desired text
  tempInput.value = text

  // Append the input element to the document
  document.body.appendChild(tempInput)

  // Select the text in the input element
  tempInput.select()

  // Copy the selected text to the clipboard
  document.execCommand('copy')

  // Remove the temporary input element from the document
  document.body.removeChild(tempInput)
}

// https://asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html
export function GamePad() {
  const [, actions, binding] = useStore(({ actionInputMap, actions, binding }) => [actionInputMap, actions, binding])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [chassisBody, vehicleConfig, wheelInfo, ,] = useStore((s) => [s.chassisBody, s.vehicleConfig, s.wheelInfo, s.wheels, s.api])

  const [shiftedUp, setShiftedUp] = useState(false)
  const [shiftedDown, setShiftedDown] = useState(false)

  const [gamepads, setGamepads] = useState<GamepadRef>({})
  useGamepads((gamepads) => setGamepads(gamepads))

  useEffect(() => {
    if (binding) return
    if (!gamepads[0]) return

    if (gamepads[0].buttons[2].pressed) actions['reset']() // X

    actions['forward'](gamepads[0].buttons[7].value > 0) // RT
    actions['backward'](false) // LT
    actions['brake'](gamepads[0].buttons[1].pressed || gamepads[0].buttons[6].value > 0) // B

    // acceleration and breaking
    let rpmTarget = mutation.rpmTarget
    let force = 0
    let drsUsed = mutation.drsUsed

    const wheelRotationRate = (mutation.speed * 1.60934) / 3600 / wheelInfo.radius

    const speedValue = TOP_SPEED_VALUE - DRS_VALUE * (mutation.drsUsed ? 1 : 0)

    const rpmFromSpeed = Math.max(
      getRPMBySpeed(wheelRotationRate, getGearRatio(mutation.gear), getGearRatio(DIFFERENTIAL)) * speedValue,
      mutation.gear === 1 && gamepads[0].buttons[7].value > 0 ? mutation.rpmTarget : MIN_RPM,
    )

    // DRS
    actions['drsUsed'](gamepads[0].buttons[0].pressed && mutation.drsAvailable) // A
    if (mutation.drsAvailable) {
      drsUsed = gamepads[0].buttons[0].pressed
    }

    // rev the engine in neutral
    if (mutation.gear === 0) {
      if (rpmTarget < MAX_RPM) {
        rpmTarget += gamepads[0].buttons[7].value * 250
      }
    } else {
      rpmTarget = Math.min(rpmFromSpeed, MAX_RPM)
    }

    // driving force
    if (gamepads[0].buttons[7].value > 0.0001 && mutation.gear !== -1) {
      const forceFactor = Math.sqrt(gamepads[0].buttons[7].value)
      force =
        (calculateDrivingForce(
          getTorqueAtRPM(mutation.rpmTarget),
          getGearRatio(mutation.gear),
          getGearRatio(DIFFERENTIAL),
          TRANSMISSION_EFFICIENCY,
          wheelInfo.radius,
        ) /
          2) *
        forceFactor
      // Math.min(mutation.rpmTarget + 50 * gamepads[0].buttons[7].value, MAX_RPM)
    } else {
      // engine brake when not accelerating
      if (rpmTarget > MIN_RPM && mutation.gear !== 0) {
        actions['backward'](true)
        force = getEngineBreakForce(mutation.rpmTarget, mutation.gear, mutation.speed)
      } else if (rpmTarget > MIN_RPM) {
        rpmTarget -= 100
      }
    }

    // breaking
    let breakForce = mutation.breakForce
    if (gamepads[0].buttons[6].value > 0) {
      breakForce = gamepads[0].buttons[6].value * 100
    }

    // steering
    actions['left'](gamepads[0].axes[0] < -0.001) // LStick
    actions['right'](gamepads[0].axes[0] > 0.001) // LStick

    const relativeSpeed = mutation.speed / (vehicleConfig.maxSpeed + 0.15 * vehicleConfig.maxSpeed) // 0 to 1 - (factor * maxSpeed)
    const relativeSpeedFactor = (-1 / 4) * Math.log(relativeSpeed < 0.2 ? 0 : relativeSpeed) - 0.02 // More sensitive steering at low speeds, less sensitive at high speeds
    const speedFactor = Math.min(1, relativeSpeedFactor)
    // trying different speed factors
    // 1 - Math.pow(Math.sqrt(relativeSpeed), 3) + 2.1 * (relativeSpeed - Math.sqrt(relativeSpeed))
    // Math.min(1, ((-1/4) * Math.log(relativeSpeed))+ 0.02)
    // Math.max(0, 1 - Math.sqrt(relativeSpeed))
    const steer = Math.abs(Math.pow(gamepads[0].axes[0], 3) * vehicleConfig.steer * speedFactor) // LStick again more sensitive at low angle, less sensitiv at high angle

    // console.log(
    //   mutation.speed.toFixed(0) +
    //     `(${relativeSpeed.toFixed(2)}) / ` +
    //     Math.abs(1 * vehicleConfig.steer * speedFactor).toFixed(3) +
    //     `(${speedFactor.toFixed(3)})`,
    // )

    // gear shifting
    let gear = mutation.gear

    if (gamepads[0].buttons[12].pressed) {
      // Up
      automatic = true
      //   const euler = new Euler().setFromQuaternion(chassisBody.current!.getWorldQuaternion(new Quaternion()))

      //   const text = `{
      //         positionX: ${chassisBody.current?.getWorldPosition(new Vector3()).x},
      //         positionZ: ${chassisBody.current?.getWorldPosition(new Vector3()).z},
      //         rotationY: ${(euler.y + Math.PI / 2).toFixed(2)},
      //         drsZoneStart: false,
      //         drsZoneEnd: false,
      //         isStart: false,
      //         isFinish: false
      //       },`
      //   console.log(text)
      //   copyToClipboard(text)
    }

    if (gamepads[0].buttons[13].pressed) {
      // Down
      automatic = false
      if (gear === 1 && mutation.speed < 1) {
        gear = 0
      }
    }

    if (automatic) {
      // automatic shifting
      if (gear === 0) {
        gear += 1
      }

      if (rpmTarget > 13500 && mutation.gear !== 8) {
        gear += 1
      } else if (rpmTarget < 9900 && gear !== 1) {
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

    actions['honk'](gamepads[0].buttons[10].pressed) // LEFT STICK

    // ALSO DRS
    if (gamepads[0].buttons[0].pressed && mutation.drsAvailable) {
      const min = DRS_VALUE * 1 * 100
      const max = DRS_VALUE * 2.2 * 100
      force += force * 0.1 + (Math.floor(Math.random() * (max - min + 1)) + min)
    }

    if (rpmTarget <= MIN_RPM) rpmTarget += Math.floor(Math.random() * (500 - 300 + 1)) + 300

    Object.assign(mutation, { rpmTarget, steer, force, gear, drsUsed, breakForce })
  }, [gamepads])

  return null
}
