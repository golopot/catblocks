import { OrbitControls } from 'three/examples/js/controls/OrbitControls'
import { WorldControls } from './WorldControls'

export default function Controls(world) {
  const worldControls = WorldControls(world)

  const orbitControls = new OrbitControls(world.camera, world.domElement)
  orbitControls.enablePan = false
  orbitControls.target = world.cameraTarget
  orbitControls.update()

  return {
    orbitControls,
    worldControls,
  }
}
