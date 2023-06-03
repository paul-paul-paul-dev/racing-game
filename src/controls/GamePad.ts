import { mutation, useStore } from '../store'
import { useEffect, useState } from 'react'
import { useGamepads } from 'react-gamepads'

interface GamepadRef {
  [key: number]: Gamepad
}

export function GamePad() {
  const [, actions, binding] = useStore(({ actionInputMap, actions, binding }) => [actionInputMap, actions, binding])
  const [, vehicleConfig, ,] = useStore((s) => [s.chassisBody, s.vehicleConfig, s.wheelInfo, s.wheels])

  const [gamepads, setGamepads] = useState<GamepadRef>({})
  useGamepads((gamepads) => setGamepads(gamepads))

  useEffect(() => {
    if (binding) return
    if (!gamepads[0]) return

    actions['forward'](gamepads[0].buttons[7].value > 0)
    const force = gamepads[0].buttons[7].value * vehicleConfig.force

    actions['left'](gamepads[0].axes[0] < -0.01)
    actions['right'](gamepads[0].axes[0] > 0.01)

    const steer = Math.abs(Math.pow(gamepads[0].axes[0], 4) * vehicleConfig.steer)

    Object.assign(mutation, { steer, force })

    // actions['boost'](gamepads[0].buttons[0].pressed) // A
    actions['backward'](gamepads[0].buttons[1].pressed) // B
    // actions['honk'](gamepads[0].buttons[2].pressed) // X
    actions['honk'](gamepads[0].buttons[3].pressed) // Y

    actions['brake'](gamepads[0].buttons[6].value > 0)
  }, [gamepads])

  return null
}
