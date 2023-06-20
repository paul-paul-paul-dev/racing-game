import { useBox } from '@react-three/cannon'

export function Goal({ args = [1, 1, 1], ...props }) {
  useBox(() => ({ isTrigger: true, args, userData: { trigger: true }, ...props, collisionResponse: false }), undefined, [args, props])

  return (
    <group {...props}>
      <mesh position={[0, 0, -(args[2] / 2) + 2]}>
        <boxBufferGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#e6e" />
      </mesh>
      {/* <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[16, 0.2]} />
        <meshBasicMaterial color="#FF0000" />
      </mesh> */}
      <mesh position={[0, 0, args[2] / 2 - 2]}>
        <boxBufferGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#e6e" />
      </mesh>
    </group>
  )
}
