

  function init() {

    var perspectiveCamera = new THREE.PerspectiveCamera
        ( 45, window.innerWidth / window.innerHeight, 1, 5000 );
    perspectiveCamera.position.set( 500, 500, 400 );
    perspectiveCamera.zoom = 2.5
    perspectiveCamera.updateProjectionMatrix()


    camera = perspectiveCamera
    window.camera = camera

    scene = new THREE.Scene()
    window.scene =scene

    scene2 = new THREE.Scene();
    window.scene2 = scene2


    var light = new THREE.DirectionalLight( 0xffffff, 0.66 );
    light.position.set( 1.7, 3, -1.5 ).normalize()
    lights.push ( light )

    light = new THREE.DirectionalLight( 0xffffff, 0.46 );
    light.position.set( 2, 1, 5 ).normalize()
    lights.push( light )
    
    light = new THREE.AmbientLight( 0xffffff, 0.5 );
    lights.push (light)

    for( let i in lights ) scene.add( lights[i] )


    plane = new THREE.Plane( new THREE.Vector3(0,1,0), 0 )
    sphere = new THREE.Sphere( new THREE.Vector3(0,0,0), 500 )



    container = document.querySelector('#threeContainer')
    raycaster = new THREE.Raycaster();
    // renderer = new THREE.CanvasRenderer();
    renderer = new THREE.WebGLRenderer( { antialias: true });
    renderer.setClearColor( 0xfefefe,1 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;

    onWindowResize()


    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.mouseButtons = 
        { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: null };
    controls.enablePan = false;
    controls.target = new THREE.Vector3(0, camera_target_y, 0)
    camera.lookAt( new THREE.Vector3(0, camera_target_y ,0) );

    

    var dq = x => document.querySelector(x)
    var dqa = x => document.querySelectorAll(x)

    stats = new Stats();
    stats.dom.style.left = null
    stats.dom.style.right = '0px'
    document.body.appendChild( stats.dom )
    stats.dom.style.visibility = 'hidden'


    container = dq('#three-container')
    container.appendChild(renderer.domElement);
    

    container.addEventListener( 'mousemove', onMouseMove, true );
    container.addEventListener( 'mousedown', onMouseDown, true );
    container.addEventListener( 'mouseup', onMouseUp, true );
    container.addEventListener( 'mouseout', onMouseUp, true );

    container.addEventListener( 'touchmove', onTouchMove, true );
    container.addEventListener( 'touchstart', onTouchStart, true );
    container.addEventListener( 'touchend', onTouchEnd, true );
    container.addEventListener( 'touchcancel', onTouchEnd, true );


    for ( let i of Array.from( dqa( '.controlbutton' ) ) )
        i.addEventListener( 'click', onUiClick )

    dq( '#sharecode_out').addEventListener( 'mousedown', onUiSharecodeMousedown)
    dq('#snapshot').addEventListener( 'click', onUiClick )

    document.addEventListener( 'keydown', onKeyDown, false );
    window.addEventListener( 'resize', onWindowResize )

  }



if ( !detectWebgl() ) {
    showUnsupported()
    return
}

init()
animate()
addGrid()


Promise.resolve()
.then( loadGeometries )
.then( loadTextures )
.then( addBlocksToScene )
.then( addShowcase )


// .catch( function(e){console.error(e) })



/*
todo:
    box4x3 holes
    3d modeling, textures

    light flickering
    add cat
    find some visual tricks 

    mobile version
    state sharing

    loading
    metric reference
*/




/*
    mobile:
        touch for rotate
        touch for drag
        piece select
        piece rotate button
        drag to trash can

        increase showcase size
        greenlight when lockable
        cyliner disk warning
        hide stat
*/



// snapping should be in mousemove not render ?


/*
    features:
        snapping
        camera controller
        summary
        snapshot
*/