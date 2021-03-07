///// p5.js /////

function setup() {
  let canvas = createCanvas(400, 300);
  canvas.parent("container-p5");
  canvas.hide();
  background(50);

  initTHREE();
}

function draw() {
  noLoop();
}

///// three.js /////

let container, stats, gui, params;
let scene, camera, renderer;

const SEPARATION = 150, AMOUNTX = 40, AMOUNTY = 40;

let count = 0, frame = 0;
let positions,scales;
let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;


function initTHREE() {
  // scene
  scene = new THREE.Scene();

  // camera (fov, ratio, near, far)
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = 1000;

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor("#0a0017");
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // container
  container = document.getElementById("container-three");
  container.appendChild(renderer.domElement);
  container.addEventListener( 'pointermove', onPointerMove );

  // ambiLight
  const ambiLight = new THREE.AmbientLight( 0xffffff,0.7 );
  scene.add( ambiLight );

  // plane
  plane = getPlane();
  plane.position.y = -100;
  plane.rotation.x = PI / 2;
  scene.add(plane);

  // controls
  let controls = new THREE.OrbitControls(camera, renderer.domElement);

  // gui
  // https://davidwalsh.name/dat-gui
  gui = new dat.gui.GUI();
  params = {
    intensity: 1,
    speed: 0.3,
    near: 1,
    far: 5000,
  };
  gui.add(params, "intensity", 0.1, 2).step(0.1);
  gui.add(params, "speed")
    .min(0.1)
    .max(0.5)
    .step(0.1);
  gui.add(params, "near", 1, 500).step(100);
  gui.add(params, "far", 1, 10000).step(100);
  // .listen()
  // .onChange(callback);

  // stats
  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  container.appendChild(stats.dom);


  //fog
  scene.fog = new THREE.Fog('#0a0017', params['near'], params['far']);
  setupScene();


//


  // let's draw!
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  stats.update();
  time = performance.now();
  frame++;

  render();
}

// event listeners
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}



///////////////////////////////////////////////////////

let circle,sGroup;
let pLight = [];
let numLights = AMOUNTX/4;

function setupScene() {
  const numParticles = AMOUNTX * AMOUNTY;

  positions = new Float32Array( numParticles * 3 );
  scales = new Float32Array( numParticles );


  let i = 0, j = 0;

  for ( let ix = 0; ix < AMOUNTX; ix ++ ) {
    for ( let iy = 0; iy < AMOUNTY; iy ++ ) {

  						positions[ i ] = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ); // x
  						positions[ i + 1 ] = 0; // y
  						positions[ i + 2 ] = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 ); // z

  						scales[ j ] = 1;

  						i += 3;
  						j ++;

  					}

  				}

  sGroup = new SphGroup();
  for (let i = 0; i < numParticles; i ++){
    sGroup.add()
  }

  //pointLights
  for (let i = 0; i < numLights; i++){
    pLight.push(new PointLight())
    let x;
    if (i < numLights / 2){
      x = -(windowHalfX * 10 / numLights * i + 20)
      pLight[i].setPosition(x,10,0)
    }
    else{
      x = windowHalfX * 10 / numLights * (i-3) + 20
      pLight[i].setPosition(x,10,0)
    }
    if ( i % 2 == 0 ){
      pLight[i].setVelocity(0,0,-2)
    }
    else{
      pLight[i].setVelocity(0,0,2)
    }

  }



}
//

