import { useStore } from '../../store'
import { Goal } from '../Goal'

const DEFAUL_TRACK_ELEMENTS_HEIGHT = 10

export function TrackElements() {
  const [actions] = useStore((s) => [s.actions])
  const { onFinish, onStart, onCheckpoint } = actions

  return (
    <>
      <Goal args={[0.001, 10, 18]} onCollideBegin={onStart} rotation={[0, Math.PI, 0]} position={[10, DEFAUL_TRACK_ELEMENTS_HEIGHT, 50]} />
      <Goal args={[0.001, 10, 18]} onCollideBegin={() => onCheckpoint(1)} rotation={[0, Math.PI, 0]} position={[94, DEFAUL_TRACK_ELEMENTS_HEIGHT, 48]} />
      <Goal args={[0.001, 10, 18]} onCollideBegin={() => onCheckpoint(2)} rotation={[0, Math.PI / 2, 0]} position={[174, DEFAUL_TRACK_ELEMENTS_HEIGHT, -71]} />
      <Goal args={[0.001, 10, 18]} onCollideBegin={() => onCheckpoint(3)} rotation={[0, Math.PI, 0]} position={[90, DEFAUL_TRACK_ELEMENTS_HEIGHT, -238]} />
      <Goal args={[0.001, 10, 18]} onCollideBegin={() => onCheckpoint(4)} rotation={[0, Math.PI, 0]} position={[-286, DEFAUL_TRACK_ELEMENTS_HEIGHT, -200]} />
      <Goal
        args={[0.001, 10, 18]}
        onCollideBegin={() => onCheckpoint(5)}
        rotation={[0, Math.PI / 2, 0]}
        position={[-333, DEFAUL_TRACK_ELEMENTS_HEIGHT, -137]}
      />
      <Goal args={[0.001, 10, 18]} onCollideBegin={() => onCheckpoint(6)} rotation={[0, Math.PI, 0]} position={[-450, DEFAUL_TRACK_ELEMENTS_HEIGHT, -80]} />
      <Goal
        args={[0.001, 10, 18]}
        onCollideBegin={() => onCheckpoint(7)}
        rotation={[0, Math.PI / 2, 0]}
        position={[-616, DEFAUL_TRACK_ELEMENTS_HEIGHT, -169]}
      />
      <Goal args={[0.001, 10, 18]} onCollideBegin={() => onCheckpoint(8)} rotation={[0, Math.PI, 0]} position={[-471, DEFAUL_TRACK_ELEMENTS_HEIGHT, -398]} />
      <Goal args={[0.001, 10, 18]} onCollideBegin={() => onCheckpoint(9)} rotation={[0, Math.PI, 0]} position={[441, DEFAUL_TRACK_ELEMENTS_HEIGHT, -386]} />
      <Goal args={[0.001, 10, 18]} onCollideBegin={() => onCheckpoint(10)} rotation={[0, Math.PI / 2, 0]} position={[619, DEFAUL_TRACK_ELEMENTS_HEIGHT, 341]} />
      <Goal args={[0.001, 10, 18]} onCollideBegin={() => onCheckpoint(11)} rotation={[0, Math.PI, 0]} position={[471, DEFAUL_TRACK_ELEMENTS_HEIGHT, 403]} />
      <Goal args={[0.001, 10, 18]} onCollideBegin={() => onCheckpoint(12)} rotation={[0, Math.PI / 2, 0]} position={[225, DEFAUL_TRACK_ELEMENTS_HEIGHT, 204]} />
      <Goal args={[0.001, 10, 18]} onCollideBegin={() => onCheckpoint(13)} rotation={[0, Math.PI, 0]} position={[94, DEFAUL_TRACK_ELEMENTS_HEIGHT, 98]} />
      <Goal args={[0.001, 10, 18]} onCollideBegin={() => onCheckpoint(14)} rotation={[0, Math.PI, 0]} position={[-432, DEFAUL_TRACK_ELEMENTS_HEIGHT, 101]} />
      <Goal args={[0.001, 10, 18]} onCollideBegin={() => onCheckpoint(15)} rotation={[0, Math.PI / 2, 0]} position={[-541, DEFAUL_TRACK_ELEMENTS_HEIGHT, 45]} />
      <Goal args={[0.001, 10, 18]} onCollideBegin={() => onCheckpoint(16)} rotation={[0, Math.PI, 0]} position={[-435, DEFAUL_TRACK_ELEMENTS_HEIGHT, -14]} />
      <Goal args={[0.001, 10, 18]} onCollideBegin={onFinish} rotation={[0, Math.PI, 0]} position={[-10, 8, 50]} />
    </>
  )
}
