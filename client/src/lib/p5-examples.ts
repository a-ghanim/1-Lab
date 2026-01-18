export const BLACK_HOLE_SKETCH = `
  let particles = [];
  let horizonRadius = 100;
  let accretionDiskRadius = 250;
  let angleX = 0;
  let angleY = 0;
  
  // Interactive slider
  let massSlider;
  
  p.setup = function() {
    p.createCanvas(p.windowWidth > 600 ? 600 : p.windowWidth - 40, 400, p.WEBGL);
    p.noStroke();
    
    // Create DOM slider for black hole mass
    // Note: In p5 instance mode, we usually create elements outside or handle them carefully
    // For this simple demo, we'll just use variables or simulated UI if possible, 
    // but p5 dom is fine if we clean it up. 
    // Let's use internal variables for simplicity in this sandbox
  };

  p.draw = function() {
    p.background(10);
    p.orbitControl();
    
    // Accretion Disk
    p.rotateX(p.PI / 3 + p.frameCount * 0.005);
    p.rotateZ(p.frameCount * 0.01);
    
    // Draw disk
    for (let i = 0; i < 500; i++) {
      let angle = p.random(p.TWO_PI);
      let r = p.random(horizonRadius + 20, accretionDiskRadius);
      let x = r * p.cos(angle);
      let y = r * p.sin(angle);
      
      p.push();
      p.translate(x, y, 0);
      let c = p.color(255, p.random(100, 200), 50);
      c.setAlpha(150);
      p.fill(c);
      p.sphere(1 + (accretionDiskRadius - r) / 50);
      p.pop();
    }
    
    // Event Horizon (Black Hole)
    p.push();
    p.fill(0);
    p.stroke(255, 100);
    p.strokeWeight(2);
    p.sphere(horizonRadius);
    p.pop();
    
    // Photon Ring
    p.push();
    p.noFill();
    p.stroke(255, 255, 200, 50);
    p.strokeWeight(4);
    p.torus(horizonRadius * 1.5, 2);
    p.pop();
  };
`;

export const PHOTOSYNTHESIS_SKETCH = `
  let sunY = 50;
  let molecules = [];
  let energyPackets = [];
  
  p.setup = function() {
    p.createCanvas(p.windowWidth > 600 ? 600 : p.windowWidth - 40, 400);
    for(let i=0; i<20; i++) {
      molecules.push({
        x: p.random(p.width),
        y: p.random(p.height - 100, p.height),
        type: 'H2O'
      });
    }
  };

  p.draw = function() {
    p.background(135, 206, 235); // Sky blue
    
    // Sun
    p.push();
    p.fill(255, 255, 0);
    p.noStroke();
    p.circle(p.width - 50, 50, 60);
    // Sun rays
    if (p.frameCount % 60 < 30) {
      p.stroke(255, 255, 0, 100);
      p.strokeWeight(2);
      p.line(p.width - 50, 50, p.width/2, p.height);
      if(p.frameCount % 5 === 0) {
        energyPackets.push({x: p.width - 50, y: 50, targetX: p.width/2, targetY: p.height - 100, active: true});
      }
    }
    p.pop();
    
    // Plant stem
    p.fill(34, 139, 34);
    p.rect(p.width/2 - 10, p.height - 200, 20, 200);
    
    // Leaf
    p.ellipse(p.width/2 + 40, p.height - 150, 80, 40);
    p.ellipse(p.width/2 - 40, p.height - 120, 80, 40);
    
    // Soil
    p.fill(139, 69, 19);
    p.rect(0, p.height - 20, p.width, 20);
    
    // Photons logic
    for(let i = energyPackets.length - 1; i >= 0; i--) {
      let ep = energyPackets[i];
      p.fill(255, 255, 200);
      p.circle(ep.x, ep.y, 5);
      ep.x = p.lerp(ep.x, ep.targetX + p.random(-20, 20), 0.05);
      ep.y = p.lerp(ep.y, ep.targetY + p.random(-20, 20), 0.05);
      
      if(p.dist(ep.x, ep.y, p.width/2, p.height-150) < 50) {
        // Hit leaf
        energyPackets.splice(i, 1);
        // Release O2
        molecules.push({x: p.width/2 + p.random(-20, 20), y: p.height - 150, type: 'O2', vy: -1});
      } else if (ep.y > p.height) {
        energyPackets.splice(i, 1);
      }
    }
    
    // Molecules
    for(let i = molecules.length - 1; i >= 0; i--) {
      let m = molecules[i];
      if(m.type === 'H2O') {
        p.fill(0, 0, 255);
        p.circle(m.x, m.y, 8);
        m.x += p.random(-0.5, 0.5);
      } else if (m.type === 'O2') {
        p.fill(200, 200, 255);
        p.circle(m.x, m.y, 8);
        m.y += m.vy;
        m.x += p.random(-0.5, 0.5);
        if(m.y < 0) molecules.splice(i, 1);
      }
    }
    
    p.fill(0);
    p.textSize(16);
    p.text("Light Energy + H2O + CO2 → Sugar + O2", 20, 30);
  };
`;

