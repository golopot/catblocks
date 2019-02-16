import { reveal_hide_SelectedModeUI } from './uiThings'

export function WorldControls(world) {
  const { mouse, camera, renderer } = world
  const { domElement } = world.renderer

  function onKeyDown(event) {
    const { activeObj } = world

    if (activeObj) {
      console.log(event)
      if (event.key === 'ArrowLeft') activeObj.rotation.y -= 3.1415926 / 2
      if (event.key === 'ArrowRight') activeObj.rotation.y += 3.1415926 / 2
    }

    if (event.key === 'ArrowUp') {
      world.cameraTarget.y += 20
      camera.lookAt(world.cameraTarget)
      world.controls.orbitControls.target = world.cameraTarget
    }

    if (event.key === 'ArrowDown') {
      world.cameraTarget.y -= 20
      camera.lookAt(world.cameraTarget)
      world.controls.orbitControls.target = world.cameraTarget
    }
  }


  function onMouseMove(event) {
    mouse.x = (event.clientX) / event.target.clientWidth * 2 - 1
    mouse.y = -(event.clientY) / event.target.clientHeight * 2 + 1
  }

  function onMouseDown(event) {
    if (event.button === 0) {
      if (world.getIntersected()) {
        event.stopImmediatePropagation()
        event.stopPropagation()
        world.handleDragStart()
      } else {
        world.activeObj = null
        world.updateActiveObjColor()
      }

      if (world.activeObj) {
        reveal_hide_SelectedModeUI(false)
      } else {
        reveal_hide_SelectedModeUI(true)
      }
    }
  }

  function onMouseUp(event) {
    if (event.button === 0) {
      if (world.dragObj) world.handleDrop()
    }
  }

  function onTouchMove(event) {
    if (event.touches.length === 1) {
      recordTouchXY(event)
    }
  }

  function onTouchStart(event) {
    event.preventDefault()

    if (event.touches.length !== 1) return

    recordTouchXY(event)

    if (world.getIntersected()) {
      event.stopImmediatePropagation()
      event.stopPropagation()
      world.handleDragStart()
    } else {
      world.activeObj = null
      world.updateActiveObjColor()
    }

    if (world.activeObj) {
      reveal_hide_SelectedModeUI(false)
    } else {
      reveal_hide_SelectedModeUI(true)
    }
  }

  function onTouchEnd() {
    if (world.dragObj) world.handleDrop()
  }

  function recordTouchXY(event) {
    mouse.x = event.touches[0].clientX / event.target.clientWidth * 2 - 1
    mouse.y = -event.touches[0].clientY / event.target.clientHeight * 2 + 1
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  function init() {
    domElement.addEventListener('mousemove', onMouseMove, true)
    domElement.addEventListener('mousedown', onMouseDown, true)
    domElement.addEventListener('mouseup', onMouseUp, true)
    domElement.addEventListener('mouseout', onMouseUp, true)

    domElement.addEventListener('touchmove', onTouchMove, true)
    domElement.addEventListener('touchstart', onTouchStart, true)
    domElement.addEventListener('touchend', onTouchEnd, true)
    domElement.addEventListener('touchcancel', onTouchEnd, true)

    document.addEventListener('keydown', onKeyDown, false)
    window.addEventListener('resize', onWindowResize)
    onWindowResize()
  }

  function dispose() {
    domElement.removeEventListener('mousemove', onMouseMove)
    domElement.removeEventListener('mousedown', onMouseDown)
    domElement.removeEventListener('mouseup', onMouseUp)
    domElement.removeEventListener('mouseout', onMouseUp)

    domElement.removeEventListener('touchmove', onTouchMove)
    domElement.removeEventListener('touchstart', onTouchStart)
    domElement.removeEventListener('touchend', onTouchEnd)
    domElement.removeEventListener('touchcancel', onTouchEnd)

    document.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('resize', onWindowResize)
  }

  init()

  return {
    dispose,
  }
}
