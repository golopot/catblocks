import { reveal_hide_SelectedModeUI } from './uiThings'

export default function initCanvasListeners(container, world) {
  const {
    mouse,
    camera,
  } = world

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
      world.orbitControls.target = world.cameraTarget
    }

    if (event.key === 'ArrowDown') {
      world.cameraTarget.y -= 20
      camera.lookAt(world.cameraTarget)
      world.orbitControls.target = world.cameraTarget
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
      if (world.drag_obj) world.handleDrop()
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
    if (world.drag_obj) world.handleDrop()
  }

  function recordTouchXY(event) {
    mouse.x = event.touches[0].clientX / event.target.clientWidth * 2 - 1
    mouse.y = -event.touches[0].clientY / event.target.clientHeight * 2 + 1
  }


  container.addEventListener('mousemove', onMouseMove, true)
  container.addEventListener('mousedown', onMouseDown, true)
  container.addEventListener('mouseup', onMouseUp, true)
  container.addEventListener('mouseout', onMouseUp, true)

  container.addEventListener('touchmove', onTouchMove, true)
  container.addEventListener('touchstart', onTouchStart, true)
  container.addEventListener('touchend', onTouchEnd, true)
  container.addEventListener('touchcancel', onTouchEnd, true)

  document.addEventListener('keydown', onKeyDown, false)
}
