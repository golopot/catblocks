    /*
        @author q4w56 / https://github.com/q4w56
    */

    var container, stats;
    var camera, scene, scene2, raycaster, renderer;
    var mouse = new THREE.Vector2()
    var intersects = [], last_intersects = [] 
    var drag_obj, drag_start, drag_pre_position
    var plane, sphere
    var controls

    var camera_target_y = 70

    var lights = []
    var nv = (a,b,c) => new THREE.Vector3(a,b,c)
    var pv3 = v => 'x: ' +  v.x.toFixed(2) + ' y: '+ v.y.toFixed(2) + ' z: ' + v.z.toFixed(2)
    var blocks = []
    var showcase
    var mode = 'default'
    var drop_occurred = false
    var getImageData = false
    var imgData



    window.pmode = () => {console.log(mode)}
    window.nv = nv
    window.blocks = blocks
    window.pm = function(m){
        var e = m.elements
        e = 
        [
            e[0], e[4], e[8], e[12], 
            e[1], e[5], e[9], e[13], 
            e[2], e[6], e[10], e[14],
            e[3], e[7], e[11], e[15]
        ].map ( x => x.toPrecision(2) )
        .reduce( (a,b,i) => a+b+',' + ' '.repeat( 10-b.length > 0 ?10-b.length : 0 ) 
            + (i%4==3 ? '\n' : '')  , '' )

        console.log(  e )
    }






    var utils = {

        updateMatrixWorldOfAncestors: function ( obj ) {

            var ancestors = [];
            for ( var a = obj; a !== null; a = a.parent) ancestors.push( a );
            for ( var a = ancestors.pop() ; a !== undefined ; a = ancestors.pop() ){
                a.matrix.compose( a.position, a.quaternion, a.scale );
                if ( a.parent === null) a.matrixWorld.copy ( a.matrix );
                if ( a.parent !== null) a.matrixWorld.multiplyMatrices( a.parent.matrixWorld, a.matrix );
            }

        },


        detach: function ( child ) {

            if (child.parent == null) return;
            utils.updateMatrixWorldOfAncestors( child );
            child.matrix.copy( child.matrixWorld );
            child.matrix.decompose( child.position, child.quaternion, child.scale );
            child.parent.remove( child )
        },


        attach: function ( child, parent ) {

            utils.updateMatrixWorldOfAncestors( child );
            utils.updateMatrixWorldOfAncestors( parent );
            child.matrix.getInverse( parent.matrixWorld ).multiply( child.matrixWorld  );
            child.matrix.decompose( child.position, child.quaternion, child.scale );
            parent.add( child )
        },


        removeObject : function ( obj ){

            console.log( obj.name )

            if ( obj.parent )
                obj.parent.remove( obj )

            if ( blocks.indexOf(obj) > -1 )
                blocks.splice( blocks.indexOf(obj), 1)

            if ( obj.$locked )
                obj.$locked.$locked = null

            // traversing an array while splicing the array makes bugs.
            for ( let i of obj.children.slice() )
                utils.removeObject( i )
        }


    }

                



    var do_intersect = function (){


        // find intersections
        raycaster.setFromCamera( mouse, camera );


        var showcase_and_its_blocks = []
        if (showcase){
            for( var i=0; i< showcase.$spots.length; i++)
                if ( showcase.$spots[i].children.length > 0)
                    showcase_and_its_blocks.push ( showcase.$spots[i].children[0] )
            showcase_and_its_blocks.push ( showcase)
        }

        var intersectable = blocks.concat( showcase_and_its_blocks )
        intersects = raycaster.intersectObjects( intersectable );
        // console.log(intersects)
        var aget = (arr, i) => (arr.length > i) ? arr[i] : null
        var intersects_haschanged = 
          aget(last_intersects, 0) != aget(intersects, 0)
        if ( intersects_haschanged )
        {
          if ( last_intersects.length > 0 )
          {
            // last_intersects[0].object.material.emissiveIntensity = 0 
            // last_intersects[0].object.material.needsUpdate = 1
          }
          if ( intersects.length > 0 ){
            // intersects[0].object.material.emissive.setHex( 0xffffff )
            // intersects[0].object.material.emissiveIntensity = 0.2
          }


        }


        last_intersects = intersects

    }



    var do_dragging = function(){

        raycaster.setFromCamera ( mouse, camera )
        raycaster.ray.recast(-3000)

        var drag_cur = raycaster.ray.intersectPlane( plane )

        var perspectiveRatio = 1
        if (camera.type == 'PerspectiveCamera'){
            perspectiveRatio =  1 - drag_obj.position.y / camera.position.y

            var intersect = raycaster.intersectObject( drag_obj ) 
            if (intersect.length >0)
                perspectiveRatio = 1 - intersect[0].point.y / camera.position.y
        }


        drag_obj.position.copy( drag_cur.sub(drag_start))
                .multiplyScalar( perspectiveRatio )
                .add( drag_pre_position )

    }



    var do_lockPointsCollision = function(){

        var lockPoints = blocks
            .filter( x => x!= drag_obj )
            .map( x => x.$lockPoints )
            .reduce( (a,b) => a.concat(b), [] )
            .filter( x => x.$direction == 'up' )


        for (let a of drag_obj.$lockPoints){
            a.$preparedToLock = null 
        }




        for (let a of drag_obj.$lockPoints){
            if ( a.$direction != 'down' )
                continue

            for(let b of lockPoints){
                if ( b.$locked )
                    continue

                if ( viewDistance(a,b) < 5.0 ){

                    if ( a.$preparedToLock == null || 
                         a.$preparedToLock.getWorldPosition().y < b.getWorldPosition().y 
                    )
                        a.$preparedToLock = b

                }

            }
        } 

    }

    var viewDistance = function(a,b){
       
        var n = new THREE.Vector3().copy( camera.position )
            .normalize()

        if( camera.type == 'PerspectiveCamera'){
            n = new THREE.Vector3().copy( camera.position )
                .sub( a.getWorldPosition() )
                .normalize()
        }

        var d = new THREE.Vector3()
            .subVectors( a.getWorldPosition(), b.getWorldPosition() ) 


        return Math.sqrt( d.lengthSq() - d.dot(n) * d.dot(n)  )

    }



    var do_drop = function(){


        drag_start = null
        // disable on top
        scene.add(drag_obj)
        drag_obj.position.y = 0
        if ( drag_obj.name == 'plate5x5'){
            drag_obj.position.x = Math.floor( (drag_obj.position.x)/10 )*10 +5
            drag_obj.position.z = Math.floor( (drag_obj.position.z)/10 )*10 +5 
        }

        // clear locking 
        for (let a of drag_obj.$lockPoints){
            
            if ( a.$locked != null){
                a.$locked.$locked = null
            }
            
        }

        var something_to_lock = drag_obj.$lockPoints
            .filter( x => x.$preparedToLock != null )


        if ( something_to_lock.length > 0 ){

            var lockthis = something_to_lock[0]

            // Two pillers with different height, lock the higher one
            for( let a of something_to_lock )
                if ( a.$preparedToLock.getWorldPosition().y 
                    >= lockthis.$preparedToLock.getWorldPosition().y){
                    lockthis = a
                }

            var almost_parent = lockthis.$preparedToLock.parent

            // avoid circular ancestorness 
            var autoAncestor = false
            almost_parent.traverseAncestors( function(x){
                if( x == drag_obj) autoAncestor = true 
            }) 

            if ( !autoAncestor )
            {

                for (let a of drag_obj.$lockPoints ){
                    a.$locked = null
                    if ( a.$preparedToLock != null )
                        if ( lockthis.getWorldPosition().y - a.getWorldPosition().y  < 2 )
                            a.$locked = a.$preparedToLock
                }

                drag_obj.position.copy( 
                    drag_obj.getWorldPosition()
                    .sub( lockthis.getWorldPosition() )
                    .add( lockthis.$locked.getWorldPosition() )
                )

                utils.attach(drag_obj, almost_parent )

            }

        }
    }


    var do_safety_check = function(){

        var disks = blocks.filter ( x => x.name == 'disk' )

        var lps = blocks
            .map ( x => x.$lockPoints )
            .reduce( (a,b) => a.concat(b), [] )

        var ups = lps.filter( x => x.$direction == 'up' )

        var downs = lps.filter( x => x.$direction == 'down' )

        for ( var i=0 ; i< ups.length; i++)
            ups[i].$tmp_wp = ups[i].getWorldPosition()

        for ( var i=0 ; i< downs.length; i++)
            downs[i].$tmp_wp = downs[i].getWorldPosition()

        for ( var i=0 ; i< downs.length; i++){
            downs[i].$tmp_gap = false
            downs[i].$tmp_lock = false
        }

        for ( var i=0 ; i< ups.length; i++){
            for ( var j=0; j<downs.length; j++){
                var u = ups[i]
                var d = downs[j]
                var s = nv().copy( d.$tmp_wp ).sub( u.$tmp_wp ) 
                if ( Math.abs( s.x ) + Math.abs( s.z) < 0.1  ){
                    if ( s.y > 1.7 && s.y < 1.8 * 3 + 0.1)
                        d.$tmp_gap = true
                    if ( s.y > -0.01 && s.y < 0.1 )
                        d.$tmp_lock = true
                }

            }
        }

        var gaps = downs.filter( x => x.$tmp_gap && ! x.$tmp_lock )

        _do_safety_check_report( gaps )



    }

    var _do_safety_check_report = function( gaps ){

        if ( gaps.length === 0 ) {
            dq( '#button-checkmark img' ).src = 'assets/dcheckmark.svg'
            dq( '#safety-warn' ).style.display = 'none'
        }
        else{
            dq( '#button-checkmark img' ).src = 'assets/warn.svg'
            dq( '#safety-warn' ).style.display = ''
        }



    }




    var addGrid = function(){
        var size = 150, step = 10;
        var geometry = new THREE.Geometry();
        for ( var i = - size; i <= size; i += step ) {
            geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
            geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );
            geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
            geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );
        }
        var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true } );
        var line = new THREE.LineSegments( geometry, material );
        scene.add( line );

    }


    var addBlocksToScene = function(){
        return new Promise( (res, rej) => {
            var box = models.get( 'box3x3' ).createBlock()
            box.position.set( 0,0,-50)
            scene.add(box)
            blocks.push( box)

            var plate = models.get( 'plate5x5' ).createBlock()
            scene.add(plate)
            blocks.push( plate )

            var cylinder = models.get( 'cylinder' ).createBlock()
            cylinder.position.set( -50,0,0)
            scene.add(cylinder)
            blocks.push( cylinder )


            res()
        })
    }



    var addShowcase = function(){
        return new Promise( (res,rej) => {


            var spotsize = 60
            var spot_num_x = 3
            var spot_num_z = 4
            var scale = 0.3

            var mesh = new THREE.Mesh( new THREE.BoxGeometry(1,1,1), new THREE.MeshPhongMaterial )
            mesh.name = 'showcase'
            mesh.scale.multiplyScalar( scale )
            mesh.geometry.scale( spot_num_x*spotsize, 0.1*spotsize, spot_num_z*spotsize )
            mesh.material.setValues( {
                color: 0xeeeeee

            })
            mesh.position.set( 0, 0,65)


            mesh.$spots = []

            for( var i = 0; i< models.length ; i++ ){
                var spot = new THREE.Object3D()
                var u = i%spot_num_z
                var v = Math.floor( i/spot_num_z )
                var offsetx = (spot_num_x-1)/2*spotsize
                var offsetz = (spot_num_z-1)/2*spotsize
                spot.position.set( v*spotsize - offsetx , 10 , u*spotsize - offsetz )
                mesh.add ( spot )
                mesh.$spots.push ( spot )

                var block = models[ i ].createBlock()
                spot.add( block )
                spot.name = 'showcase_spot'
            }

            mesh.$spots[0].scale.multiplyScalar(2.5)
            mesh.$spots[1].scale.multiplyScalar(2.5)
            mesh.$spots[2].scale.multiplyScalar(2.5)
            mesh.$spots[3].scale.multiplyScalar(3)

            mesh.$lockPoints = []
            scene.add ( mesh )

            showcase = mesh

            res()

        } )
    } 



    function animate() {
        requestAnimationFrame( animate );
        render();
        stats.update();
    }



    function render() {


        do_intersect()
        
        if ( drag_start ){

            do_dragging()
            do_lockPointsCollision()

        }

        renderer.clear();

        scene.add.apply( scene, lights )
        renderer.render( scene, camera );
        renderer.clearDepth();

        scene2.add.apply( scene2, lights )
        renderer.render( scene2, camera );

        if ( getImageData == true ){
            getImageData = false
            getImageData_download()
        }

    }