export const PENDULUM_SKETCH = `
  let angle;
  let angleV = 0;
  let angleA = 0;
  let bob;
  let len;
  let origin;
  let gravity = 0.4; // Slightly unrealistic for visual effect
  
  // Interactive variables
  let lengthSliderVal = 200;
  
  p.setup = function() {
    p.createCanvas(p.windowWidth > 600 ? 600 : p.windowWidth - 40, 400);
    origin = p.createVector(p.width / 2, 0);
    angle = p.PI / 4;
    bob = p.createVector();
    len = 200;
  };

  p.draw = function() {
    p.background(240);
    
    // Simulate Length Slider (Visual only in this mock)
    // We oscillate the length to show interactivity possibility
    // len = 200 + p.sin(p.frameCount * 0.01) * 50; 
    
    let force = gravity * p.sin(angle);
    angleA = (-1 * force) / len;
    angleV += angleA;
    angle += angleV;
    
    // Damping
    angleV *= 0.99;
    
    bob.x = len * p.sin(angle) + origin.x;
    bob.y = len * p.cos(angle) + origin.y;
    
    p.stroke(0);
    p.strokeWeight(2);
    p.line(origin.x, origin.y, bob.x, bob.y);
    
    p.fill(127);
    p.circle(bob.x, bob.y, 32); // The Bob
    
    // Trail
    // (Omitted for simplicity, but would be cool)
    
    p.fill(0);
    p.noStroke();
    p.text("Simple Harmonic Motion", 20, 30);
    p.text("Period depends on Length", 20, 50);
  };
`;

export const GENERIC_SKETCH = `
  let particles = [];
  
  p.setup = function() {
    p.createCanvas(p.windowWidth > 600 ? 600 : p.windowWidth - 40, 400);
    for(let i=0; i<100; i++) {
      particles.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(2, 8),
        speedX: p.random(-1, 1),
        speedY: p.random(-1, 1),
        col: p.color(p.random(255), p.random(255), 255)
      });
    }
  };

  p.draw = function() {
    p.background(20, 20, 30);
    
    for(let pt of particles) {
      p.fill(pt.col);
      p.noStroke();
      p.circle(pt.x, pt.y, pt.size);
      
      pt.x += pt.speedX;
      pt.y += pt.speedY;
      
      // Wrap edges
      if(pt.x < 0) pt.x = p.width;
      if(pt.x > p.width) pt.x = 0;
      if(pt.y < 0) pt.y = p.height;
      if(pt.y > p.height) pt.y = 0;
      
      // Connect close particles
      for(let other of particles) {
        let d = p.dist(pt.x, pt.y, other.x, other.y);
        if(d < 50) {
          p.stroke(255, 50);
          p.strokeWeight(1);
          p.line(pt.x, pt.y, other.x, other.y);
        }
      }
    }
    
    p.fill(255);
    p.textSize(20);
    p.textAlign(p.CENTER);
    p.text("Visualization Mode", p.width/2, p.height/2);
    p.textSize(14);
    p.text("(Concept requires specific AI generation)", p.width/2, p.height/2 + 25);
  };
`;
