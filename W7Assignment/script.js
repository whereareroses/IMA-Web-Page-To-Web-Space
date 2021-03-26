///// p5.js /////
let rainSound, fogSound, endSound;
function preload(){
  rainSound = loadSound('media/sound/rainSound.mp3');
  fogSound = loadSound('media/sound/fogSound.mp3')
  endSound = loadSound('media/sound/endSound.wav')
}
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

let container, stats, gui, params, effectController;
let scene, camera, renderer;


let frame = 0;
let positions,scales;
let plane;
let mouseX = 0, mouseY = 0;
let dlight,ambiLight;

let terrainWidth = 500;
let terrainDepth = 500;
let depth = 7500;
let heightData = null;
let clock, controls, currentTime = 0;
let bird;

let lightningStrike, lightningMaterial, lightningColor, rayParams;
let lightningStrikeMesh, storm;
const vec1 = new THREE.Vector3();
const vec2 = new THREE.Vector3();
const outlineMeshArray = [];

//rain
let rainCount = 4000;
let rain, rainGeo;
let rainVertices = [];
let booleanRain = true;


//cloud
let cloudParticles = [];
let booleanCloud = true;
let cloudGeo, cloudMaterial;

//sunny
let booleanSunny = true;
let dlight2;
let planeA, aMaterial;




let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;


function hide(){
  document.getElementById("text").style.visibility = "hidden";
}

function initTHREE() {
  // fogSound.play();
  fogSound.loop();
  // scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xcfcfcf);
  scene.fog = new THREE.FogExp2(0xcfcfcf, 0);

  // camera (fov, ratio, near, far)
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );

  camera.position.set( 0, 200, depth/2 -100);
  // camera.position.set( 0, 100, -depth/4);
	camera.lookAt(0 ,210, - depth/2);

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor("#0a0017");
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // container
  container = document.getElementById("container-three");
  container.appendChild(renderer.domElement);
  container.addEventListener( 'pointermove', onPointerMove );

  // controls
  clock = new THREE.Clock();
  controls = new THREE.FirstPersonControls( camera, renderer.domElement );
	controls.movementSpeed = 150;
	controls.lookSpeed = 0.1;

  // ambiLight
  ambiLight = new THREE.AmbientLight( 0xffffff,0.7 );
  scene.add( ambiLight );

  //directional light
  dlight = new THREE.DirectionalLight(0xffffff, 0.5);
  dlight.position.set(0, 250, 0);
  dlight.castShadow = true;
  var d = 500;
  dlight.shadow.camera.left = -d;
  dlight.shadow.camera.right = d;
  dlight.shadow.camera.bottom = -d;

  dlight.shadow.camera.near = 2;
  dlight.shadow.camera.far = 500;

  dlight.shadow.mapSize.x = 1024;
  dlight.shadow.mapSize.y = 1024;
  scene.add(dlight);

  //hemilight
  let hemiLight = new THREE.HemisphereLight( 0xd9d9d9, 0xb3b3b3, 0.1 );
  scene.add(hemiLight);

  // plane
  heightData = generateHeight(terrainWidth, terrainDepth)
  let pGeo = new THREE.PlaneBufferGeometry(depth,depth,terrainWidth-1,terrainDepth-1);
  pGeo.rotateX(-Math.PI / 2);
  let vertices = pGeo.attributes.position.array;
  for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
       vertices[j + 1] = heightData[i]*10;
   }
  pGeo.computeVertexNormals();
  const pTexture = new THREE.TextureLoader().load( 'media/img/mountain.jpg' );
  let pMat = new THREE.MeshPhongMaterial({ color: 0xC7C7C7,
    map: pTexture  })
  terrainMesh = new THREE.Mesh(pGeo, pMat);
  terrainMesh.receiveShadow = true;
  terrainMesh.castShadow = true;
  scene.add(terrainMesh);



  //bird
  const loader = new THREE.OBJLoader();
  loader.load(
    'media/bird.obj',
    function (  object ) {
    object.scale.set(0.1, 0.03, 0.03);
    object.position.set(controls.mouseX, controls.mouseY, -10);
    object.rotation.y = 1.5;
    object.castShadow = true;
    bird = object;
    print(bird)
		scene.add(  bird );

	},
  function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},

	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	})






