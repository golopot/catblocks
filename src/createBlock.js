

THREE.BufferGeometry.prototype.merge = function ( geometry, offset ) {

        if ( geometry instanceof THREE.BufferGeometry === false ) {

            console.error( 'THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.', geometry );
            return;

        }

        if ( offset === undefined ) offset = 0;

        for ( var key in this.attributes ) {

            var attribute1 = this.attributes[ key ];
            var array1 = attribute1.array;

            var attribute2 = geometry.attributes[ key ];
            var array2 = attribute2.array;

            attribute1.array = new Float32Array( array1.length + array2.length)

            for ( var i = 0; i < array1.length; i++ )
                attribute1.array[ i ] = array1[ i ];

            for ( var i = 0; i < array2.length; i++ )
                attribute1.array[ i + array1.length ] = array2[ i ];


        }

    }


var createLockpoints = function( points ){
	return points.map( _createLockPoint )
}


var _createLockPoint = function(a){
	var geometry = new THREE.IcosahedronGeometry(1.0)
	var point =  new THREE.Mesh( geometry, new THREE.MeshStandardMaterial())
	point.position.fromArray(a.position)
	point.material.setValues({
		color: 0xff0000,	emissiveIntensity: 0.2,  shading: THREE.SmoothShading,
	})

	// dollar sign means user-defined properties
	Object.assign( point, {
		$direction : a.direction,
		$projPositionCache : new THREE.Vector3(),
		$locked: null,
		$preparedToLock : null,
        visible: false,
        // visible: true,
	})

    return point
}


var fl = Math.floor
var lockPoints = {
	box3x3 : []
        .concat(
            Array.from({length: 9})
                .map( (x,i) => [ (i%3-1)*10 , 30 ,  ( fl(i/3)-1 )*10 ] )
                .map( x => ({direction: 'up', position: x}) )
        )
        .concat(
            Array.from({length: 9})
                .map( (x,i) => [ (i%3-1)*10 , 0 ,  ( fl(i/3)-1 )*10 ] )
                .map( x => ({direction: 'down', position: x}) )
        )
	,

    plate3x3: []
        .concat(
            Array.from({length: 9})
                .map( (x,i) => [ (i%3-1)*10 , 1.8 ,  ( fl(i/3)-1 )*10 ] )
                .map( x => ({direction: 'up', position: x}) )
        )
        .concat(
            Array.from({length: 9})
                .map( (x,i) => [ (i%3-1)*10 , 0 ,  ( fl(i/3)-1 )*10 ] )
                .map( x => ({direction: 'down', position: x}) )
        )
    ,
    plate5x3: []
        .concat(
            Array.from({length: 15})
                .map( (x,i) => [ (i%5-2)*10 , 1.8 ,  ( fl(i/5)-1 )*10 ] )
                .map( x => ({direction: 'up', position: x}) )
        )
        .concat(
            Array.from({length: 15})
                .map( (x,i) => [ (i%5-2)*10 , 0 , ( fl(i/5)-1 )*10 ] )
                .map( x => ({direction: 'down', position: x}) )
        )
    ,
    plate5x5: []
        .concat(
            Array.from({length: 25})
                .map( (x,i) => [ (i%5-2)*10 , 3.6 ,  ( fl(i/5)-2 )*10 ] )
                .map( x => ({direction: 'up', position: x})  )
        )
        .concat(
            Array.from({length: 25})
                .map( (x,i) => [ (i%5-2)*10 , 0.0 ,  ( fl(i/5)-2 )*10 ] )
                .map( x => ({direction: 'down', position: x}) )
        )

    ,
    cylinder: 
        [
            {direction: 'up', position: [0,30,0]},
            {direction: 'down', position: [0,0,0]}
        ]
    ,    
    cylinder_wired: 
        [
            {direction: 'up', position: [0,30,0]},
            {direction: 'down', position: [0,0,0]}
        ]
    ,    
    cylinder_half: 
        [
            {direction: 'up', position: [0,13.2,0]},
            {direction: 'down', position: [0,0,0]}
        ]
    ,    
    disk: 
        [
            {direction: 'up', position: [0,1.8,0]},
            {direction: 'down', position: [0,0,0]}
        ]
    ,
    bed: []
        .concat(
            Array.from({length: 8})
                .map( (x,i) => [ (i%4)*10 -15 , 1.8 ,  ( fl(i/4) )*10 - 5 ] )
                .map( x => ({direction: 'up', position: x})  )
        )
        .concat(
            Array.from({length: 8})
                .map( (x,i) => [ (i%4)*10 -15 ,  0  ,  ( fl(i/4 ) )*10 -5 ] )
                .map( x => ({direction: 'down', position: x}) )
        )
    ,
    box4x3: []
        .concat(
            Array.from({length: 12})
                .map( (x,i) => [ (i%4)*10 -15 , 30 ,  ( fl(i/4) )*10 - 10 ] )
                .map( x => ({direction: 'up', position: x})  )
        )
        .concat(
            Array.from({length: 12})
                .map( (x,i) => [ (i%4)*10 -15 ,  0  ,  ( fl(i/4 ) )*10 -10 ] )
                .map( x => ({direction: 'down', position: x}) )
        )
    ,
    castle: []
        .concat(
            Array.from({length: 12})
                .map( (x,i) => [ (i%4)*10 -15 , 30 ,  ( fl(i/4) )*10 - 10 ] )
                .map( x => ({direction: 'up', position: x})  )
        )
        .concat(
            Array.from({length: 12})
                .map( (x,i) => [ (i%4)*10 -15 ,  0  ,  ( fl(i/4 ) )*10 -10 ] )
                .map( x => ({direction: 'down', position: x}) )
        )
    ,
    foodtable: 
        [
            {direction: 'down', position: [5,0,5]},
            {direction: 'down', position: [5,0,-5]},
            {direction: 'down', position: [-5,0,5]},
            {direction: 'down', position: [-5,0,-5]},
        ]
}



