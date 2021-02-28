///// p5.js /////

function setup() {
  let canvas = createCanvas(400, 300);
  canvas.parent("container-p5");
  canvas.hide();

  initTHREE();
}

function draw() {
  noLoop();
}

///// three.js /////
// require AnaglyphEffect  from './libs/AnaglyphEffect.js';
let container, stats, gui, params;
let scene, camera, renderer;
let geometryLine;
let gravity = 0.1;
let time = 0;
let frame = 0;
let C_GRAVITY = 0.5;



function initTHREE() {

  // scene
  let textureBac = new THREE.TextureLoader().load( 'textures/background.jpg' );
  scene = new THREE.Scene();
  scene.background = textureBac
  // scene.fog = new THREE.FogExp2(255, 0.5);
  // camera (fov, ratio, near, far)
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.5,
    5000
  );
  camera.position.z = 10;

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor("#333333");
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // effect = new AnaglyphEffect( renderer );
	// effect.setSize( innerWidth, innerHeight );

  // container
  container = document.getElementById("container-three");
  container.appendChild(renderer.domElement);

  // controls
  let controls = new THREE.OrbitControls(camera, renderer.domElement);

  // gui
  // https://davidwalsh.name/dat-gui
  gui = new dat.gui.GUI();
  params = {
    number: 1,
    radius: 0.5,
    lifespan: 600
  };
  gui.add(params, "number", 1, 4).step(1);
  // gui
  //   .add(params, "speed")
  //   .min(1)
  //   .max(10)
  //   .step(1);
  gui.add(params, "radius", 0.5, 0.7).step(0.05);
  gui.add(params, "lifespan", 500, 700).step(50);
  // .listen()
  // .onChange(callback);

  // stats
  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  container.appendChild(stats.dom);

  setupScene();

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
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}



///////////////////////////////////////////////////////

let circle;

function setupScene() {

  p = new Swing(createVector(0,6,0),3)
  sg = new SphGroup()



}

function render() {

  p.run()

  if (p.isHighest()){
      print(p.aVel)
      print(p.aPVel)
      print(p.pos)
      for (let i = 0; i<params['number'];i++)
      {
        sg.add(p.pos.mult(i+1))
      }

  }
  sg.run()


  renderer.render(scene, camera);
}

