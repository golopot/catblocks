import * as THREE from 'three'

const dq = x => document.querySelector(x)

export const detectWebgl = () => {
  try {
    const scene = new THREE.Scene()
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    const renderer = new THREE.WebGLRenderer()
    renderer.render(
      scene,
      new THREE.PerspectiveCamera(75, 1, 1, 10000)
    )

    return true
  } catch (e) {
    console.error(e)

    return false
  }
}


const showUnsupported = () => {
  document.querySelector('#webgl-unsupported').style.visibility = 'visible'
}


const updateSummary = () => {
  const sum = document.querySelector('#summary')
  const count = window.blocks.reduce((a, x) => {
    if (a[x.name]) a[x.name] += 1
    else a[x.name] = 1
    return a
  }, {})


  const dict = {
    castle: 'W502',
    box3x3: 'W504',
    box4x3: 'W501',
    plate5x5: 'W101',
    plate5x3: 'W202',
    plate3x3: 'W201',
    cylinder: 'W901',
    cylinder_wired: 'W902',
    cylinder_half: 'W904',
    disk: 'W903',
    bed: 'W503',
    foodtable: 'J002',
    pyramid: 'W507',
    castle_longer: 'W509',
  }
  // var dict = {
  //     'castle': '城堡小屋',
  //     'box3x3': '幸福空間',
  //     'box4x3':'幸福小屋',
  //     'plate5x5':'城堡底座',
  //     'plate5x3' :'長形平台',
  //     'plate3x3':'方形平台',
  //     'cylinder':'城堡圓柱',
  //     'cylinder_wired':'麻繩圓柱',
  //     'disk':'圓柱組件',
  //     'bed':'幸福小窩',
  //     'foodtable':'大型餐桌',

  // }


  let text = ''
  for (const key of Object.keys(count)) {
    text += `${dict[key] || key} : ${count[key]}<br>`
  }
  sum.innerHTML = text
}


export const reveal_hide_SelectedModeUI = (hide) => {
  const buttons = [
    dq('#button-delete'),
    dq('#button-rotate-clockwise'),
    dq('#button-rotate-anticlock'),
  ]

  for (const i of buttons) i.style.display = hide ? 'none' : ''
}


export function initUI(world) {
  if (!detectWebgl()) {
    showUnsupported()
  }


  function onUiClick(e) {
    console.log(e.target.id)

    if (e.target.id === 'button-info') {
      dq('#modal-info').classList.add('reveal')
      dq('#modal-checkmark').classList.remove('reveal')


      dq('#modal-info').style.visibility = 'visible'
      dq('#modal-checkmark').style.visibility = 'hidden'


      dq('#header-bar-goback').classList.add('reveal')
      dq('#header-bar').classList.remove('reveal')

      dq('#header-bar-goback').style.visibility = 'visible'
      dq('#header-bar').style.visibility = 'hidden'
    }

    if (e.target.id === 'button-checkmark') {
      dq('#modal-info').classList.remove('reveal')
      dq('#modal-checkmark').classList.add('reveal')

      dq('#modal-info').style.visibility = 'hidden'
      dq('#modal-checkmark').style.visibility = 'visible'


      dq('#header-bar-goback').classList.add('reveal')
      dq('#header-bar').classList.remove('reveal')

      dq('#header-bar-goback').style.visibility = 'visible'
      dq('#header-bar').style.visibility = 'hidden'


      dq('#footer').style.visibility = 'visible'


      updateSummary()
    }

    if (e.target.id === 'button-goback') {
      dq('#modal-info').classList.remove('reveal')
      dq('#modal-checkmark').classList.remove('reveal')

      dq('#modal-info').style.visibility = 'hidden'
      dq('#modal-checkmark').style.visibility = 'hidden'

      dq('#header-bar-goback').classList.remove('reveal')
      dq('#header-bar').classList.add('reveal')

      dq('#header-bar-goback').style.visibility = 'hidden'
      dq('#header-bar').style.visibility = 'visible'


      dq('#footer').style.visibility = 'hidden'
    }


    if (e.target.id === 'snapshot') {
      e.preventDefault()
      world.saveSnapshot()
    }


    if (e.target.id === 'button-delete') {
      const { activeObj } = world

      if (activeObj && activeObj !== world.showcase) world.removeObject(activeObj)
    }


    if (e.target.id === 'button-rotate-clockwise') {
      const { activeObj } = world
      if (activeObj) activeObj.rotation.y -= 3.1415926 / 2
    }

    if (e.target.id === 'button-rotate-anticlock') {
      const { activeObj } = world
      if (activeObj) activeObj.rotation.y += 3.1415926 / 2
    }
  }

  Array.from(document.querySelectorAll('.controlbutton'))
    .forEach((button) => {
      button.addEventListener('click', onUiClick)
    })

  dq('#snapshot').addEventListener('click', onUiClick)
}
