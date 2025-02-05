/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    Track_obj: THREE.Mesh
    Track_obj_1: THREE.Mesh
    Track_obj_2: THREE.Mesh
    Ground: THREE.Mesh
    Line_1: THREE.Line
    Line_2: THREE.Line
  }
  materials: {
    Red: THREE.MeshStandardMaterial
    Street: THREE.MeshStandardMaterial
    White: THREE.MeshStandardMaterial
    Line1: THREE.LineBasicMaterial
    Line2: THREE.LineBasicMaterial
    Green: THREE.MeshStandardMaterial
  }
}

export function TestTrack(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('models/track.glb') as GLTFResult

  const materialBlack = new THREE.LineBasicMaterial({ color: 'pink' })
  return (
    <group {...props} dispose={null}>
      <mesh receiveShadow geometry={nodes.Track_obj.geometry} material={materials.Red} />
      <mesh receiveShadow geometry={nodes.Track_obj_1.geometry} material={materials.Street} />
      <mesh receiveShadow geometry={nodes.Track_obj_2.geometry} material={materials.White} />
      <lineSegments geometry={nodes.Line_1.geometry} material={materialBlack} />
      <lineSegments geometry={nodes.Line_2.geometry} material={materialBlack} />
      {/* <mesh receiveShadow geometry={nodes.Ground.geometry} material={materials.Green} /> */}
    </group>
  )
}

useGLTF.preload('models/track.glb')
