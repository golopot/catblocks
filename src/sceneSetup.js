import * as THREE from 'three'
import { models } from './models'

export const addGrid = (world) => {
  const size = 150
  const step = 10
  const geometry = new THREE.Geometry()
  for (let i = -size; i <= size; i += step) {
    geometry.vertices.push(new THREE.Vector3(-size, 0, i))
    geometry.vertices.push(new THREE.Vector3(size, 0, i))
    geometry.vertices.push(new THREE.Vector3(i, 0, -size))
    geometry.vertices.push(new THREE.Vector3(i, 0, size))
  }
  const material = new THREE.LineBasicMaterial({
    color: 0x000000,
    opacity: 0.2,
    transparent: true,
  })
  const line = new THREE.LineSegments(geometry, material)
  world.scene.add(line)
}

export const addDefaultBlocks = (world) => {
  const { scene, blocks } = world
  const box = models.get('box3x3').createBlock()
  box.position.set(0, 0, -50)
  scene.add(box)
  blocks.push(box)

  const plate = models.get('plate5x5').createBlock()
  scene.add(plate)
  blocks.push(plate)

  const cylinder = models.get('cylinder').createBlock()
  cylinder.position.set(-50, 0, 0)
  scene.add(cylinder)
  blocks.push(cylinder)
}

export const addShowcase = (world) => {
  const spotsize = 60
  const spot_num_x = 4
  const spot_num_z = 4
  const scale = 0.3

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial()
  )
  mesh.name = 'showcase'
  mesh.scale.multiplyScalar(scale)
  mesh.geometry.scale(
    spot_num_x * spotsize,
    0.1 * spotsize,
    spot_num_z * spotsize
  )
  mesh.material.setValues({
    color: 0xeeeeee,
  })
  mesh.position.set(0, 0, 65)
  mesh.$spots = []

  for (let i = 0; i < models.length; i += 1) {
    const spot = new THREE.Object3D()
    const u = i % spot_num_z
    const v = Math.floor(i / spot_num_z)
    const offsetx = ((spot_num_x - 1) / 2) * spotsize
    const offsetz = ((spot_num_z - 1) / 2) * spotsize
    spot.position.set(v * spotsize - offsetx, 10, u * spotsize - offsetz)
    mesh.add(spot)
    mesh.$spots.push(spot)

    const block = models[i].createBlock()
    spot.add(block)
    spot.name = 'showcase_spot'
  }

  mesh.$spots[0].scale.multiplyScalar(2.5)
  mesh.$spots[1].scale.multiplyScalar(2.5)
  mesh.$spots[2].scale.multiplyScalar(2.5)
  mesh.$spots[3].scale.multiplyScalar(3)
  mesh.$spots[12].scale.multiplyScalar(0.5)

  mesh.$lockPoints = []
  world.scene.add(mesh)
  world.showcase = mesh
}