function getCir() {
  let geometry = new THREE.TorusGeometry(0.8, 0.2,16,100);
  let material = new THREE.MeshNormalMaterial({
  wireframe: true,
});
  let mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function getLine(points) {
  let materialLine = new THREE.LineBasicMaterial( { color: 0xffffff } );
  geometryLine = new THREE.BufferGeometry().setFromPoints( points );
  let line = new THREE.Line( geometryLine, materialLine );

  return line;

}

function getSph() {

  // const loader = new THREE.CubeTextureLoader();
  // loader.setPath( 'textures/' );
  //
  // const textureCube = loader.load( [
  // 	'px.png', 'nx.png',
  // 	'py.png', 'ny.png',
  // 	'pz.png', 'nz.png'
  // ] );
  let textureCube = new THREE.TextureLoader().load( 'textures/sphere5.png' );
  let textureCube2 = new THREE.TextureLoader().load( 'textures/sphere3.jpg' );
  let textureCube3 = new THREE.TextureLoader().load( 'textures/sphere4.jpg' );
  let textureCube4 = new THREE.TextureLoader().load( 'textures/sphere6.jpg' );
  let textures = [textureCube,textureCube2,textureCube3,textureCube4]
  let geometry = new THREE.SphereGeometry( params['radius'], 32, 16 );
  let material = new THREE.MeshBasicMaterial( { color: 0xffffff, map: textures[Math.floor(random(0,4))], side: THREE.DoubleSide } );
  let mesh = new THREE.Mesh(geometry, material);

  return mesh;
}


class Swing{
  constructor(ori,r){
    this.ori = ori.copy();
    this.pos = createVector();
    this.r = r;
    this.angle = PI/3;
    this.damping = 0.999;

    this.aAcce = 0.0;
    this.aVel = 0.0;
    this.aPVel = 0.0;
    //
    this.rot = createVector();
    this.rotVel = createVector(
      random(-0.1, 0.1),
      random(-0.1, 0.1),
      random(-0.1, 0.1)
    );
    this.rotAcc = createVector();
    //
    this.mesh = getCir();
    scene.add(this.mesh);
    // let v1 = createVector(params['radius'],params['radius'],params['radius']);
    // let v2 = p5.Vector.sub(this.pos, v1);
    this.line = getLine([this.ori,this.pos]);
    this.geo = geometryLine;
    scene.add(this.line)
  }
  move(){
    this.aAcce = (-1 * gravity / (this.r *20)) * sin(-this.angle);
    this.aPVel = this.aVel;
    this.aVel += this.aAcce;
    this.aVel *= this.damping;
    this.angle += this.aVel;
    this.pos.set(this.r * sin(this.angle), this.r * cos(this.angle));
    this.pos.add(this.origin);
  }

  rotate() {
    this.rotVel.add(this.rotAcc);
    this.rot.add(this.rotVel);
    this.rotAcc.mult(0);
  }

  update(){

    this.mesh.position.x = this.pos.x;
    this.mesh.position.y = this.pos.y;
    this.mesh.position.z = this.pos.z;


    this.geo.setFromPoints( [this.ori,this.pos] )
    // //
    this.mesh.rotation.x = this.rot.x;
    this.mesh.rotation.y = this.rotVel.y;
    this.mesh.rotation.z = this.rotAcc.z;
  }


  isHighest(){

    return this.aVel * this.aPVel < 0 ;
  }

  run(){
    this.move();
    this.rotate();
    this.update();
  }

}



class Sphere{
  constructor(pos){
    this.pos = pos.copy();
    this.vel =  createVector(
      random(-0.01, 0.01),
      random(-0.01, 0.01),
      random(-0.01, 0.01)
    );
    this.acc = createVector(0, 0);
    this.mass = params['radius']/5;
    this.lifespan = params['lifespan'];
    // this.rad = this.mass * 5;

    //
    this.rot = createVector();
    this.rotVel = createVector(
      random(-0.01, 0.01),
      random(-0.01, 0.01),
      random(-0.01, 0.01)
    );
    this.rotAcc = createVector();
    //
    this.mesh = getSph();
    scene.add(this.mesh);

  }

  applyForce(f) {
    let force = f.copy();
    force.div(this.mass); // *** mass!! ***
    this.acc.add(force);
  }


  applyAttraction(other) {
    let distance = this.pos.dist(other.pos);
    let magnitude = (C_GRAVITY * this.mass * other.mass) / (distance * distance * distance * distance * distance * distance);
    let force = p5.Vector.sub(other.pos, this.pos);
    force.normalize();
    force.mult(magnitude);

    if (distance <params['radius']*4) {
      force.mult(-1); // to flip
      // force.mult(0.1); // to cut the strength
      if (force.mag()>10){
        force.mult(0.01)
      }
    }
    this.applyForce(force);
    this.acc.limit(2);

  }
  //
  checkEdges() {
    if (this.pos.x < -5 || this.pos.x > 5) {
      this.vel.x = -this.vel.x}
    if (this.pos.y < -5 || this.pos.y > 5) {
        this.vel.y = -this.vel.y}
    if (this.pos.z < -5 || this.pos.z > 5) {
          this.vel.z = -this.vel.z}
  //   if (this.pos.z < -5) {
  //     this.pos.z = 5;
  //   } else if (this.pos.x > 5) {
  //     this.pos.x = -5;
  //   }
  //   if (this.pos.y < -5) {
  //     this.pos.y = 5;
  //   } else if (this.pos.y > 5) {
  //     this.pos.y = -5;
  //   }
  //   if (this.pos.z < -5) {
  //     this.pos.z = 5;
  //   } else if (this.pos.z > 5) {
  //     this.pos.z = -5;
  //   }
  }

  move(){
    this.vel.add(this.acc); // vel = vel + acc;
    this.pos.add(this.vel); // pos = pos + vel;
    this.acc.mult(0); // acceleration has to be reset after being applied! ***
    //
    this.vel.limit(5);
    this.lifespan -= 1
  }

  rotate() {
    this.rotVel.add(this.rotAcc);
    this.rot.add(this.rotVel);
    this.rotAcc.mult(0);
  }

  update(){
    this.mesh.position.x = this.pos.x;
    this.mesh.position.y = this.pos.y;
    this.mesh.position.z = this.pos.z;
    //
    this.mesh.rotation.x = this.rot.x;
    this.mesh.rotation.y = this.rotVel.y;
    this.mesh.rotation.z = this.rotAcc.z;
  }


  isDead(){
    return this.lifespan < 0;
  }

  run(){
    this.move();
    this.checkEdges();
    this.rotate();
    this.update();
    // this.show();
  }

}


class SphGroup{
  constructor(){
    this.group = [];
  }

  add(pos){
    // this.origin = createVector(mouseX,mouseY,0);
    this.group.push(new Sphere(pos));
  }
  run(){
    for (let a = 0; a < this.group.length; a++) {
      let p = this.group[a];
      for (let b = 0; b < this.group.length; b++) {
        let q = this.group[b];
        if (a != b) {
          if(p.pos.dist(q.pos) > 1){
            this.group[a].applyAttraction(this.group[b]);
          }

        }
      }

      p.run();
      if ( p.isDead()) {
        this.group.splice(a,1)
        scene.remove(p.mesh)
      }
  }
}



}

/* global
THREE p5 ml5 Stats dat alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera ADD CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult
*/
