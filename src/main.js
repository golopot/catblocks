import { initUI } from './uiThings'
import Controls from './Controls'
import { createWorld } from './core'
import { addGrid, addDefaultBlocks, addShowcase } from './sceneSetup'
import { loadModels } from './models'


function init() {
  const world = createWorld()

  const { renderer, animate } = world

  document
    .querySelector('#three-container')
    .appendChild(renderer.domElement)

  initUI(world)

  world.controls = Controls(world)

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
