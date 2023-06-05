import { useBox } from '@react-three/cannon'

export function Goal({ args = [1, 1, 1], ...props }) {
  useBox(() => ({ isTrigger: true, args, userData: { trigger: true }, ...props }), undefined, [args, props])

  return (
    <group {...props}>
      <mesh position={[0, -2, -8]}>
        <boxBufferGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#BDFF9E" />
      </mesh>
      <mesh position={[0, -2, 8]}>
        <boxBufferGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#BDFF9E" />
      </mesh>
    </group>
  )
}
