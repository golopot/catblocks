import { OBJLoader } from 'three/examples/js/loaders/OBJLoader'

import * as THREE from 'three'
import JSZip from 'jszip'
import BufferGeometryUtils from './vendor/BufferGeometryUtils'

const createLockpoints = points => points.map((a) => {
  const geometry = new THREE.IcosahedronGeometry(1.0)
  const point = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial())
  point.position.fromArray(a.position)
  point.material.setValues({
    color: 0xff0000,
    emissiveIntensity: 0.2,
  })

  // dollar sign means user-defined properties
  return Object.assign(point, {
    $direction: a.direction,
    $projPositionCache: new THREE.Vector3(),
    $locked: null,
    $preparedToLock: null,
    visible: false,
    // visible: true,
  })
})


const fl = Math.floor


const manager = new THREE.LoadingManager()
const objLoader = new OBJLoader(manager)
const textureLoader = new THREE.TextureLoader(manager)


function Model(name, geometry_path, texture_path) {
  this.name = name
  this.geometry_path = geometry_path
  this.texture_path = texture_path
  this.geometry = null
  this.texture = null
  this.lockPoints = lockPoints[name]
}

Model.prototype.createBlock = function createBlock() {
  const mesh = new THREE.Mesh(this.geometry, new THREE.MeshPhongMaterial())

  mesh.material.setValues(
    {
      color: 0x51D0FF,
      emissiveIntensity: 0,
      // specular: 0x2F4AC5,
      shininess: 0,
      // transparent: true,
      opacity: 1.0,
    }
  )

  if (this.texture !== null) {
    mesh.material.setValues({ map: this.texture, color: 0xffffff })
  }

  mesh.name = this.name

  mesh.$lockPoints = createLockpoints(this.lockPoints)

  mesh.$lockPoints.forEach((x) => {
    mesh.add(x)
  })

  mesh.$isBlock = true

  return mesh
}


Model.prototype.loadGeometry = function loadGeometry(zip) {
  return Promise.resolve()
    .then(() => zip
      .file(this.geometry_path)
      .async('text')
      .then((blob) => {
        const obj = objLoader.parse(blob)
        this.geometry = BufferGeometryUtils
          .mergeBufferGeometries(obj.children.map(x => x.geometry))
          .scale(10, 10, 10)
      }))
}


Model.prototype.loadTexture = function loadTexture(zip) {
  return Promise.resolve()
    .then(() => zip
      .file(this.texture_path)
      .async('blob')
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        return textureLoader.load(url, (texture) => {
          this.texture = texture
        })
      }))
}

