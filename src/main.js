import { OrbitControls } from 'three/examples/js/controls/OrbitControls'
import { initUI } from './uiThings'
import initCanvasListeners from './canvasEvs'
import { createWorld } from './core'
import { addGrid, addDefaultBlocks, addShowcase } from './sceneSetup'
import { loadModels } from './models'


function init() {
  const world = createWorld()
  const {
    camera,
    cameraTarget,
    renderer,
    animate,
  } = world


  document
    .querySelector('#three-container')
    .appendChild(renderer.domElement)

  initCanvasListeners(renderer.domElement, world)
  initUI(world)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.target = cameraTarget
  controls.update()

  world.orbitControls = controls


  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  onWindowResize()
  window.addEventListener('resize', onWindowResize)

  animate()
  addGrid(world)

  return Promise.resolve()
    .then(loadModels)
    .then(() => {
      addDefaultBlocks(world)
      addShowcase(world)
    })
}


init()
  .catch(console.error)
