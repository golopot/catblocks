import * as THREE from 'three'
import { models } from './models'

const pv4 = v => `x: ${v.x.toFixed(2)} y: ${v.y.toFixed(2)} z: ${v.z.toFixed(2)}`
window.pv4 = pv4

const dummyVector = new THREE.Vector3()
const getHeight = x => x.getWorldPosition(dummyVector).y

window.pm = (m) => {
  let e = m.elements
  e = [
    e[0], e[4], e[8], [12],
    e[1], e[5], e[9], e[13],
    e[2], e[6], e[10], e[14],
    e[3], e[7], e[11], e[15],
  ]
    .map(x => x.toPrecision(2))
    .reduce(
      (a, b, i) => `${a + b},${' '.repeat(10 - b.length > 0 ? 10 - b.length : 0)}${
        i % 4 === 3 ? '\n' : ''
      }`,
      ''
    )

  console.log(e)
}

const utils = {
  updateMatrixWorldOfAncestors(obj) {
    const ancestors = []
    for (let a = obj; a !== null; a = a.parent) ancestors.push(a)
    for (let a = ancestors.pop(); a !== undefined; a = ancestors.pop()) {
      a.matrix.compose(
        a.position,
        a.quaternion,
        a.scale
      )
      if (a.parent === null) a.matrixWorld.copy(a.matrix)
      if (a.parent !== null) a.matrixWorld.multiplyMatrices(a.parent.matrixWorld, a.matrix)
    }
  },

  detach(child) {
    if (child.parent === null) return
    utils.updateMatrixWorldOfAncestors(child)
    child.matrix.copy(child.matrixWorld)
    child.matrix.decompose(child.position, child.quaternion, child.scale)
    child.parent.remove(child)
  },

  attach(child, parent) {
    utils.updateMatrixWorldOfAncestors(child)
    utils.updateMatrixWorldOfAncestors(parent)
    child.matrix.getInverse(parent.matrixWorld).multiply(child.matrixWorld)
    child.matrix.decompose(child.position, child.quaternion, child.scale)
    parent.add(child)
  },

}

const getIntersected = (world) => {
  const {
    raycaster, mouse, camera, showcase, blocks,
  } = world

  raycaster.setFromCamera(mouse, camera)

  const intersectable = [
    showcase,
    ...blocks,
    ...showcase.$spots.map(x => x.children[0]).filter(Boolean),
  ]

  const intersection = raycaster.intersectObjects(intersectable).shift()
  return (intersection && intersection.object) || null
}

const handleDragStart = (world) => {
  const {
    mouse, camera, plane, raycaster, scene2, blocks,
  } = world

  const dragObj = world.getIntersected()

  if (dragObj === null) return

  world.dragObj = dragObj
  world.activeObj = dragObj


  raycaster.setFromCamera(mouse, camera)
  world.dragPointStart = raycaster.ray.intersectPlane(plane, new THREE.Vector3())

  world.dragObjPositionStart = dragObj.getWorldPosition(new THREE.Vector3())

  // if in showcase
  if (dragObj.parent.name === 'showcase_spot') {
    const mesh = models.get(dragObj.name).createBlock()
    const spot = dragObj.parent
    spot.add(mesh)
    blocks.push(dragObj)
  } else {
    utils.detach(dragObj)
  }

  world.updateActiveObjColor()

  // add dragObj to the top layer
  scene2.add(dragObj)
}

const updateActiveObjColor = (world) => {
  const {
    showcase,
    activeObj,
    blocks,
  } = world

  for (const i of blocks) i.material.setValues({ emissive: 0x000000 })

  if (activeObj && activeObj !== showcase) {
    activeObj.material.setValues({ emissive: 0xff44ff, emissiveIntensity: 0.3 })
  }
}

