import { OBJLoader } from 'three/examples/js/loaders/OBJLoader'
import * as THREE from 'three'
import 'three/examples/js/utils/BufferGeometryUtils'

const manager = new THREE.LoadingManager()
const objLoader = new OBJLoader(manager)
const textureLoader = new THREE.TextureLoader(manager)

class Model {
  constructor(name, geometry_path, texture_path) {
    this.name = name
    this.geometry_path = geometry_path
    this.texture_path = texture_path
    this.geometry = null
    this.texture = null
    this.lockPoints = lockPoints[name]
  }

  createBlock() {
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

    mesh.$lockPoints = this.createLockpoints()

    mesh.$lockPoints.forEach((x) => {
      mesh.add(x)
    })

    mesh.$isBlock = true

    return mesh
  }

  createLockpoints() {
    return this.lockPoints.map((a) => {
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
      })
    })
  }

  loadGeometry() {
    return Promise.resolve()
      .then(() => fetch(this.geometry_path))
      .then(r => r.text())
      .then((text) => {
        const obj = objLoader.parse(text)
        this.geometry = THREE.BufferGeometryUtils
          .mergeBufferGeometries(obj.children.map(x => x.geometry))
          .scale(10, 10, 10)
      })
  }

  loadTexture() {
    return Promise.resolve()
      .then(() => fetch(this.texture_path))
      .then(r => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        textureLoader.load(url, (texture) => {
          this.texture = texture
        })
      })
  }
}


const fl = Math.floor

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

/* eslint-disable global-require */
const models = [
  ['cylinder', require('./assets/cylinder.obj'), require('./assets/wood.jpg')],
  ['cylinder_wired', require('./assets/cylinder_wired.obj'), require('./assets/hemp.jpg')],
  ['cylinder_half', require('./assets/cylinder_half.obj'), require('./assets/wood.jpg')],
  ['disk', require('./assets/disk.obj'), require('./assets/wood.jpg')],
  ['castle', require('./assets/castle.obj'), require('./assets/wood.jpg')],
  ['box3x3', require('./assets/box3x3.obj'), require('./assets/wood.jpg')],
  ['box4x3', require('./assets/box4x3.obj'), require('./assets/wood.jpg')],
  ['foodtable', require('./assets/foodtable.obj'), require('./assets/wood.jpg')],
  ['bed', require('./assets/bed.obj'), require('./assets/wood.jpg')],
  ['plate5x5', require('./assets/plate5x5.obj'), require('./assets/wood.jpg')],
  ['plate5x3', require('./assets/plate5x3.obj'), require('./assets/wood.jpg')],
  ['plate3x3', require('./assets/plate3x3.obj'), require('./assets/rope.jpg')],
]
  .map(x => new Model(x[0], x[1], x[2]))
/* eslint-enable */


models.get = (name) => {
  for (const x of models) {
    if (x.name === name) {
      return x
    }
  }
  throw Error('Model is not found')
}

const loadModels = () => Promise.all([
  ...models.map(m => m.loadGeometry()),
  ...models.map(m => m.loadTexture()),
])


window.models = models

export {
  models,
  loadModels,
}