var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        // console.log( item, loaded, total );
};

var loadero = new THREE.OBJLoader( manager )
var loadert = new THREE.TextureLoader( manager )


function Model(name, geometry_path, texture_path){
    this.name = name 
    this.geometry_path = geometry_path
    this.texture_path = texture_path
    this.geometry = null
    this.texture = null
    this.lockPoints = null
}

Model.prototype.createBlock = function(){

    var mesh = new THREE.Mesh( this.geometry, new THREE.MeshPhongMaterial())
    

    mesh.material.setValues(
    {
      color: 0x51D0FF,
      // color: 0xffffff,
      emissiveIntensity: 0,
      // specular: 0x2F4AC5,
      shininess: 0,
      // shading: THREE.SmoothShading,
      // transparent: true,
        opacity: 1.0
    })

    if ( this.texture != null ){
        mesh.material.setValues( { 
            map : this.texture, color: 0xffffff } )
    }


    mesh.name = this.name


    mesh.$lockPoints = createLockpoints( this.lockPoints )

    for( let x of mesh.$lockPoints )  mesh.add(x)


    mesh.$isBlock = true

    return mesh


}


Model.prototype.loadGeometry = function(){
    var that = this

    return new Promise( (res, rej) => {

        loadero.load( this.geometry_path, function( obj ){

                var geometry = obj.children[0].geometry
                geometry.scale(10,10,10)

                for ( var i=1; i< obj.children.length; i++){
                    obj.children[i].geometry.scale(10,10,10)
                    geometry.merge( obj.children[i].geometry )
                }

                that.geometry = geometry
                res()
            }, 
            () => {},
            () => {rej()}
        )
    })
}


Model.prototype.loadTexture = function(){

        if (this.texture_path == '' )
            return Promise.resolve()

        return new Promise( (res, rej) => {

                loadert.load( this.texture_path , texture => {
                        this.texture  = texture
                        res()
                    },
                    () => {},
                    () => {console.warn('texture loading failure.');res()}
                )
        } )
}





var setLockPoints = function(){

    for( let model of models ){
        model.lockPoints = lockPoints[model.name]
    }

}


var loadGeometries = function(){

    var foo = models.map( x => x.loadGeometry() )

    return Promise.all( foo ).catch( e => {
        console.error( 'loadGeometries failed, do something.' )
    })

} 


var loadTextures = function(){

    var foo = models.map( x => x.loadTexture() )

    return Promise.all( foo ).catch( e => {
        console.error( 'loadTextures failed, do something.' )
    })

}


var models = [
    [ 'cylinder', 'assets/cylinder.obj', 'assets/wood3.jpg'],
    [ 'cylinder_wired', 'assets/cylinder_wired.obj', 'assets/hemp.jpg'],
    [ 'cylinder_half', 'assets/cylinder_half.obj', 'assets/wood3.jpg'],
    [ 'disk', 'assets/disk.obj', 'assets/wood3.jpg'],
    [ 'castle', 'assets/castle.obj', 'assets/wood3.jpg'],
    [ 'box3x3', 'assets/box3x3.obj', 'assets/wood3.jpg'],
    [ 'box4x3', 'assets/box4x3.obj', 'assets/wood3.jpg'],
    [ 'foodtable', 'assets/foodtable.obj', 'assets/wood3.jpg'],
    [ 'bed', 'assets/bed.obj', 'assets/wood3.jpg'],
    [ 'plate5x5', 'assets/plate5x5.obj', 'assets/wood3.jpg'],
    [ 'plate5x3', 'assets/plate5x3.obj', 'assets/wood3.jpg'],
    [ 'plate3x3', 'assets/plate3x3.obj', 'assets/wood3.jpg'],



].map(  x => new Model( x[0], x[1], x[2] )  )


models.get = function ( name ){
    for( var i=0; i< models.length; i++)
        if ( models[i].name == name )
            return models[i]

    console.error('not found' )
} 


var models_init = function(){

    setLockPoints()

}



models_init()


window.models = models