const lockPoints = {
  box3x3: []
    .concat(
      Array.from({ length: 9 })
        .map((x, i) => [((i % 3) - 1) * 10, 30, (fl(i / 3) - 1) * 10])
        .map(x => ({ direction: 'up', position: x }))
    )
    .concat(
      Array.from({ length: 9 })
        .map((x, i) => [((i % 3) - 1) * 10, 0, (fl(i / 3) - 1) * 10])
        .map(x => ({ direction: 'down', position: x }))
    ),

  plate3x3: []
    .concat(
      Array.from({ length: 9 })
        .map((x, i) => [((i % 3) - 1) * 10, 1.8, (fl(i / 3) - 1) * 10])
        .map(x => ({ direction: 'up', position: x }))
    )
    .concat(
      Array.from({ length: 9 })
        .map((x, i) => [((i % 3) - 1) * 10, 0, (fl(i / 3) - 1) * 10])
        .map(x => ({ direction: 'down', position: x }))
    ),
  plate5x3: []
    .concat(
      Array.from({ length: 15 })
        .map((x, i) => [((i % 5) - 2) * 10, 1.8, (fl(i / 5) - 1) * 10])
        .map(x => ({ direction: 'up', position: x }))
    )
    .concat(
      Array.from({ length: 15 })
        .map((x, i) => [((i % 5) - 2) * 10, 0, (fl(i / 5) - 1) * 10])
        .map(x => ({ direction: 'down', position: x }))
    ),
  plate5x5: []
    .concat(
      Array.from({ length: 25 })
        .map((x, i) => [((i % 5) - 2) * 10, 3.6, (fl(i / 5) - 2) * 10])
        .map(x => ({ direction: 'up', position: x }))
    )
    .concat(
      Array.from({ length: 25 })
        .map((x, i) => [((i % 5) - 2) * 10, 0.0, (fl(i / 5) - 2) * 10])
        .map(x => ({ direction: 'down', position: x }))
    ),

  cylinder:
        [
          { direction: 'up', position: [0, 30, 0] },
          { direction: 'down', position: [0, 0, 0] },
        ],
  cylinder_wired:
        [
          { direction: 'up', position: [0, 30, 0] },
          { direction: 'down', position: [0, 0, 0] },
        ],
  cylinder_half:
        [
          { direction: 'up', position: [0, 13.2, 0] },
          { direction: 'down', position: [0, 0, 0] },
        ],
  disk:
        [
          { direction: 'up', position: [0, 1.8, 0] },
          { direction: 'down', position: [0, 0, 0] },
        ],
  bed: []
    .concat(
      Array.from({ length: 8 })
        .map((x, i) => [(i % 4) * 10 - 15, 1.8, (fl(i / 4)) * 10 - 5])
        .map(x => ({ direction: 'up', position: x }))
    )
    .concat(
      Array.from({ length: 8 })
        .map((x, i) => [(i % 4) * 10 - 15, 0, (fl(i / 4)) * 10 - 5])
        .map(x => ({ direction: 'down', position: x }))
    ),
  box4x3: []
    .concat(
      Array.from({ length: 12 })
        .map((x, i) => [(i % 4) * 10 - 15, 30, (fl(i / 4)) * 10 - 10])
        .map(x => ({ direction: 'up', position: x }))
    )
    .concat(
      Array.from({ length: 12 })
        .map((x, i) => [(i % 4) * 10 - 15, 0, (fl(i / 4)) * 10 - 10])
        .map(x => ({ direction: 'down', position: x }))
    ),
  castle: []
    .concat(
      Array.from({ length: 12 })
        .map((x, i) => [(i % 4) * 10 - 15, 30, (fl(i / 4)) * 10 - 10])
        .map(x => ({ direction: 'up', position: x }))
    )
    .concat(
      Array.from({ length: 12 })
        .map((x, i) => [(i % 4) * 10 - 15, 0, (fl(i / 4)) * 10 - 10])
        .map(x => ({ direction: 'down', position: x }))
    ),
  foodtable:
        [
          { direction: 'down', position: [5, 0, 5] },
          { direction: 'down', position: [5, 0, -5] },
          { direction: 'down', position: [-5, 0, 5] },
          { direction: 'down', position: [-5, 0, -5] },
        ],
}

const loadModels = () => fetch('/assets/assets.zip')
  .then(r => r.blob())
  .then(r => new JSZip().loadAsync(r))
  .then(zip => Promise.all([
    ...models.map(x => x.loadGeometry(zip)),
    ...models.map(x => x.loadTexture(zip)),
  ]))
  .catch(console.error)

const models = [
  ['cylinder', 'cylinder.obj', 'wood.jpg'],
  ['cylinder_wired', 'cylinder_wired.obj', 'hemp.jpg'],
  ['cylinder_half', 'cylinder_half.obj', 'wood.jpg'],
  ['disk', 'disk.obj', 'wood.jpg'],
  ['castle', 'castle.obj', 'wood.jpg'],
  ['box3x3', 'box3x3.obj', 'wood.jpg'],
  ['box4x3', 'box4x3.obj', 'wood.jpg'],
  ['foodtable', 'foodtable.obj', 'wood.jpg'],
  ['bed', 'bed.obj', 'wood.jpg'],
  ['plate5x5', 'plate5x5.obj', 'wood.jpg'],
  ['plate5x3', 'plate5x3.obj', 'wood.jpg'],
  ['plate3x3', 'plate3x3.obj', 'wood.jpg'],
]
  .map(x => new Model(x[0], x[1], x[2]))


models.get = (name) => {
  for (let i = 0; i < models.length; i += 1) if (models[i].name === name) return models[i]
  console.error('not found')
  return null
}

window.models = models
export {
  models,
  loadModels,
}
