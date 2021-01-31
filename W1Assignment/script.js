let particles;
let width = 800;
let height = 600;

function setup() {
  createCanvas(width, height);
  particles = new PartiGroup(createVector(width/2, 100))
}

function draw() {
  background('whitesmoke');

  fill('whitesmoke')
  rect(0,0,width,height/7);
  fill('seashell')
  rect(0,height/7,width,height/7);
  fill('cornsilk')
  rect(0,height/7*2,width,height/7);
  fill('beige')
  rect(0,height/7*3,width,height/7);
  fill('azure')
  rect(0,height/7*4,width,height/7);
  fill('lightcyan')
  rect(0,height/7*5,width,height/7);
  fill('lavender')
  rect(0,height/7*6,width,height/7);


  particles.add();
  particles.run();


}

class Particle{
  constructor(pos){
    this.pos = pos.copy();
    this.acce = createVector(random(0.05,0.08),0);
    this.vel = p5.Vector.random2D();
    this.colorspan = pos.y;
    this.lifespan = 200;
  }
  update(){
    this.vel.add(this.acce)
    this.pos.add(this.vel)
    this.lifespan -= 2
  }
  show(){
    noStroke()
    if(this.colorspan < height/7){
      fill(255, 0, 0);
      ellipse(this.pos.x, this.pos.y, 20);
    } else if (this.colorspan < height/7*2){
      fill(255, 165, 0);
      ellipse(this.pos.x, this.pos.y, 18);
    } else if (this.colorspan < height/7*3){
      fill(255, 255, 0);
      ellipse(this.pos.x, this.pos.y, 15);
    } else if (this.colorspan < height/7*4){
      fill(0, 255, 0);
      ellipse(this.pos.x, this.pos.y, 13);
    } else if (this.colorspan < height/7*5){
      fill(0, 0, 255);
      ellipse(this.pos.x, this.pos.y, 11);
    } else if (this.colorspan < height/7*6){
      fill(75, 0, 130);
      ellipse(this.pos.x, this.pos.y, 10);
    } else{
      fill(148, 0, 211);
      ellipse(this.pos.x, this.pos.y, 8);
    }


  }
  isDead(){
    return this.lifespan < 0;
  }

  run(){
    this.update();
    this.show();
  }

}

class PartiGroup{
  constructor(pos){
    this.origin = pos.copy();
    this.group = [];
  }

  add(){
    this.origin = createVector(mouseX,mouseY);
    this.group.push(new Particle(this.origin));
  }
  run(){
    for (let i = this.group.length-1; i>=0; i--){
      let p = this.group[i];
      p.run();
      if (p.isDead()) {
        this.group.splice(i,1)
      }

    }
  }



}