function render() {

  camera.position.x += ( mouseX - camera.position.x ) * .05;
	camera.position.y += ( - mouseY - camera.position.y ) * .05;
	camera.lookAt( scene.position );


  let i = 0, j = 0;

  for ( let ix = 0; ix < AMOUNTX; ix ++ ) {

  	for ( let iy = 0; iy < AMOUNTY; iy ++ ) {

  		positions[ i + 1 ] = ( Math.sin( ( ix + count ) * params['speed'] ) * 60 ) +
  						( Math.sin( ( iy + count ) * (params['speed'] + 0.2)) * 60 );

  		scales[ j ] = ( Math.sin( ( ix + count ) * params['speed'] ) + 1 ) * 20 +
  						( Math.sin( ( iy + count ) * (params['speed'] + 0.2) ) + 1 ) * 20;

  		i += 3;
  		j ++;

  	}

  }

  sGroup.run(positions,scales);
  for (let i = 0; i < numLights; i++){
    pLight[i].setPositionY(2*(( Math.sin( ( i + count ) * params['speed'] ) * 60 ) +
            ( Math.sin( ( i + count ) * (params['speed'] + 0.2) ) * 60 )))
    print(pLight[i].pos.y)
    pLight[i].intensity = params['intensity']
    pLight[i].run()
    if (pLight[i].isOut()){
      pLight[i].reverseZ();

    }
    if (pLight[i].pos.y > 200){
      if (i == 0 || i == 5){
        pLight[i].light.color = new THREE.Color(0xff0000)
      }
      if (i == 1 || i == 6){
        pLight[i].light.color = new THREE.Color(0xff8c00)
      }
      if (i == 2 || i == 7){
        pLight[i].light.color = new THREE.Color(0xff00f2)
      }
      if (i == 3 || i == 8){
        pLight[i].light.color = new THREE.Color(0x00f7ff)
      }
      if (i == 4 || i == 9){
        pLight[i].light.color = new THREE.Color(0xffffff)
      }
      // print(  pLight[i].light.color)
    }
    if (pLight[i].pos.y < -200){
      if (i == 0 || i == 5){
        pLight[i].light.color = new THREE.Color(0xffffff)
      }
      if (i == 1 || i == 6){
        pLight[i].light.color = new THREE.Color(0x00f7ff)
      }
      if (i == 2 || i == 7){
        pLight[i].light.color = new THREE.Color(0xff00f2)
      }
      if (i == 3 || i == 8){
        pLight[i].light.color = new THREE.Color(0xff8c00)
      }
      if (i == 4 || i == 9){
        pLight[i].light.color = new THREE.Color(0xff0000)
      }
    }
    // if (pLight[i].pos.y < -50){
    //   pLight[i].light.color = new THREE.Color(0x4dff00)
    //   // print(  pLight[i].light.color)
    // }

    }


  renderer.render(scene, camera);
  count += 0.1
}

function onPointerMove( event ) {

  		if ( event.isPrimary === false ) return;

  		mouseX = event.clientX - windowHalfX;
  		mouseY = event.clientY - windowHalfY;

}


function getSphere(){
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: 0xd1b0ff
  });
  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function getLight() {
  const light = new THREE.PointLight( 0xffff00, params['intensity'], 1000);
  light.castShadow = true; // default false

  const pointLightHelper = new THREE.PointLightHelper( light, 10 ); // sphere size
  scene.add( pointLightHelper );

  //Set up shadow properties for the light
  light.shadow.mapSize.width = 512; // default
  light.shadow.mapSize.height = 512; // default

  // This works with PointLight!
  light.shadow.camera.near = 0.5; // default
  light.shadow.camera.far = 700; // default
  light.shadow.camera.fov = 40;
  // const helper = new THREE.CameraHelper( light.shadow.camera );
  // scene.add( helper );

  return light;
}

