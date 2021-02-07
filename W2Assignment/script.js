let gravity;
let fireworks  = [];
let width = 800;
let height = 600;

function setup() {
  createCanvas(width, height);
  gravity = createVector(0,0.2);

}

function draw() {
  background(5,5,71);

  if (frameCount % 15 == 0){
    fireworks.push(new Firework());
  }

  // fireworks[0].update();
  // fireworks[0].show();

  for (let i = fireworks.length - 1; i>=0; i--){
    fireworks[i].update();
    fireworks[i].show();
    // print('refreshi')

    if (fireworks[i].isDead()){
      fireworks.splice(i,1)
    }
  }



}

class Particle{
  constructor(pos, expo, color){
    this.pos = pos.copy();
    this.expo = expo;
    this.color = color;
    this.lifespan = 300;
    this.acce = createVector(0,0);
    if (this.expo){
      this.vel = p5.Vector.random2D();
      this.vel.mult(random(2,10))
    }
    else{
      this.vel = createVector(0,random(-15,-10));
    }

  }

  update(){
    if (this.expo){
      this.vel.mult(0.9);
      this.lifespan -=3
    }
    this.vel.add(this.acce)
    this.pos.add(this.vel)
    this.acce.mult(0)

  }
  show(){
    if (this.expo){
      strokeWeight(4);
      stroke(this.color[0],this.color[1],this.color[2],this.lifespan);
    }
    else{
      strokeWeight(6);
      stroke(this.color[0],this.color[1],this.color[2]);
    }
    point(this.pos.x, this.pos.y);


  }
  isDead(){
    return this.lifespan < 0;
  }

  applyForce(force){
    this.acce.add(force)
  }

}



class Firework{
  constructor(){
    this.color = [random(0,255),random(0,255),random(0,255)];
    this.particle = new Particle(createVector(random(width), height), false, this.color);
    this.expo = false;
    this.particles = [];
  }

  isDead(){
    if (this.expo && this.particles.length == 0){
      return true;
    }
    else{
      return false;
    }
  }

  update(){
    if(!this.expo){

      this.particle.applyForce(gravity);
      this.particle.update();

      if (this.particle.vel.y >= 0) {
        this.expo = true;
        this.explode();
      }
    }
    for (let i = this.particles.length-1; i>=0; i--){
      let p = this.particles[i];
      p.applyForce(gravity);
      p.update();

      if (p.isDead()) {
        this.particles.splice(i,1)
      }

    }
  }

  explode(){
    for (let i=0; i < 150; i++){
      let p = new Particle(this.particle.pos, true ,this.color);
      this.particles.push(p)
    }
  }

  show(){
    if(!this.expo){
      this.particle.show();
    }
    for (let i=0; i < this.particles.length; i++){
      this.particles[i].show()
    }
    // print('im showing')
  }



}