//storm
// lightningColor = new THREE.Color( 0xB0FFFF );
// let outlineColor = new THREE.Color( 0x00FFFF );
// lightningMaterial = new THREE.MeshBasicMaterial( { color: lightningColor } );
// const rayDirection = new THREE.Vector3( 0, - 1, 0 );
// let rayLength = 0;
//
//
// rayParams = {
//       sourceOffset: new THREE.Vector3(0,300,0),
//   		destOffset: new THREE.Vector3(),
//
// 			radius0: 1,
// 			radius1: 0.5,
// 			minRadius: 0.3,
// 			maxIterations: 7,
//
// 			timeScale: 0.15,
// 			propagationTimeFactor: 0.2,
// 			vanishingTimeFactor: 0.9,
// 			subrayPeriod: 4,
// 			subrayDutyCycle: 0.6,
//
// 			maxSubrayRecursion: 3,
// 			ramification: 3,
// 			recursionProbability: 0.4,
//
// 			roughness: 0.85,
// 			straightness: 0.65,
//
// 			onSubrayCreation: function ( segment, parentSubray, childSubray, lightningStrike ) {
//
// 				lightningStrike.subrayConePosition( segment, parentSubray, childSubray, 0.6, 0.6, 0.5 );
//
// 				// Plane projection
//
// 				rayLength = lightningStrike.rayParameters.sourceOffset.y;
// 				vec1.subVectors( childSubray.pos1, lightningStrike.rayParameters.sourceOffset );
// 				const proj = rayDirection.dot( vec1 );
// 				vec2.copy( rayDirection ).multiplyScalar( proj );
// 				vec1.sub( vec2 );
// 				const scale = proj / rayLength > 0.5 ? rayLength / proj : 1;
// 				vec2.multiplyScalar( scale );
// 				vec1.add( vec2 );
// 				childSubray.pos1.addVectors( vec1, lightningStrike.rayParameters.sourceOffset );
//
// 			}
//
// 		};

// lightningStrike = new THREE.LightningStrike( rayParams );
// // // lightningStrike.sourceOffset = (0,600,0);
// // // lightningStrike.destOffset = (0,0,0);
// lightningStrikeMesh = new THREE.Mesh( lightningStrike, lightningMaterial );

// scene.add(lightningStrikeMesh)
// storm = new THREE.LightningStorm( {
//
// 					size: 100,
// 					minHeight: 90,
// 					maxHeight: 300,
// 					maxSlope: 0.6,
// 					maxLightnings: 8,
//
// 					lightningParameters: rayParams,
//
// 					lightningMaterial: lightningMaterial,
//
// 				} );
// storm.position.set(0,300,0)
// scene.add(storm)





  // gui
  // https://davidwalsh.name/dat-gui
  gui = new dat.gui.GUI();
  let fogFolder = gui.addFolder("Fog & Cloud");
  let rainFolder = gui.addFolder("Rain");
  let skyFolder = gui.addFolder("SkyEffect");
  params = {
    fogSpeed: 0.5,
    fogDensity: 2.5,
    fogColor: [179,179,179],
    rainSpeed: 4,
    rainDensity: 4,
    rainPattern: 0
  };
  effectController = {
		turbidity: 10,
		rayleigh: 3,
		mieCoefficient: 0.015,
		mieDirectionalG: 0.4,
	};
  fogFolder.add(params, "fogSpeed", 0.3, 0.7).step(0.1);
  fogFolder.add(params, "fogDensity", 2.0, 3.0).step(0.1);
  fogFolder.addColor(params, "fogColor");
  rainFolder.add(params, "rainSpeed", 2, 8).step(2);
  rainFolder.add(params, "rainDensity", 3, 7).step(1).onChange( rainChanged);
  rainFolder.add(params, "rainPattern", { Pattern1: 0, Pattern2: 1, Pattern3: 2}).onChange(rainChanged);


  skyFolder.add( effectController, "turbidity", 0.0, 20.0, 0.1 )
  .onChange( guiChanged );
  skyFolder.add( effectController, "rayleigh", 0.0, 4, 0.001 )
  .onChange( guiChanged );
  skyFolder.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 )
  .onChange( guiChanged );
  skyFolder.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 )
  .onChange( guiChanged );



  // stats
  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  container.appendChild(stats.dom);

