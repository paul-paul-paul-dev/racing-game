/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import type * as THREE from 'three'
import debounce from 'lodash-es/debounce'
import clamp from 'lodash-es/clamp'
import { forwardRef, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import { useBox } from '@react-three/cannon'
import { useGLTF, PositionalAudio } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'

import type { PropsWithChildren } from 'react'
import type { BoxProps } from '@react-three/cannon'
import type { GLTF } from 'three-stdlib'
import type { Group, PositionalAudio as PositionalAudioImpl } from 'three'
import type { CollideEvent } from '@react-three/cannon'

import { getState, setState, mutation, useStore } from '../../store'

type GLTFResult = GLTF & {
  nodes: {
    Object_15: THREE.Mesh
    Object_15_1: THREE.Mesh
    Object_15_2: THREE.Mesh
    Object_15_3: THREE.Mesh
    Object_15_4: THREE.Mesh
    Object_15_5: THREE.Mesh
  }
  materials: {
    racecar_1_TGA: THREE.MeshStandardMaterial
    ['Default_Material.008']: THREE.MeshStandardMaterial
    ['COCKPIT_DAMAGE_TGA.001']: THREE.MeshStandardMaterial
    racecar_2_TGA: THREE.MeshStandardMaterial
    racecar_3_TGA: THREE.MeshStandardMaterial
    racecar_carb_tga: THREE.MeshStandardMaterial
  }
}

const v = new Vector3()
const maxDownForce = 3

export const F1Chassis = forwardRef<Group, PropsWithChildren<BoxProps>>(({ args = [2, 1.1, 4.7], mass = 798, children, ...props }, ref) => {
  const { nodes, materials } = useGLTF('/models/chassi_f1.glb') as GLTFResult

  const crashAudio = useRef<PositionalAudioImpl>(null!)
  const [maxSpeed] = useStore((s) => [s.vehicleConfig.maxSpeed])
  const [, api] = useBox(() => ({ mass, args, allowSleep: false, onCollide, ...props }), ref)

  const onCollide = useCallback(
    debounce<(e: CollideEvent) => void>((e) => {
      if (e.body.userData.trigger || !getState().sound || !crashAudio.current) return
      crashAudio.current.setVolume(clamp(e.contact.impactVelocity / 10, 0.2, 1))
      if (!crashAudio.current.isPlaying) crashAudio.current.play()
    }, 200),
    [],
  )

  useEffect(() => {
    setState({ api })
    return () => setState({ api: null })
  }, [api])

  useLayoutEffect(
    () =>
      api.velocity.subscribe((velocity) => {
        const speed = v.set(...velocity).length()
        // const gearPosition = speed / (maxSpeed / gears)
        // const rpmTarget = Math.max(((gearPosition % 1) + Math.log(gearPosition)) / 2, 0)
        const downForce = (-9.81 * (speed / maxSpeed) * maxDownForce + 1) * 1000
        Object.assign(mutation, { downForce, speed, velocity })
      }),
    [maxSpeed],
  )

  useFrame(() => {
    api.applyForce([0, mutation.downForce, 0], [0, 0, 0]) // downforce
  })

  return (
    <group ref={ref} dispose={null}>
      <group position={[0, -0.65, 0]}>
        <mesh geometry={nodes.Object_15.geometry} material={materials.racecar_1_TGA} />
        <mesh geometry={nodes.Object_15_1.geometry} material={materials['Default_Material.008']} />
        <mesh geometry={nodes.Object_15_2.geometry} material={materials['COCKPIT_DAMAGE_TGA.001']} />
        <mesh geometry={nodes.Object_15_3.geometry} material={materials.racecar_2_TGA} />
        <mesh geometry={nodes.Object_15_4.geometry} material={materials.racecar_3_TGA} />
        <mesh geometry={nodes.Object_15_5.geometry} material={materials.racecar_carb_tga} />
      </group>

      {children}
      <PositionalAudio ref={crashAudio} url="/sounds/crash.mp3" loop={false} distance={5} />
    </group>
  )
})

useGLTF.preload('/models/chassi_f1.glb')
