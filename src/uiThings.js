
    
    var dq =  x => document.querySelector(x)

    var getImageData_download = function(){
        imgData = renderer.domElement.toDataURL()


        var a = document.createElement('a')
        a.href = imgData
        a.download = 'micha-cattree'
        dq('#snapshot-download-links') .appendChild( a )
        a.click()
       

    }

    var generateShareCode = function(){
        var result = blocks
            .map ( (x,i,a) => 
                ({
                    name : x.name,
                    parent: a.indexOf( x.parent ) != -1 ? a.indexOf( x.parent ) : 'SCENE',
                    matrix : x.matrix
                })
            )

        result = LZString.compressToBase64( JSON.stringify( result )  )
        // console.log( LZString.decompressFromBase64(result) )

        return result

    }

    
    window.generateShareCode = generateShareCode


    var decodeShareCode = function( code ){

        try{
            var bks = LZString.decompressFromBase64( code )
            bks = JSON.parse( bks )
        }
        catch(e){}
    }



    var detectWebgl = function () {

        try {
            
            var scene = new THREE.Scene(); 
            var geometry = new THREE.BoxGeometry( 1, 1, 1 );
            var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
            var cube = new THREE.Mesh( geometry, material );
            scene.add( cube );
            
            var renderer = new THREE.WebGLRenderer();
            renderer.render(
                scene, 
                new THREE.PerspectiveCamera( 75, 1, 1, 10000 )
            )
            
            return true

        } 
        catch ( e ) {
            console.error( e )

            return false;
        }

    } 


    var showUnsupported = function(){
        document.querySelector('#webgl-unsupported').style.visibility = 'visible';
    }


    var showLoading = function(){

    }


    var showUi = function() {
        return Promise.resolve()
    }


    var do_updateSummary = function(){
        var sum = document.querySelector('#summary')
        var count = blocks.reduce( function( a, x) {
            if ( a[x.name] )
                a[x.name] += 1
            else
                a[x.name ] = 1
            return a
        }, {})


        var dict = {
            'castle': 'W502',
            'box3x3': 'W504',
            'box4x3':'W501',
            'plate5x5':'W101',
            'plate5x3' :'W202',
            'plate3x3':'W201',
            'cylinder':'W901',
            'cylinder_wired':'W902',
            'cylinder_half':'W904',
            'disk':'W903',
            'bed':'W503',
            'foodtable':'J002',
            
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


        var text = ''
        for( let key in count )
            text += (dict[key] || key) + ' : ' + count[key] + '<br>' 

        sum.innerHTML = text

    }



    function onUiClick(e){

        console.log( e.target.id )


        if ( e.target.id == 'ui_delete'){
            e.target.classList.toggle( 'flagged' )
            mode = e.target.classList.contains('flagged') ? 'delete' : 'default'
        }

        if ( e.target.id == 'button-info' ){

            dq('#modal-info').classList.add('reveal')
            dq('#modal-checkmark').classList.remove('reveal')


            dq('#modal-info').style.visibility = 'visible'
            dq('#modal-checkmark').style.visibility = 'hidden'


            dq('#header-bar-goback').classList.add('reveal')
            dq('#header-bar').classList.remove('reveal')

            dq('#header-bar-goback').style.visibility = 'visible'
            dq('#header-bar').style.visibility = 'hidden'
        }

        if ( e.target.id == 'button-checkmark' ){

            dq('#modal-info').classList.remove('reveal')
            dq('#modal-checkmark').classList.add('reveal')

            dq('#modal-info').style.visibility = 'hidden'
            dq('#modal-checkmark').style.visibility = 'visible'
            

            dq('#header-bar-goback').classList.add('reveal')
            dq('#header-bar').classList.remove('reveal')

            dq('#header-bar-goback').style.visibility = 'visible'
            dq('#header-bar').style.visibility = 'hidden'


            dq('#footer').style.visibility = 'visible'


            do_updateSummary()

        }

        if ( e.target.id == 'button-goback' ){



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



        if ( e.target.id == 'snapshot' ){
            e.preventDefault()
            getImageData = true
        }


        if ( e.target.id == 'button-delete' ){
            if ( drag_obj && drag_obj != showcase )
                utils.removeObject( drag_obj )

        }


        if ( e.target.id == 'button-rotate-clockwise' ){
            if ( drag_obj )
                drag_obj.rotation.y -= 3.1415926 / 2
        }

        if ( e.target.id == 'button-rotate-anticlock' ){
            if ( drag_obj )
                drag_obj.rotation.y += 3.1415926 / 2
        }


    }


    var reveal_hide_SelectedModeUI = function( hide ){

        var buttons = 
        [   dq( '#button-delete' ), 
            dq( '#button-rotate-clockwise' ), 
            dq( '#button-rotate-anticlock')
        ]

        for (let i of buttons)
            i.style.display =  hide ? 'none' : '' 

    }


    function onUiSharecodeMousedown(e){
        e.preventDefault()
        e.target.focus()
        e.target.select()

    }


