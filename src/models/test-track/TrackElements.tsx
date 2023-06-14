import { useStore } from '../../store'
import { Goal } from '../Goal'

const DEFAUL_TRACK_ELEMENTS_HEIGHT = 8

type PyhsicalCheckpoint = {
  positionX: number
  positionZ: number
  rotationY: number
  drsZoneStart: boolean
  drsZoneEnd: boolean
  isStart: boolean
  isFinish: boolean
}
const PHYSICAL_CHECKPOINTS: PyhsicalCheckpoint[] = [
  { positionX: 96.48261260986328, positionZ: 51.10379409790039, rotationY: 3.14, drsZoneStart: false, drsZoneEnd: false, isStart: false, isFinish: false },
  {
    positionX: 174,
    positionZ: -71,
    rotationY: -Math.PI / 2,
    drsZoneStart: false,
    drsZoneEnd: false,
    isStart: false,
    isFinish: false,
  },
  {
    positionX: 90,
    positionZ: -238,
    rotationY: 0,
    drsZoneStart: true,
    drsZoneEnd: false,
    isStart: false,
    isFinish: false,
  },
  { positionX: -132.41595458984375, positionZ: -230.32301330566406, rotationY: 0.07, drsZoneStart: false, drsZoneEnd: false, isStart: false, isFinish: false },
  {
    positionX: -286,
    positionZ: -200,
    rotationY: 0,
    drsZoneStart: false,
    drsZoneEnd: true,
    isStart: false,
    isFinish: false,
  },
  {
    positionX: -333,
    positionZ: -137,
    rotationY: Math.PI / 2,
    drsZoneStart: false,
    drsZoneEnd: false,
    isStart: false,
    isFinish: false,
  },
  {
    positionX: -384.32080078125,
    positionZ: -80.98174285888672,
    rotationY: -3.07 + Math.PI,
    drsZoneStart: false,
    drsZoneEnd: false,
    isStart: false,
    isFinish: false,
  },
  {
    positionX: -450,
    positionZ: -80,
    rotationY: 0,
    drsZoneStart: false,
    drsZoneEnd: false,
    isStart: false,
    isFinish: false,
  },
  {
    positionX: -616,
    positionZ: -169,
    rotationY: -Math.PI / 2,
    drsZoneStart: false,
    drsZoneEnd: false,
    isStart: false,
    isFinish: false,
  },
  { positionX: -608.2753295898438, positionZ: -336.1870422363281, rotationY: -2.03, drsZoneStart: false, drsZoneEnd: false, isStart: false, isFinish: false },
  { positionX: -524.955810546875, positionZ: -398.378662109375, rotationY: 3.13, drsZoneStart: false, drsZoneEnd: false, isStart: false, isFinish: false },
  {
    positionX: -471,
    positionZ: -398,
    rotationY: Math.PI,
    drsZoneStart: true,
    drsZoneEnd: false,
    isStart: false,
    isFinish: false,
  },
  {
    positionX: 441,
    positionZ: -386,
    rotationY: Math.PI,
    drsZoneStart: false,
    drsZoneEnd: false,
    isStart: false,
    isFinish: false,
  },
  { positionX: 574.6893920898438, positionZ: -300.30316162109375, rotationY: 2.18, drsZoneStart: false, drsZoneEnd: false, isStart: false, isFinish: false },
  {
    positionX: 615,
    positionZ: 341,
    rotationY: Math.PI / 2,
    drsZoneStart: false,
    drsZoneEnd: true,
    isStart: false,
    isFinish: false,
  },
  { positionX: 517.9679565429688, positionZ: 402.2641906738281, rotationY: 0.01, drsZoneStart: false, drsZoneEnd: false, isStart: false, isFinish: false },
  {
    positionX: 471,
    positionZ: 403,
    rotationY: 0,
    drsZoneStart: false,
    drsZoneEnd: false,
    isStart: false,
    isFinish: false,
  },
  { positionX: 298.54443359375, positionZ: 354.35406494140625, rotationY: -0.72, drsZoneStart: false, drsZoneEnd: false, isStart: false, isFinish: false },
  {
    positionX: 225,
    positionZ: 204,
    rotationY: -Math.PI / 2,
    drsZoneStart: false,
    drsZoneEnd: false,
    isStart: false,
    isFinish: false,
  },
  {
    positionX: 94,
    positionZ: 98,
    rotationY: 0,
    drsZoneStart: true,
    drsZoneEnd: false,
    isStart: false,
    isFinish: false,
  },
  {
    positionX: -432,
    positionZ: 101,
    rotationY: 0,
    drsZoneStart: false,
    drsZoneEnd: true,
    isStart: false,
    isFinish: false,
  },
  {
    positionX: -541,
    positionZ: 45,
    rotationY: -Math.PI / 2,
    drsZoneStart: false,
    drsZoneEnd: false,
    isStart: false,
    isFinish: false,
  },
  {
    positionX: -435,
    positionZ: -14,
    rotationY: Math.PI,
    drsZoneStart: false,
    drsZoneEnd: false,
    isStart: false,
    isFinish: false,
  },
]

const START: PyhsicalCheckpoint = {
  positionX: -29,
  positionZ: 50,
  rotationY: Math.PI,
  drsZoneStart: false,
  drsZoneEnd: false,
  isStart: true,
  isFinish: false,
}

const FINISH: PyhsicalCheckpoint = {
  positionX: -35,
  positionZ: 50,
  rotationY: Math.PI,
  drsZoneStart: false,
  drsZoneEnd: false,
  isStart: false,
  isFinish: true,
}

export const NUMBER_OF_CHECKPOINTS = PHYSICAL_CHECKPOINTS.length

export function TrackElements() {
  const [actions] = useStore((s) => [s.actions])
  const { onFinish, onStart, onCheckpoint, onDRS } = actions

  return (
    <>
      <Goal
        args={[0.0001, 2, 18]}
        onCollideBegin={() => {
          onStart()
          if (START.drsZoneStart) onDRS(true)
          if (START.drsZoneEnd) onDRS(false)
        }}
        rotation={[0, START.rotationY, 0]}
        position={[START.positionX, DEFAUL_TRACK_ELEMENTS_HEIGHT, START.positionZ]}
      />
      {PHYSICAL_CHECKPOINTS.map((checkpoint, index) => (
        <Goal
          key={index + 1}
          args={[0.0001, 2, 21]}
          onCollideBegin={() => {
            onCheckpoint(index + 1)
            if (checkpoint.drsZoneStart) onDRS(true)
            if (checkpoint.drsZoneEnd) onDRS(false)
          }}
          rotation={[0, checkpoint.rotationY, 0]}
          position={[checkpoint.positionX, DEFAUL_TRACK_ELEMENTS_HEIGHT, checkpoint.positionZ]}
        />
      ))}
      <Goal
        args={[0.0001, 2, 18]}
        onCollideBegin={() => {
          onFinish()
          if (FINISH.drsZoneStart) onDRS(true)
          if (FINISH.drsZoneEnd) onDRS(false)
        }}
        rotation={[0, FINISH.rotationY, 0]}
        position={[FINISH.positionX, DEFAUL_TRACK_ELEMENTS_HEIGHT, FINISH.positionZ]}
      />
    </>
  )
}
