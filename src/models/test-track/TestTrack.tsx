export function TestTrack(): JSX.Element {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeBufferGeometry args={[1000, 1000]} />
      <meshStandardMaterial color={'gray'} />
    </mesh>
  )
}
