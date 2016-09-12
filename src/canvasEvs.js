/*
    
              mousedown              mouseup
    no-select ---------> drag_start --------> selected 
       |                                             |
       <----------------------------------------------
                        mouseup

*/

    function onMouseMove( event ) {

        mouse.x = ( event.clientX ) / event.target.clientWidth * 2 - 1;
        mouse.y = - ( event.clientY ) / event.target.clientHeight * 2 + 1;

    }

    function onMouseDown( event ) {

        if ( event.button == 0 ){


            do_intersect()

            if ( intersects.length > 0 ) {

                do_grab_start()
                event.stopPropagation()
                reveal_hide_SelectedModeUI( false )
            }
            
            else{
                drag_obj = null
                reveal_hide_SelectedModeUI( true )
            }

            do_colorize()


        }

        
    }



    function onMouseUp( event ) {

        if ( event.button == 0 ){
            if ( drag_start )
                do_drop()
        }

        do_safety_check()

    }


    function onKeyDown( event ) {

        if ( drag_start )
        {
            if (event.key == 'ArrowLeft')
                drag_obj.rotation.y -= 3.1415926/2
            if (event.key == 'ArrowRight')
                drag_obj.rotation.y += 3.1415926/2

        }


        if ( event.key == 'ArrowUp' ){
            camera_target_y += 20
            camera.lookAt( new THREE.Vector3( 0, camera_target_y, 0)  )
            controls.target.y = camera_target_y

        }

        if ( event.key == 'ArrowDown' ){
            camera_target_y -= 20
            camera.lookAt( new THREE.Vector3( 0, camera_target_y, 0) )
            controls.target.y = camera_target_y
        }
 
    }


    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }


    function onTouchMove ( event ){

        if ( event.touches.length == 1)
            do_record_touchXY()

    }


    function onTouchStart( event ){


        event.preventDefault()

        if ( event.touches.length != 1) return 


        do_record_touchXY()
        do_intersect()

        if ( intersects.length > 0 ) {

            do_grab_start()
            event.stopPropagation()
            reveal_hide_SelectedModeUI( false )
        }
        
        else{
            drag_obj = null
            reveal_hide_SelectedModeUI( true )
        }

        do_colorize()






    }



    function onTouchEnd  ( event ){

        if ( drag_start )
            do_drop()

        do_safety_check()

    }

    var do_record_touchXY = function(){
        mouse.x = event.touches[0].clientX / event.target.clientWidth * 2 - 1;
        mouse.y = - event.touches[0].clientY/ event.target.clientHeight * 2 + 1;

    }

    var do_colorize = function(){

        for (let i of blocks)
            i.material.setValues({ emissive: 0x000000})

        if ( drag_obj && drag_obj != showcase){
            drag_obj.material.setValues({ emissive: 0xff44ff,  emissiveIntensity: 0.3, })
        }

    }



    var do_grab_start = function(){


        raycaster.setFromCamera( mouse, camera );
        drag_start = raycaster.ray.intersectPlane( plane )
        drag_obj = intersects[0].object
        drag_pre_position = drag_obj.getWorldPosition()


        // if in showcase
        if ( drag_obj.parent.name == 'showcase_spot'){

            var mesh = models.get(drag_obj.name).createBlock()
            var spot = drag_obj.parent
            spot.add( mesh )
            blocks.push ( drag_obj)
            scene2.add(drag_obj)
        }
        else{
            utils.detach( drag_obj )
            // enable on top
            scene2.add(drag_obj)
        }

    }