const handleDragging = (world) => {
  if (!world.dragObj) {
    return
  }

  const {
    mouse,
    camera,
    raycaster,
    dragObj,
    dragPointStart,
    dragObjPositionStart,
    plane,
  } = world
  raycaster.setFromCamera(mouse, camera)
  raycaster.ray.recast(-3000)

  const dragPoint = raycaster.ray.intersectPlane(plane, new THREE.Vector3())

  const intersects = raycaster.intersectObject(dragObj)
  const perspectiveRatio = camera.type !== 'PerspectiveCamera'
    ? 1
    : intersects.length > 0
      ? 1 - intersects[0].point.y / camera.position.y
      : 1 - dragObj.position.y / camera.position.y

  dragObj.position
    .copy(dragPoint.sub(dragPointStart))
    .multiplyScalar(perspectiveRatio)
    .add(dragObjPositionStart)
}

const handleLockPoints = (world) => {
  const { dragObj, blocks } = world
  if (!dragObj) {
    return
  }
  const lockPoints = blocks
    .filter(x => x !== dragObj)
    .map(x => x.$lockPoints)
    .reduce((a, b) => a.concat(b), [])
    .filter(x => x.$direction === 'up')

  for (const a of dragObj.$lockPoints) {
    if (a.$direction !== 'down') continue

    a.$preparedToLock = lockPoints
      .filter(x => !x.$locked && viewDistance(a, x) < 5.0)
      .sort((x, y) => getHeight(x) - getHeight(y))
      .pop() || null
  }

  function viewDistance(a, b) {
    const { camera } = world
    let n = new THREE.Vector3().copy(camera.position).normalize()

    if (camera.type === 'PerspectiveCamera') {
      n = new THREE.Vector3()
        .copy(camera.position)
        .sub(a.getWorldPosition(new THREE.Vector3()))
        .normalize()
    }

    const d = new THREE.Vector3().subVectors(
      a.getWorldPosition(new THREE.Vector3()),
      b.getWorldPosition(new THREE.Vector3())
    )

    return Math.sqrt(d.lengthSq() - d.dot(n) * d.dot(n))
  }
}


function handleDrop(world) {
  console.log('dropped')
  const { dragObj, scene } = world

  world.dragPointStart = null
  // disable on top
  scene.add(dragObj)
  dragObj.position.y = 0

  // make this plate align to the grid
  if (dragObj.name === 'plate5x5') {
    dragObj.position.x = Math.floor(dragObj.position.x / 10) * 10 + 5
    dragObj.position.z = Math.floor(dragObj.position.z / 10) * 10 + 5
  }

  // clear locking
  for (const a of dragObj.$lockPoints) {
    if (a.$locked !== null) {
      a.$locked.$locked = null
    }
  }

  const lockingCandidates = dragObj
    .$lockPoints
    .filter(x => x.$preparedToLock !== null)

  if (lockingCandidates.length > 0) {
    // Two pillers with different height, lock the higher one
    const lockthis = lockingCandidates
      .sort((a, b) => getHeight(a.$preparedToLock) - getHeight(b.$preparedToLock))
      .pop()

    const almostParent = lockthis.$preparedToLock.parent

    // avoid circular ancestorness
    let autoAncestor = false
    almostParent.traverseAncestors((x) => {
      if (x === dragObj) autoAncestor = true
    })

    if (!autoAncestor) {
      dragObj.$lockPoints.forEach((x) => { x.$locked = null })
      dragObj.$lockPoints
        .filter(x => x.$preparedToLock !== null
                   && getHeight(lockthis) - getHeight(x) < 2)
        .forEach((x) => {
          x.$locked = x.$preparedToLock
        })

      dragObj.position.copy(
        dragObj
          .getWorldPosition(new THREE.Vector3())
          .sub(lockthis.getWorldPosition(new THREE.Vector3()))
          .add(lockthis.$locked.getWorldPosition(new THREE.Vector3()))
      )

      utils.attach(dragObj, almostParent)
    }
  }

  world.dragObj = null

  world.safetyCheck()
}