//


  // let's draw!
  animate();
}
function guiChanged(){
  const uniforms = sky.material.uniforms;
	uniforms[ "turbidity" ].value = effectController.turbidity;
	uniforms[ "rayleigh" ].value = effectController.rayleigh;
	uniforms[ "mieCoefficient" ].value = effectController.mieCoefficient;
	uniforms[ "mieDirectionalG" ].value = effectController.mieDirectionalG;
}
function rainChanged(){
  scene.remove(rain);
  booleanRain = true;
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
  controls.handleResize();

}



///////////////////////////////////////////////////////




//

function render() {
  controls.update( clock.getDelta() );


  if (bird){
    bird.position.set(camera.position.x, 150 , camera.position.z - 100);
    // print(controls.domElement)
    bird.position.needsUpdate = true
  }
  // print(camera.position)


  if (rain){
    let rainPositions = rainGeo.attributes.position.array;
    for(let i = 0; i < params['rainDensity'] * 1000; i++){
      rainPositions[i * 3 + 1] -= (Math.random() + params['rainSpeed'] ) * 2
      if (rainPositions[i * 3 +1] < 50){
        rainPositions[i * 3 +1] = random(600,800);
      }
    }
    rainGeo.attributes.position.needsUpdate = true;
  }


//fog and light animations
  if (camera.position.z > depth/8 * 3 ){
    if (scene.fog.density < params['fogDensity']*0.001){
      scene.fog.density += params['fogSpeed'] * 0.00001
    }
    if (scene.background.r * 255 > params['fogColor'][0]){
      scene.background.r -= 0.05/255
      scene.background.g -= 0.05/255
      scene.background.b -= 0.05/255
      scene.fog.color.r -= 0.05/255
      scene.fog.color.g -= 0.05/255
      scene.fog.color.b -= 0.05/255
    }
    // print(scene.background.r*255)
    // print(scene.background.g*255)
    // print(scene.background.b*255)
  }
  else if (camera.position.z <= depth / 8 * 3 & camera.position.z > depth / 4){
    if(scene.fog.density > 0 ){
      scene.fog.density -= params['fogSpeed'] * 0.00005
    }
    // print('fog exit')
  }
  else if (camera.position.z <= depth/4 & camera.position.z >-depth/4){
    if (dlight.intensity > 0.2){
      dlight.intensity -= 0.0005
    }
    if(ambiLight.intensity >0.1){
      ambiLight.intensity -=0.0005
    }
  }
  else{
    if (dlight.intensity < 0.7){
      dlight.intensity += 0.001
    }
    if (dlight2){
      if (dlight2.intensity < 0.5){
        dlight2.intensity += 0.001
      }
    }
    if (planeA){
      // if (aMaterial.opacity < 1){
      //   aMaterial.opacity += 0.01
      //   // planeA = new THREE.Mesh(aGeo, aMaterial);
      //   // scene.remove(planeA)
      // }
      if(  planeA.position.y > -8000){
        planeA.position.y -= 30
        // if (dlight2 > )
        // dlight2.intensity -= 0.01
      }

      if (planeA.position.y == -1000){
          endSound.play();

      }

    }
    if(ambiLight.intensity >0.7){
      ambiLight.intensity +=0.001
    }

    if (scene.background.r * 255 < 217){
      scene.background.r += 0.05/255
      scene.background.g += 0.05/255
      scene.background.b += 0.05/255
      scene.fog.color.r += 0.05/255
      scene.fog.color.g += 0.05/255
      scene.fog.color.b += 0.05/255
    }

    // print('sunny')
  }







//weather conditions
  if (camera.position.z < depth/4 & booleanCloud & camera.position.z >0){
    cloudy();
    print('cloudy');
  }
  else if (camera.position.z<0 & camera.position.z > -depth/4 & booleanRain){
    raining();
    rainSound.play();
    print('raining')
  }
  else if (camera.position.z < -depth/4 & booleanSunny){
    scene.remove(rain)
    sunny();
    fogSound.pause();
    rainSound.pause();
    print('sunny')
  }
if(Math.random() > 0.5){
  if (cloudParticles.length < 1000){
    let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
    cloud.position.set(
      random(-1,1) * 1000,
      600,
      random(-1,1) * depth/4
    );
    cloud.rotation.x = 0.06;
    cloud.rotation.y = -0.12;
    cloud.rotation.z = random(0,1) * Math.PI /2;
    cloud.material.opacity = 0.55;
    cloudParticles.push(cloud);
    scene.add(cloud);
  }
}



		renderer.render(scene, camera);



}

