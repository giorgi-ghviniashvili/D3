let camera, scene, renderer;
let width = window.innerWidth,
    height = window.innerHeight;
let objects = [],
    targets = [];

function initScene () {
    camera = new THREE.PerspectiveCamera( 40, width / height, 0.1, 10000 );
    camera.position.z = 3200;
    scene = new THREE.Scene();

    renderer = new THREE.CSS3DRenderer({ alpha: true });
    renderer.setSize(width, height);

    document.body.appendChild( renderer.domElement );
}

function initTiles (n) {

    for(let i = 0; i < n; i++) {
        var element = document.createElement( 'div' );
        element.setAttribute('data-index', i)
        element.className = 'element';
        element.style.backgroundColor = 'rgba(233, 237, 239)';

        var icon = document.createElement('i')
        icon.classList.add('fa')
        icon.classList.add(`fa-${Math.random() > 0.5 ? '' : 'fe'}male`)
        element.appendChild( icon )

        var object = new THREE.CSS3DObject( element );
        object.position.x = Math.random() * 4000 - 2000;
        object.position.y = Math.random() * 4000 - 2000;
        object.position.z = Math.random() * 4000 - 2000;
        scene.add( object );

        objects.push( object );

        var object = new THREE.Object3D();
        object.position.x = ( (i % 15) * 140 ) - 2135;
        object.position.y = - ( Math.floor( i / 15 ) * 180 ) + 990;

        targets.push( object );
    }

    transform( 2000 );

}

function transform( duration ) {

    TWEEN.removeAll();

    for ( var i = 0; i < objects.length; i ++ ) {

        var object = objects[ i ];
        var target = targets[ i ];

        new TWEEN.Tween( object.position )
            .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        new TWEEN.Tween( object.rotation )
            .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

    }

    new TWEEN.Tween( this )
        .to( {}, duration * 2 )
        .onUpdate( render )
        .start();

}

function animate () {
    requestAnimationFrame( animate );

    TWEEN.update();
}

function render () {
    renderer.render( scene, camera );
}

initScene();
animate();
initTiles(180)