const safetyCheck = (world) => {
  const { blocks } = world

  const lps = blocks.map(x => x.$lockPoints).reduce((a, b) => a.concat(b), [])

  const ups = lps.filter(x => x.$direction === 'up')

  const downs = lps.filter(x => x.$direction === 'down')

  for (let i = 0; i < ups.length; i += 1) {
    ups[i].$tmp_wp = ups[i].getWorldPosition(new THREE.Vector3())
  }

  for (let i = 0; i < downs.length; i += 1) {
    downs[i].$tmp_wp = downs[i].getWorldPosition(new THREE.Vector3())
  }
  for (let i = 0; i < downs.length; i += 1) {
    downs[i].$tmp_gap = false
    downs[i].$tmp_lock = false
  }

  for (let i = 0; i < ups.length; i += 1) {
    for (let j = 0; j < downs.length; j += 1) {
      const u = ups[i]
      const d = downs[j]
      const s = new THREE.Vector3().copy(d.$tmp_wp).sub(u.$tmp_wp)
      if (Math.abs(s.x) + Math.abs(s.z) < 0.1) {
        if (s.y > 1.7 && s.y < 1.8 * 3 + 0.1) d.$tmp_gap = true
        if (s.y > -0.01 && s.y < 0.1) d.$tmp_lock = true
      }
    }
  }

  const gaps = downs.filter(x => x.$tmp_gap && !x.$tmp_lock)

  renderWarning(gaps)
}

/* eslint-disable global-require */

const renderWarning = (gaps) => {
  if (gaps.length === 0) {
    document.querySelector('#button-checkmark img').src = require('./images/checkmark.svg')
    document.querySelector('#safety-warn').style.display = 'none'
  } else {
    document.querySelector('#button-checkmark img').src = require('./images/warn.svg')
    document.querySelector('#safety-warn').style.display = ''
  }
}

/* eslint-enable */

const saveSnapshot = (world) => {
  const { renderer } = world
  const imgData = renderer.domElement.toDataURL()
  const link = document.createElement('a')
  link.href = imgData
  link.download = 'micha-cattree'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const removeObject = (world, obj) => {
  const { blocks } = world

  if (obj.parent) obj.parent.remove(obj)

  if (blocks.indexOf(obj) !== -1) blocks.splice(blocks.indexOf(obj), 1)

  if (obj.$locked) obj.$locked.$locked = null

  for (const i of obj.children.slice()) removeObject(world, i)
}

export function createWorld() {
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    5000
  )
  camera.position.set(500, 500, 400)
  camera.zoom = 2.5
  camera.updateProjectionMatrix()

  const cameraTarget = new THREE.Vector3(0, 70, 0)
  camera.lookAt(cameraTarget)

  const scene = new THREE.Scene()
  const scene2 = new THREE.Scene()

  const light1 = new THREE.DirectionalLight(0xffffff, 0.66)
  light1.position.set(1.7, 3, -1.5).normalize()

  const light2 = new THREE.DirectionalLight(0xffffff, 0.46)
  light2.position.set(2, 1, 5).normalize()

  const light3 = new THREE.AmbientLight(0xffffff, 0.5)

  const lights = [light1, light2, light3]

  scene.add(...lights)
  scene2.add(...lights.map(x => x.clone()))

  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

  const raycaster = new THREE.Raycaster()
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  })
  renderer.setClearColor(0xfefefe, 1)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.autoClear = false

  const tick = () => {
    handleDragging(world)
    handleLockPoints(world)

    renderer.clear()
    renderer.render(scene, camera)
    renderer.clearDepth()
    renderer.render(scene2, camera)
  }

  const animate = () => {
    window.requestAnimationFrame(animate)
    tick()
  }

  const world = {
    mouse: new THREE.Vector2(),
    activeObj: null,
    dragObj: null,
    dragPointStart: null,
    dragObjPositionStart: null,
    handleDragStart: () => handleDragStart(world),
    handleDrop: () => handleDrop(world),
    safetyCheck: () => safetyCheck(world),
    getIntersected: () => getIntersected(world),
    saveSnapshot: () => saveSnapshot(world),
    removeObject: obj => removeObject(world, obj),
    updateActiveObjColor: () => updateActiveObjColor(world),
    showcase: null,
    blocks: [],
    raycaster,
    plane,
    camera,
    cameraTarget,
    scene,
    scene2,
    controls: null,
    renderer,
    animate,
  }

  window.blocks = world.blocks
  window.scene = world.scene
  window.world = world
  return world
}
