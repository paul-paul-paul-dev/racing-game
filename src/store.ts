import { createRef } from 'react'
import create from 'zustand'
import shallow from 'zustand/shallow'
import type { RefObject } from 'react'
import type { PublicApi, WheelInfoOptions } from '@react-three/cannon'
import type { Session } from '@supabase/supabase-js'
import type { Group } from 'three'
import type { GetState, SetState, StateSelector } from 'zustand'

import { keys } from './keys'
import { NUMBER_OF_CHECKPOINTS } from './models/test-track'

export const angularVelocity = [0, 0.5, 0] as const
export const cameras = ['DEFAULT', 'FIRST_PERSON', 'BIRD_EYE'] as const

export const dpr = 1.5 as const
export const levelLayer = 1 as const
export const maxBoost = 100 as const
export const position = [-420, 8.5, -16] as const
export const rotation = [0, Math.PI / 2, 0] as const

export const vehicleConfig = {
  width: 1.7,
  height: -0.3,
  front: 1.4,
  back: -1.3,
  steer: 0.25,
  force: 3200,
  maxBrake: 100,
  maxSpeed: 115, // mph
} as const

type VehicleConfig = typeof vehicleConfig

export type WheelInfo = Required<
  Pick<
    WheelInfoOptions,
    | 'axleLocal'
    | 'customSlidingRotationalSpeed'
    | 'directionLocal'
    | 'frictionSlip'
    | 'radius'
    | 'rollInfluence'
    | 'sideAcceleration'
    | 'suspensionRestLength'
    | 'suspensionStiffness'
    | 'useCustomSlidingRotationalSpeed'
  >
>

export const wheelInfo: WheelInfo = {
  axleLocal: [-1, 0, 0],
  customSlidingRotationalSpeed: -10, // -0.01
  directionLocal: [0, -1, 0],
  frictionSlip: 5.2, // 1.5 // 10000 -> No slipping? // seems like a threshold when to start sliding // maybe for older tires and wet conditions
  radius: 0.38,
  rollInfluence: 0.01, // vehicle leaning in curve
  sideAcceleration: 1.5, // 3
  suspensionRestLength: 0.35,
  suspensionStiffness: 75,
  useCustomSlidingRotationalSpeed: true, // true
}

export const booleans = {
  binding: false,
  debug: false, // HERE
  editor: false,
  help: false,
  leaderboard: false,
  map: true,
  pickcolor: false,
  ready: false,
  shadows: true,
  stats: true,
  sound: true,
}

type Booleans = keyof typeof booleans

const exclusiveBooleans = ['help', 'leaderboard', 'pickcolor'] as const
type ExclusiveBoolean = typeof exclusiveBooleans[number]
const isExclusiveBoolean = (v: unknown): v is ExclusiveBoolean => exclusiveBooleans.includes(v as ExclusiveBoolean)

export type Camera = typeof cameras[number]

const controls = {
  backward: false,
  drsUsed: false,
  brake: false,
  forward: false,
  honk: false,
  left: false,
  right: false,
}
export type Controls = typeof controls
type Control = keyof Controls
export const isControl = (v: PropertyKey): v is Control => Object.hasOwnProperty.call(controls, v)

export type BindableActionName = Control | ExclusiveBoolean | Extract<Booleans, 'editor' | 'map' | 'sound'> | 'camera' | 'reset'

export type ActionInputMap = Record<BindableActionName, string[]>

const actionInputMap: ActionInputMap = {
  backward: ['arrowdown', 's'],
  drsUsed: ['shift'],
  brake: [' '],
  camera: ['c'],
  editor: ['.'],
  forward: ['arrowup', 'w', 'z'],
  help: ['i'],
  honk: ['h'],
  leaderboard: ['l'],
  left: ['arrowleft', 'a', 'q'],
  map: ['m'],
  pickcolor: ['p'],
  reset: ['r'],
  right: ['arrowright', 'd', 'e'],
  sound: ['u'],
}

export type Checkpoint = {
  time: number
  id: number
  bestTime: number
}

type Getter = GetState<IState>
export type Setter = SetState<IState>

type BaseState = Record<Booleans, boolean>

type BooleanActions = Record<Booleans, () => void>
type ControlActions = Record<Control, (v: boolean) => void>
type TimerActions = Record<'onFinish' | 'onStart' | 'reposition', () => void>
type CheckpointActions = Record<'onCheckpoint', (id: number) => void>
type DRSActions = Record<'onDRS', (drs: boolean) => void>

