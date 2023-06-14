import type { BoxProps } from '@react-three/cannon'
import { useBox } from '@react-three/cannon'
import { Line, useGLTF } from '@react-three/drei'
import type { PropsWithChildren } from 'react'
import { useRef } from 'react'
import { forwardRef } from 'react'
import type { Group } from 'three'
import type { GLTF, Line2 } from 'three-stdlib'
import * as THREE from 'three'
import { useStore } from '../../store'

type GLTFResult = GLTF & {
  nodes: {
    Track_obj: THREE.Mesh
    Track_obj_1: THREE.Mesh
    Track_obj_2: THREE.Mesh
    Line_1: THREE.Line
    Line_2: THREE.Line
  }
  materials: {
    Red: THREE.MeshStandardMaterial
    Street: THREE.MeshStandardMaterial
    White: THREE.MeshStandardMaterial
    Line1: THREE.LineBasicMaterial
    Line2: THREE.LineBasicMaterial
  }
}

export const TestGround = forwardRef<Group, PropsWithChildren<BoxProps>>(({ args = [0.5, 0.5, 0.5], children, ...props }, ref) => {
  const { nodes } = useGLTF('/models/track.glb') as GLTFResult
  const [,] = useStore((s) => [s.vehicleConfig.maxSpeed, s.chassisBody])
  const line1Ref = useRef<Line2>(null)
  const line2Ref = useRef<Line2>(null)

  useBox(() => ({ args, allowSleep: false, ...props }), ref)

  const positionsLine1 = []
  const positionsLine2 = []

  const geometryPositionsLine1 = nodes.Line_1.geometry.attributes.position.array
  const geometryPositionsLine2 = nodes.Line_2.geometry.attributes.position.array
  for (let index = 0; index < geometryPositionsLine1.length; index = index + 3) {
    positionsLine1.push({
      x: Math.floor(geometryPositionsLine1[index]),
      y: Math.floor(geometryPositionsLine1[index + 1]),
      z: Math.floor(geometryPositionsLine1[index + 2]),
    })
  }
  for (let index = 0; index < geometryPositionsLine2.length; index = index + 3) {
    positionsLine2.push({
      x: Math.floor(geometryPositionsLine2[index]),
      y: Math.floor(geometryPositionsLine2[index + 1]),
      z: Math.floor(geometryPositionsLine2[index + 2]),
    })
  }
  const curvepointsLine1 = positionsLine1.map((position) => new THREE.Vector3(position.x, position.y, position.z))
  const curvepointsLine2 = positionsLine2.map((position) => new THREE.Vector3(position.x, position.y, position.z))

  return (
    <group position={props.position} rotation={props.rotation} ref={ref} dispose={null} scale={0.05}>
      {/* {meshes.map((mesh, index) => {
            return (<mesh key={index} scale={args} position={mesh.position}>
                <boxGeometry />
                <meshBasicMaterial color="#0000FF" />
              </mesh>)
        })} */}
      <Line ref={line1Ref} points={curvepointsLine1} alphaWrite={true} lineWidth={1} color={'blue'}></Line>
      <Line ref={line2Ref} points={curvepointsLine2} alphaWrite={true} lineWidth={1} color={'red'}></Line>
    </group>
  )
})

useGLTF.preload('/models/track.glb')