function onPointerMove( event ) {

  		if ( event.isPrimary === false ) return;

  		mouseX = event.clientX - windowHalfX;
  		mouseY = event.clientY - windowHalfY;

}




function raining(){
  //rain
  rainGeo = new THREE.BufferGeometry();
  for (let i = 0; i < params['rainDensity'] * 1000; i++){
    rainVertices.push(random(-1,1) * 400 + camera.position.x);
    rainVertices.push(random(800,1200));
    rainVertices.push(Math.random() * (-depth/4) + camera.position.z);
  }
  rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(rainVertices, 3));
  let rainTexture = new THREE.TextureLoader().load( 'media/img/raindrop' + params['rainPattern'] + '.png' );
  rainMaterial = new THREE.PointsMaterial({
    map: rainTexture,
    size: 2,
    blending: THREE.SubtractiveBlending,
  })
  rain = new THREE.Points(rainGeo, rainMaterial);
  scene.add(rain);
  booleanRain = false;
}


function cloudy(){


  //cloud

  const cTexture = new THREE.TextureLoader().load( 'media/img/smoke3.png');
  cloudGeo = new THREE.PlaneBufferGeometry(350,350);
  // cloudGeo.rotateX(Math.PI / 2);
  cloudMaterial = new THREE.MeshLambertMaterial({
    map:cTexture,
    transparent:true,
    depthTest: false,
    blending: THREE.SubtractiveBlending
  });

  for(let p=0; p<100; p++) {
    let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
    cloud.position.set(
      random(-1,1) * 2000,
      600,
      random(-1,1) * depth/4
    );
    cloud.rotation.x = 0.06;
    cloud.rotation.y = -0.12;
    cloud.rotation.z = random(0,1) * Math.PI /2;
    cloud.material.opacity = 0.55;
    cloudParticles.push(cloud);
    scene.add(cloud);
}






  booleanCloud = false;
}



function sunny(){

  sky = new THREE.Sky();
  sky.scale.setScalar( 450000 );
  sky.position.set(0, 1000, -depth);
  sun = new THREE.Vector3(camera.position.x,camera.position.y + 400,-depth);
  sky.material.uniforms['sunPosition'].value.copy(sun)
  sky.material.uniforms['mieDirectionalG'].value = 0.4;
  scene.add( sky );
  const bTexture = new THREE.TextureLoader().load( 'media/img/birds.png');
  let birdsGeo = new THREE.PlaneBufferGeometry(500,350);
  let birdsMaterial = new THREE.MeshLambertMaterial({
    map:bTexture,
    transparent:true,
  });
  let birds = new THREE.Mesh(birdsGeo, birdsMaterial);
  birds.position.set(camera.position.x,camera.position.y+300,-depth)
  scene.add( birds )


  let aGeo = new THREE.PlaneGeometry(18000,8000);
  // aGeo.rotateX(Math.PI / 10);
  const aTexture = new THREE.TextureLoader().load( 'media/img/sky2.jpg');
  aMaterial = new THREE.MeshLambertMaterial({
    // map: aTexture,
    // // alphaTest: 1,
    // opacity:0
    color: 0xcfcfcf
  });
  planeA = new THREE.Mesh(aGeo, aMaterial);
  planeA.position.set(0,2000, -depth);
  scene.add(planeA)
  //
  //directional light
  dlight2 = new THREE.DirectionalLight(0xffffff, 0.3);
  dlight2.position.set(0, 400, -depth + 10);
  dlight2.castShadow = true;
  var d = 500;
  dlight2.shadow.camera.left = -d;
  dlight2.shadow.camera.right = d;
  dlight2.shadow.camera.bottom = -d;

  dlight2.shadow.camera.near = 2;
  dlight2.shadow.camera.far = 500;

  dlight2.shadow.mapSize.x = 1024;
  dlight2.shadow.mapSize.y = 1024;

  scene.add(dlight2);
  dlight2.target = birds

  booleanSunny = false;
}


function generateHeight(width, height) {
   var size = width * height, data = new Float32Array(size),
       perlin = new THREE.ImprovedNoise(), quality = 1, z = Math.random() * 100;
   for (var j = 0; j < 4; j++) {
       for (var i = 0; i < size; i++) {
           var x = i % width, y = ~ ~(i / width);
           data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality);
       }
       quality *= 3;
   }
   return data;
}







/* global
THREE p5 ml5 Stats dat alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera ADD CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult
*/