type Actions = BooleanActions &
  ControlActions &
  TimerActions &
  DRSActions &
  CheckpointActions & {
    camera: () => void
    reset: () => void
  }

export interface IState extends BaseState {
  actions: Actions
  api: PublicApi | null
  camera: Camera
  chassisBody: RefObject<Group>
  checkpoints: Map<number, Checkpoint>
  timePenalty: number
  latestCheckpoint: Checkpoint & { timeDifference: number }
  color: string
  controls: Controls
  actionInputMap: ActionInputMap
  keyBindingsWithError: number[]
  dpr: number
  finished: number
  lastFinish: number
  bestFinish: number
  get: Getter
  level: RefObject<Group>
  session: Session | null
  set: Setter
  start: number
  vehicleConfig: VehicleConfig
  wheelInfo: WheelInfo
  wheels: [RefObject<Group>, RefObject<Group>, RefObject<Group>, RefObject<Group>]
  keyInput: string | null
}

const setExclusiveBoolean = (set: Setter, boolean: ExclusiveBoolean) => () =>
  set((state) => ({ ...exclusiveBooleans.reduce((o, key) => ({ ...o, [key]: key === boolean ? !state[boolean] : false }), state) }))

const useStoreImpl = create<IState>((set: SetState<IState>, get: GetState<IState>) => {
  const controlActions = keys(controls).reduce<Record<Control, (value: boolean) => void>>((o, control) => {
    o[control] = (value: boolean) => set((state) => ({ controls: { ...state.controls, [control]: value } }))
    return o
  }, {} as Record<Control, (value: boolean) => void>)

  const booleanActions = keys(booleans).reduce<Record<Booleans, () => void>>((o, boolean) => {
    o[boolean] = isExclusiveBoolean(boolean) ? setExclusiveBoolean(set, boolean) : () => set((state) => ({ ...state, [boolean]: !state[boolean] }))
    return o
  }, {} as Record<Booleans, () => void>)

  const actions: Actions = {
    ...booleanActions,
    ...controlActions,
    camera: () => set((state) => ({ camera: cameras[(cameras.indexOf(state.camera) + 1) % cameras.length] })),
    onDRS: (drs: boolean) => {
      mutation.drsAvailable = drs
      if (drs) {
        beep()
      }
    },
    onCheckpoint: (id: number) => {
      const { start } = get()
      if (start) {
        set((state) => {
          // get the CP from the map
          const checkpoint = state.checkpoints.get(id)
          let timePenalty = state.timePenalty
          let latestCheckpoint = state.latestCheckpoint
          // cCP error
          if (!checkpoint) return { ...state }

          // if you skipped a checkpoint you will get a time penalty
          if (latestCheckpoint.id != 0 && checkpoint.id - latestCheckpoint.id !== 1) {
            const penalty = 3 * Math.pow(checkpoint.id - latestCheckpoint.id - 1, 2)
            timePenalty += penalty
            console.log('Time Penalty + ' + penalty)
          }

          // get the time on the CP
          const checkpointTime = Date.now() - start

          // check if time is better then best time
          const isBetter = !checkpoint.bestTime || checkpointTime < checkpoint.bestTime
          const diff = checkpointTime - checkpoint.bestTime

          // set the CP values
          checkpoint.time = checkpointTime
          checkpoint.bestTime = isBetter ? checkpointTime : checkpoint.bestTime

          // update the store CP Map
          const checkpoints = state.checkpoints
          checkpoints.set(id, checkpoint)

          // update latestCP
          latestCheckpoint = { ...checkpoint, timeDifference: diff }

          // upadte the state
          return { ...state, checkpoints, latestCheckpoint, timePenalty }
        })
      }
    },
    onFinish: () => {
      const { finished, start, timePenalty, bestFinish, latestCheckpoint } = get()
      if (start) {
        let timePenaltyFinish = timePenalty
        if (latestCheckpoint.id !== NUMBER_OF_CHECKPOINTS) {
          // hit the last checkpoint?
          console.log('Penalty' + latestCheckpoint.id + ' ' + NUMBER_OF_CHECKPOINTS)
          timePenaltyFinish += 3
        }
        const lapTime = Math.max(Date.now() - start + timePenaltyFinish * 1000)
        set({ lastFinish: Math.max(lapTime, 0) })
        set({ timePenalty: 0 })
        if (!bestFinish || lapTime < bestFinish) {
          set({ bestFinish: lapTime })
        }
        if (start && !finished) {
          set({ finished: Math.max(lapTime, 0) })
        }
      }
      set((state) => {
        // don't reset after finish, just keep going
        // state.api?.angularVelocity.set(...angularVelocity)
        // state.api?.position.set(...position)
        // state.api?.rotation.set(...rotation)
        // state.api?.velocity.set(0, 0, 0)
        return { ...state, start: 0 }
      })
    },
    onStart: () => {
      set({ latestCheckpoint: { id: 0, time: 0, bestTime: 0, timeDifference: 0 } })

      set((state) => {
        return { ...state, finished: 0, start: Date.now(), timePenalty: 0 }
      })
    },
    reposition: () => {
      mutation.gear = 1
      mutation.force = 0
      mutation.rpmTarget = 1000

      set((state) => {
        state.api?.angularVelocity.set(...angularVelocity)
        state.api?.rotation.set(...rotation)
        state.api?.velocity.set(0, 0, 0)

        return { ...state }
      })
    },
    reset: () => {
      mutation.drsUsed = false
      mutation.drsAvailable = false
      mutation.gear = 0
      mutation.force = 0
      mutation.rpmTarget = 1000

      set((state) => {
        state.api?.angularVelocity.set(...angularVelocity)
        state.api?.position.set(...position)
        state.api?.rotation.set(...rotation)
        state.api?.velocity.set(0, 0, 0)

        return { ...state, start: 0 }
      })
    },
  }

  return {
    ...booleans,
    actionInputMap,
    actions,
    api: null,
    camera: cameras[0],
    chassisBody: createRef<Group>(),
    bestFinish: 0,
    lastFinish: 0,
    timePenalty: 0,
    latestCheckpoint: { id: 0, time: 0, bestTime: 0 },
    checkpoints: new Map<number, Checkpoint>(Array.from({ length: NUMBER_OF_CHECKPOINTS }, (_, id) => [id + 1, { time: 0, id: id + 1, bestTime: 0 }])),
    color: '#FFFF00',
    controls,
    keyBindingsWithError: [],
    dpr,
    finished: 0,
    get,
    keyInput: null,
    level: createRef<Group>(),
    session: null,
    set,
    start: 0,
    vehicleConfig,
    wheelInfo,
    wheels: [createRef<Group>(), createRef<Group>(), createRef<Group>(), createRef<Group>()],
  }
})