function getPlane() {
  const geometry = new THREE.PlaneGeometry(
    windowHalfX * 10,
    windowHalfY * 12,
    32
  );
  const material = new THREE.MeshPhongMaterial({
    color: 0x2f0170,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  //mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

class PointLight {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();
    this.scl = createVector(1, 1, 1);
    //
    this.mass = this.scl.x * this.scl.y * this.scl.z;
    //
    this.rot = createVector();
    this.rotVel = createVector();
    this.rotAcc = createVector();
    //
    this.mesh = getSphere();
    this.light = getLight();
    //
    this.group = new THREE.Group();
    this.group.add(this.mesh);
    this.group.add(this.light);

    scene.add(this.group);
  }
  setPosition(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  setPositionY(y){
    this.pos.y = y;
    return this;
  }
  setVelocity(x, y, z) {
    this.vel = createVector(x, y, z);
    return this;
  }
  setRotationAngle(x, y, z) {
    this.rot = createVector(x, y, z);
    return this;
  }
  setRotationVelocity(x, y, z) {
    this.rotVel = createVector(x, y, z);
    return this;
  }
  setScale(w, h, d) {
    h = h === undefined ? w : h;
    d = d === undefined ? w : d;
    const minScale = 0.01;
    if (w < minScale) w = minScale;
    if (h < minScale) h = minScale;
    if (d < minScale) d = minScale;
    this.scl = createVector(w, h, d);
    this.mass = this.scl.x * this.scl.y * this.scl.z;
    return this;
  }
  setTranslation(x, y, z) {
    this.mesh.geometry.translate(x, y, z);
    return this;
  }
  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  rotate() {
    this.rotVel.add(this.rotAcc);
    this.rot.add(this.rotVel);
    this.rotAcc.mult(0);
  }
  applyForce(f) {
    let force = f.copy();
    force.div(this.mass);
    this.acc.add(force);
  }
  update() {
    this.group.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.group.rotation.set(this.rot.x, this.rot.y, this.rot.z);
    this.group.scale.set(this.scl.x, this.scl.y, this.scl.z);
  }
  isOut(){
    return this.pos.z > windowHalfY * 6 || this.pos.z < -windowHalfY * 6
  }
  reverseZ(){
    this.vel.z = -this.vel.z
  }
  run(){
    this.move();
    this.rotate();
    this.update();
  }
}



class Sphere{
  constructor(){
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();
    this.scl = createVector(1, 1, 1);
    //
    this.rot = createVector();
    this.rotVel = createVector();
    this.rotAcc = createVector();
    //
    this.mesh = getSphere();
    scene.add(this.mesh);
    //

  }
  setPosition(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  setVelocity(x, y, z) {
    this.vel = createVector(x, y, z);
    return this;
  }
  setRotationAngle(x, y, z) {
    this.rot = createVector(x, y, z);
    return this;
  }
  setRotationVelocity(x, y, z) {
    this.rotVel = createVector(x, y, z);
    return this;
  }
  setScale(w, h, d) {
    h = h === undefined ? w : h;
    d = d === undefined ? w : d;
    const minScale = 0.01;
    if (w < minScale) w = minScale;
    if (h < minScale) h = minScale;
    if (d < minScale) d = minScale;
    this.scl = createVector(w, h, d);
    this.mass = this.scl.x * this.scl.y * this.scl.z;
    return this;
  }
  setTranslation(x, y, z) {
    this.mesh.geometry.translate(x, y, z);
    return this;
  }
  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  rotate() {
    this.rotVel.add(this.rotAcc);
    this.rot.add(this.rotVel);
    this.rotAcc.mult(0);
  }
  applyForce(f) {
    let force = f.copy();
    force.div(this.mass);
    this.acc.add(force);
  }
  update() {
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.rotation.set(this.rot.x, this.rot.y, this.rot.z);
    this.mesh.scale.set(this.scl.x, this.scl.y, this.scl.z);
  }
  run(){
    this.move();
    this.rotate();
    this.update()
  }

}


class SphGroup{
  constructor(){
    this.group = []
  }
  add(){
    this.group.push(new Sphere(this.origin))
  }
  run(positions,scales){
    for (let i = this.group.length-1; i>=0; i--){
      let p = this.group[i];
      let q = this.group.length - 1 - i;
      p.setPosition(positions[3*q],positions[3*q+1],positions[3*q+2]);
      p.setScale(scales[q]);
      p.run();
      // if (p.isDead()) {
      //   this.group.splice(i,1)
      //   scene.remove(p.mesh)
      // }
      }
    }

}
/* global
THREE p5 ml5 Stats dat alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera ADD CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult
*/
