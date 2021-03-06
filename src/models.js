import { OBJLoader } from 'three/examples/js/loaders/OBJLoader'
import * as THREE from 'three'
import 'three/examples/js/utils/BufferGeometryUtils'

const manager = new THREE.LoadingManager()
const objLoader = new OBJLoader(manager)
const textureLoader = new THREE.TextureLoader(manager)

class Model {
  constructor(name, geometry_path, texture_path, scale = 1, rotateY = 0) {
    if (!geometry_path || !texture_path) {
      throw Error(`Missing required parameter for ${name}`)
    }
    if (!lockPoints[name]) {
      throw Error(`Lockpoints is not defined for ${name}`)
    }

    this.name = name
    this.geometry_path = geometry_path
    this.texture_path = texture_path
    this.geometry = null
    this.texture = null
    this.scale = scale
    this.rotateY = rotateY
    this.lockPoints = lockPoints[name]

    if (!this.lockPoints) throw Error(`lockPoints for ${name} is not defined.`)
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
    return this.lockPoints.map(({ position, direction }) => {
      const geometry = new THREE.IcosahedronGeometry(1.0)
      const point = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial())
      point.position.fromArray(position)
      point.material.setValues({
        color: 0xff0000,
        emissiveIntensity: 0.2,
      })

      // dollar sign means user-defined properties
      return Object.assign(point, {
        $direction: direction,
        $projPositionCache: new THREE.Vector3(),
        $locked: null,
        $preparedToLock: null,
        visible: false, // set this to true for debugging lockpoints
      })
    })
  }

  loadGeometry() {
    const scale = 10 * this.scale
    return Promise.resolve()
      .then(() => fetch(this.geometry_path))
      .then(r => r.text())
      .then((text) => {
        const obj = objLoader.parse(text)
        this.geometry = THREE.BufferGeometryUtils
          .mergeBufferGeometries(obj.children.map(x => x.geometry))
          .scale(scale, scale, scale)
          .rotateY(this.rotateY)
      })
  }

  loadTexture() {
    return new Promise((resolve, reject) => {
      const onLoad = (texture) => {
        this.texture = texture
        resolve()
      }

      const onProgress = () => {}

      const onError = (err) => {
        console.error(err)
        reject(err)
      }

      textureLoader.load(this.texture_path, onLoad, onProgress, onError)
    })
  }
}


const fl = Math.floor

const Grid = (numX, numZ, scale, center, direction) => Array.from({ length: numX * numZ })
  .map((_, i) => {
    const [cx, cy, cz] = center

    return {
      direction,
      position: [
        ((i % numX) - (numX - 1) / 2 + cx) * scale,
        cy * scale,
        (fl(i / numX) - (numZ - 1) / 2 + cz) * scale,
      ],
    }
  })

const lockPoints = {
  box3x3: [
    ...Grid(3, 3, 10, [0, 3, 0], 'up'),
    ...Grid(3, 3, 10, [0, 0, 0], 'down'),
  ],
  plate3x3: [
    ...Grid(3, 3, 10, [0, 0.18, 0], 'up'),
    ...Grid(3, 3, 10, [0, 0, 0], 'down'),
  ],
  plate5x3: [
    ...Grid(5, 3, 10, [0, 0.18, 0], 'up'),
    ...Grid(5, 3, 10, [0, 0, 0], 'down'),
  ],
  plate5x5: [
    ...Grid(5, 5, 10, [0, 0.36, 0], 'up'),
    ...Grid(5, 5, 10, [0, 0, 0], 'down'),
  ],
  cylinder: [
    { direction: 'up', position: [0, 30, 0] },
    { direction: 'down', position: [0, 0, 0] },
  ],
  cylinder_wired: [
    { direction: 'up', position: [0, 30, 0] },
    { direction: 'down', position: [0, 0, 0] },
  ],
  cylinder_half: [
    { direction: 'up', position: [0, 13.2, 0] },
    { direction: 'down', position: [0, 0, 0] },
  ],
  disk: [
    { direction: 'up', position: [0, 1.8, 0] },
    { direction: 'down', position: [0, 0, 0] },
  ],
  bed: [
    ...Grid(4, 2, 10, [0, 0.18, 0], 'up'),
    ...Grid(4, 2, 10, [0, 0, 0], 'down'),
  ],
  box4x3: [
    ...Grid(4, 3, 10, [0, 3, 0], 'up'),
    ...Grid(4, 3, 10, [0, 0, 0], 'down'),
  ],
  castle: [
    ...Grid(4, 3, 10, [0, 3, 0], 'up'),
    ...Grid(4, 3, 10, [0, 0, 0], 'down'),
  ],
  foodtable: [
    { direction: 'down', position: [5, 0, 5] },
    { direction: 'down', position: [5, 0, -5] },
    { direction: 'down', position: [-5, 0, 5] },
    { direction: 'down', position: [-5, 0, -5] },
  ],
  castle_longer: [
    ...Grid(3, 11, 10, [0, 3.5, 0], 'up'),
    ...Grid(3, 11, 10, [0, 0, 0], 'down'),
  ],
  pyramid: [
    ...Grid(3, 3, 10, [0, 0, 0], 'down'),
  ],
  bridge: [
    ...Grid(4, 1, 10, [0, 0.2, 5.5], 'up'),
    ...Grid(4, 1, 10, [0, 0, 5.5], 'down'),
    ...Grid(4, 1, 10, [0, 0.2, -5.5], 'up'),
    ...Grid(4, 1, 10, [0, 0, -5.5], 'down'),
  ],
  castleplate: [
    ...Grid(3, 3, 10, [0, 0.36, 0], 'up'),
    ...Grid(3, 3, 10, [0, 0, 0], 'down'),
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
  ['plate3x3', require('./assets/plate3x3.obj'), require('./assets/wood.jpg')],
  ['castle_longer', require('./assets/castle-longer.obj'), require('./assets/wood.jpg')],
  ['pyramid', require('./assets/pyramid.obj'), require('./assets/pyramid.jpg')],
  ['bridge', require('./assets/bridge.obj'), require('./assets/wood.jpg'), 0.1, Math.PI / 2],
  ['castleplate', require('./assets/castleplate.obj'), require('./assets/wood.jpg')],
]
  .map(x => new Model(x[0], x[1], x[2], x[3], x[4]))
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