interface Mutation {
  drsUsed: boolean
  drsAvailable: boolean
  rpmTarget: number
  sliding: boolean
  speed: number
  velocity: [number, number, number]
  force: number
  breakForce: number
  steer: number
  gear: number
  downForce: number
}

export const mutation: Mutation = {
  // Everything in here is mutated to avoid even slight overhead
  drsUsed: false,
  drsAvailable: false,
  rpmTarget: 1000,
  sliding: false,
  speed: 0,
  velocity: [0, 0, 0],
  force: 0,
  breakForce: 0,
  steer: 0,
  gear: 0,
  downForce: 1,
}

// Make the store shallow compare by default
const useStore = <T>(sel: StateSelector<IState, T>) => useStoreImpl(sel, shallow)
Object.assign(useStore, useStoreImpl)

const { getState, setState } = useStoreImpl

export { getState, setState, useStore }

const myAudioContext = new AudioContext()

function beep(duration = 80, frequency = 1000, volume = 5) {
  return new Promise<void>((resolve, reject) => {
    try {
      const oscillatorNode = myAudioContext.createOscillator()
      const gainNode = myAudioContext.createGain()
      oscillatorNode.connect(gainNode)

      // Set the oscillator frequency in hertz
      oscillatorNode.frequency.value = frequency

      // Set the type of oscillator
      oscillatorNode.type = 'square'
      gainNode.connect(myAudioContext.destination)

      // Set the gain to the volume
      gainNode.gain.value = volume * 0.01

      // Start audio with the desired duration
      oscillatorNode.start(myAudioContext.currentTime)
      oscillatorNode.stop(myAudioContext.currentTime + duration * 0.001)

      // Resolve the promise when the sound is finished
      oscillatorNode.onended = () => {
        resolve()
      }
    } catch (error) {
      reject(error)
    }
  })
}
