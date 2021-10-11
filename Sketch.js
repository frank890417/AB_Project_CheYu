// console.log(tokenData);
let projectNumber = Math.floor(parseInt(tokenData.tokenId) / 1000000);
let mintNumber = parseInt(tokenData.tokenId) % (projectNumber * 1000000);
let seed = parseInt(tokenData.hash.slice(0, 16), 16);

// Gets you an array of 32 parameters from the hash ranging from 0-255
let rawParams = setupParametersFromTokenData(tokenData);

class Random {
  constructor(seed) {
    this.seed = seed;
  }
  random() {
    return this.random_dec();
  }
  random_dec() {
    /* Algorithm "xor" from p. 4 of Marsaglia, "Xorshift RNGs" */
    this.seed ^= this.seed << 13;
    this.seed ^= this.seed >> 17;
    this.seed ^= this.seed << 5;
    return ((this.seed < 0 ? ~this.seed + 1 : this.seed) % 1000) / 1000;
  }
  random_num(a, b) {
    if (b === undefined) {
      b = a;
      a = 0;
    }
    return a + (b - a) * this.random_dec();
  }
  random_int(a, b) {
    if (b === undefined) {
      b = a;
      a = 0;
    }
    return Math.floor(this.random_num(a, b + 1));
  }
  random_bool(p) {
    return this.random_dec() < p;
  }
  random_choice(list) {
    return list[Math.floor(this.random_num(0, list.length * 0.99))];
  }

  random_choice_weight(obj) {
    let sum = Object.values(obj).reduce((a, b) => a + b, 0);
    let steps = Object.values(obj).reduce(
      (arr, num) => {
        arr.push((arr.slice(-1) || 0) * 1 + num);
        return arr;
      },
      [0]
    );
    let ran = this.random_num(0, sum);
    let result = 0;
    for (let i = steps.length - 1; i >= 1; i--) {
      result = i - 1;
      if (ran > steps[i - 1] && ran < steps[i]) {
        break;
      }
    }
    return Object.keys(obj)[result];
  }
}

let R = new Random(seed);

class Particle {
  constructor(args) {
    let def = {
      p: createVector(0, 0),
      v: createVector(0, 0),
      a: createVector(0, 0),
      r: R.random_num(0, useParticleSize) * R.random_num(0.1, 1) + 1,
      polarity: R.random_choice([-1, 1]),
      generation: 0,
      id: int(R.random_num(0, 1000)),
      vFriction: R.random_num(0.99, 1),
      rFactor: R.random_num(0.99, 0.9995),
      area: null,
      hasFruit: R.random_num() < 0.5,
      color: "white",
      life: 500,
    };
    Object.assign(def, args);
    Object.assign(this, def);
  }
  draw() {
    mainGraphics.push();
    mainGraphics.translate(this.p);
    mainGraphics.fill(this.color);
    mainGraphics.ellipse(0, 0, this.r, this.r);

    if (R.random_dec() < 0.02) {
      let ss = R.random_num(0, 5);
      mainGraphics.noFill();
      mainGraphics.strokeWeight(2);
      mainGraphics.stroke(this.color);
      mainGraphics.ellipse(0, 0, this.r * ss, this.r * ss);
    }
    mainGraphics.pop();
  }
  update() {
    if (R.random_dec() < 0.01 && this.area) {
      this.color = R.random_choice(this.area.colors);
    }
    if (this.area) {
      this.area.affect(this);
      // this.p.x+=cos(this.p.x*this.area.sx)/5
      // this.p.y+=sin(this.p.y*this.area.sy)/5

      // this.p.x +=noise(this.p.x*this.area.noiseX)*this.area.noiseXAmp
      // this.p.y +=noise(this.p.y*this.area.noiseY)*this.area.noiseYAmp
      // this.v.x+=this.area.gravity.x
      // this.v.y+=this.area.gravity.y
      // this.
    }
    this.v.mult(this.vFriction);

    this.r *= this.rFactor;
    this.p.add(this.v);

    this.v.add(this.a);
    this.life--;
  }
}

class Area {
  constructor(args) {
    let def = {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      type: getValueOfList(
        areaTypes,
        R.random_choice_weight(mapListToWeightedKeys(areaTypes))
      ),
      sx: R.random_num(0, 2),
      sy: R.random_num(0, 2),
      polarAmp: R.random_num(-5, 5),
      noiseX: R.random_num(0, 100),
      noiseY: R.random_num(0, 1000),
      noiseXAmp: R.random_num(-5, 5),
      noiseYAmp: R.random_num(-5, 5),
      gravity: createVector(
        R.random_num(-0.1, 0.1),
        R.random_num(-0.1, 0.1)
      ),
      colors: useColorSet,
      color: R.random_choice(useColorSet),
      id: int(R.random_num(0, 100000)),
    };
    Object.assign(def, args);
    Object.assign(this, def);
    console.log(this);
  }
  draw() {
    mainGraphics.push();
    mainGraphics.noStroke();
    mainGraphics.fill(this.color);
    mainGraphics.rect(this.x, this.y, this.w, this.h);
    //debug type text
    // mainGraphics.fill(255, 0, 0);
    // mainGraphics.textSize(30);
    // mainGraphics.text(this.type, this.x + 50, this.y + 50);
    mainGraphics.pop();
  }
  affect(particle) {
    if (this.type == "field") {
      particle.v.x += cos((particle.p.x * this.sx) / 10) / 10;
      particle.v.y += sin((particle.p.y * this.sy) / 10) / 10;
    }
    if (this.type == "noise") {
      particle.v.x += noise((particle.p.x * this.sx) / 10) - 0.5;
      particle.v.y += noise((particle.p.y * this.sy) / 10) - 0.5;
    }
    if (this.type == "curl") {
      particle.v.rotate(
        (this.polarAmp * particle.polarity) / pow(particle.r, 2)
      );
    }
    if (this.type == "square") {
      particle.v.x += cos(particle.p.x / 10 + particle.p.y / 20) / 2;
      particle.v.y += sin(particle.p.y / 10 + particle.p.x / 20) / 2;
    }
    if (this.type=="step"){
      particle.p.x += cos(int(particle.p.x/40)*2 )*2;
      particle.p.y += cos(int(particle.p.y/40)*2 )*2;
    }
  }
  isParticleInArea(particle) {
    let rectCheckFunc = (area, p) =>
      p.p.x > area.x &&
      p.p.x < area.x + area.w &&
      p.p.y > area.y &&
      p.p.y < area.y + area.h;
    let checkFunc = this.checkFunc || rectCheckFunc;

    return checkFunc(this, particle);
  }
}

class AngArea extends Area{
  constructor(args){
    super(args)
  }
  draw(){
    let useR =(this.stR+this.edR)/2 
    let sWeight = this.edR-this.stR
    mainGraphics.push()
    mainGraphics.strokeCap(SQUARE)
      mainGraphics.noFill()
      mainGraphics.stroke(this.color);
      mainGraphics.translate(width/2,height/2)

      mainGraphics.strokeWeight(sWeight)
      mainGraphics.arc(0,0,useR*2,useR*2,this.stAng,this.edAng,OPEN)
    mainGraphics.pop()
  }
  isParticleInArea(particle) { 
    let transformAng = (ang)=>ang<0?ang+PI*2:ang
    let pAng = transformAng(atan2(particle.p.y- height/2,particle.p.x-width/2) )
     

    let pR = dist(particle.p.x,particle.p.y,width/2,height/2)

    return pAng>= this.stAng&& pAng <=this.edAng&& pR>= this.stR && pR<= this.edR
 
  }

}

let overAllTexture;
let canvasTexture;
let mapColorsToArr = (str) => str.split("-").map((a) => "#" + a);
let colors = {
  Paper: {
    weight: 100,
    value: mapColorsToArr("222-666-999-aaa-ccc-eee-fff-080808"),
  },
  Kimono: {
    weight: 100,
    value: mapColorsToArr("fff-f24-fae8eb-f6caca-e4c2c6-cd9fcc-0a014f"),
  },
  Sea: {
    weight: 100,
    value: mapColorsToArr("e63946-f1faee-a8dadc-457b9d-1d3557"),
  },
  Confetti: {
    weight: 100,
    value: mapColorsToArr("201e1f-ff4000-faaa8d-feefdd-50b2c0"),
  },
  Vine: {
    weight: 100,
    value: mapColorsToArr("fff-222-545454-69747c-6baa75-84dd63-cbff4d"),
  },
  Festival: {
    weight: 100,
    value: mapColorsToArr("12355b-420039-d72638-ffffff-ff570a"),
  },
  Lolipop: {
    weight: 100,
    value: mapColorsToArr("ff499e-d264b6-a480cf-779be7-49b6ff-fff-000"),
  },
  Eastern: {
    weight: 100,
    value: mapColorsToArr("333745-e63462-fe5f55-c7efcf-eef5db"),
  },
  Beans: {
    weight: 100,
    value: mapColorsToArr("fb6107-f3de2c-7cb518-5c8001-fbb02d-fff-111"),
  },
  MonoChrome: {
    weight: 100,
    value: mapColorsToArr("000-fff-333"),
  },
  Mint: {
    weight: 100,
    value: mapColorsToArr("000-fff-333-00ffbb"),
  },
  Taxi: {
    weight: 100,
    value: mapColorsToArr("000-fff-333-fff719"),
  },
};
let startPositions = {
  Center: {
    weight: 10,
    value: [0.5, 0.5]
    
  },
  CornerLT: [0.3, 0.3],
  CornerRT: [0.7, 0.3],
  CornerLB: [0.3, 0.7],
  CornerRB: [0.7, 0.7],
};
let particleCounts = {
  Less: {
    weight: 2,
    value: 100,
  },
  Medium: {
    weight: 5,
    value: 120,
  },
  More: {
    weight: 1,
    value: 140,
  },
};
let particleSizes = {
  // XS: {
  //   weight: 2,
  //   value: 30,
  // },
  S: {
    weight: 5,
    value: 45,
  },
  M: {
    weight: 5,
    value: 60,
  },
  L: {
    weight: 4,
    value: 75,
  },
  XL: {
    weight: 2,
    value: 90,
  },
};
let areaTypes = {
  field: {
    weight: 20,
    value: "field",
  },
  curl: {
    weight: 3,
    value: "curl",
  },
  noise: {
    weight: 2,
    value: "noise",
  },
  square: {
    weight: 2,
    value: "square",
  },
  step: {
    weight: 5,
    value: "step",
  },
  none: {
    weight: 1,
    value: "none",
  },

};

let divisionTypes = {
  rect: {
    weight: 10,
    value: "rect"
  },
  ang: {
    weight: 10,
    value: "ang"
  }

}
let useStartPosition;
let useParticleCount;
let useColorSet;
let useParticleSize;
let useDivisionType
let mainGraphics;
let areas = [];

//---------
let mapListToWeightedKeys = (list) => {
  return Object.entries(list)
    .filter((pair) => pair[0])
    .reduce((obj, arr) => {
      obj[arr[0]] = arr[1]?.weight || 1;
      return obj;
    }, {});
};
let allFeatureList = {
  Color: mapListToWeightedKeys(colors),
  StartPosition: mapListToWeightedKeys(startPositions),
  ParticleCount: mapListToWeightedKeys(particleCounts),
  ParticleSize: mapListToWeightedKeys(particleSizes),
  DivisionType: mapListToWeightedKeys(divisionTypes),
  // RailType: {
  //   Sine: 20,
  //   Triangle: 5,
  //   Square: 5,
  // },
};
// features.RailType = R.random_choice_weight(allFeatureList.RailType);

//------------------------------

function getValueOfList(list, key) {
  return list[key]?.value || list[key];
}

function renderFeatures() {
  features.Color = R.random_choice_weight(allFeatureList.Color);
  useColorSet = getValueOfList(colors, features.Color);

  features.StartPosition = R.random_choice_weight(allFeatureList.StartPosition);
  useStartPosition = getValueOfList(startPositions, features.StartPosition);

  features.ParticleCount = R.random_choice_weight(allFeatureList.ParticleCount);
  useParticleCount = getValueOfList(particleCounts, features.ParticleCount);

  features.ParticleSize = R.random_choice_weight(allFeatureList.ParticleSize);
  useParticleSize = getValueOfList(particleSizes, features.ParticleSize);


  features.DivisionType = R.random_choice_weight(allFeatureList.DivisionType);
  useDivisionType = getValueOfList(divisionTypes, features.DivisionType);
}

function preload() {
  renderFeatures();
  canvasTexture = loadImage("canvas.jpeg");
}

function div(x, y, w, h, z) {
  if (R.random_dec() < 0.5 + z / 8 && z > 0) {
    let ratio = R.random_num(0.2, 0.8);
    if (R.random_dec() < 0.3) {
      let ww = w * ratio;
      div(x, y, ww, h, z - 1);
      div(x + ww, y, w - ww, h, z - 1);
    } else {
      let hh = h * ratio;
      div(x, y, w, hh, z - 1);
      div(x, y + hh, w, h - hh, z - 1);
    }
  } else {
    let newArea = new Area({
      x,
      y,
      w,
      h,
      type: getValueOfList(
        areaTypes,
        R.random_choice_weight(mapListToWeightedKeys(areaTypes))
      ),
      sx: R.random_num(0, 2),
      sy: R.random_num(0, 2),
      noiseX: R.random_num(0, 100),
      noiseY: R.random_num(0, 1000),
      noiseXAmp: R.random_num(-5, 5),
      noiseYAmp: R.random_num(-5, 5),
      gravity: createVector(
        R.random_num(-0.15, 0.15),
        R.random_num(-0.15, 0.15)
      ),
      colors: useColorSet,
    });
    newArea.draw();
    areas.push(newArea);
  }
}

function divAng(stR, edR, stAng, edAng, d) {
  if (R.random() < 0.3) {
    d -= 1;
  }
  let ratio = R.random_num(0.3, 0.7);
  if (d > 0) {
    if (R.random() < 0.4) {
      let splitNum = R.random_choice([2, 2, 2, 2, 2, 3,4]);
      for (var o = 1; o <= splitNum; o++) {
        divAng(
          stR,
          edR,
          stAng + ((o - 1) * (edAng - stAng)) / splitNum,
          stAng + (o * (edAng - stAng)) / splitNum,
          d - 1
        );
      } 
    } else {
      divAng(stR, stR + ratio * (edR - stR), stAng, edAng, d - 1);
      divAng(stR + ratio * (edR - stR), edR, stAng, edAng, d - 1);
    }
  }else{
    let newArea = new AngArea({
      stR, edR, stAng, edAng, d,
      type: getValueOfList(
        areaTypes,
        R.random_choice_weight(mapListToWeightedKeys(areaTypes))
      ),
      sx: R.random_num(0, 2),
      sy: R.random_num(0, 2),
      noiseX: R.random_num(0, 100),
      noiseY: R.random_num(0, 1000),
      noiseXAmp: R.random_num(-5, 5),
      noiseYAmp: R.random_num(-5, 5),
      gravity: createVector(
        R.random_num(-0.15, 0.15),
        R.random_num(-0.15, 0.15)
      ),
      colors: useColorSet,
    });
    newArea.draw();
    areas.push(newArea);
  }
}

let particles = [];
let ang;
function setup() {
  pixelDensity(3);
  createCanvas(1200, 1200);
  // createCanvas(windowWidth, windowHeight);
  mainGraphics = createGraphics(width, height);
  background(100);

  ang = R.random_num(-0.5, 0.5);

  mainGraphics.fill(0);
  mainGraphics.rect(0, 0, width, height);

  // translate(width/2,height/2)
  // rotate(random())
  // translate(-width/2,-height/2)

  overAllTexture = createGraphics(width, height);
  overAllTexture.loadPixels();
  for (var i = 0; i < width + 50; i++) {
    for (var o = 0; o < height + 50; o++) {
      overAllTexture.set(
        i,
        o,
        color(
          200,
          noise(i / 10, (i * o) / 300) * R.random_choice([0, 0, 20, 100])
        )
      );
    }
  }
  overAllTexture.updatePixels();

  translate(width / 2, height / 2);
  rotate(ang);
  translate(-width / 2, -height / 2);

  if (useDivisionType=="rect"){
    div(0, 0, width, height, int(R.random_num(2, 4)));
  }
  if (useDivisionType=="ang"){
    divAng(0, width, 0, 2*PI, int(R.random_num(2, 6)));
  }
  features.AreaCount = areas.length;

  for (var i = 0; i < useParticleCount; i++) {
    let pColor = R.random_choice(useColorSet);
    particles.push(
      new Particle({
        p: createVector(
          useStartPosition[0] * width,
          useStartPosition[1] * height
        ),
        v: createVector(0, 1)
          .rotate(R.random_num(0, 2 * PI))
          .mult(R.random_num(2, 6)),
        color: pColor,
      })
    );
  }

  mainGraphics.translate(width / 2, height / 2);
  mainGraphics.rotate(ang);
  mainGraphics.translate(-width / 2, -height / 2);
}

function draw() {
  mainGraphics.noStroke();

  particles.forEach((particle) => {
    particle.update();
    areas.forEach((area) => {
      if (area.isParticleInArea(particle)) {
        if (particle.area !== area) {
          particle.area = area;
          particle.color = R.random_choice(area.colors);
          particle.v.rotate(R.random_num(-1, 1));
          if (R.random_dec() < 0.1 && particle.generation < 5) {
            let p = new Particle({
              p: particle.p.copy(),
              v: particle.v.copy(),
              a: particle.a.copy(),
              generation: particle.generation + 1,
            });
            particles.push(p);
          }
        }
      }
    });
    particle.draw();
  });
  particles = particles.filter((p) => p.life > 0);

  image(mainGraphics, 0, 0);

  push();
  blendMode(MULTIPLY);
  image(canvasTexture, 0, 0, 1920 * 1.15, 1080 * 1.15);
  pop();

  
  if (showHash ){
    fill(0)
    textSize(20)
    textFont("Courier")
    // select('canvas').elt.style.letterSpacing = "5px";
    textAlign(RIGHT)

    for( var textId = 0; textId<tokenData.hash.length; textId++){
      // let xx = textId*15+15+mouseX, yy = mouseY + sin(frameCount/50+xx/50)*50 + noise(frameCount/50+xx/50)*100
      let xx = textId*15+15+mouseX, yy = mouseY + sin(frameCount/50+xx/50)*50 
      // let xx = textId*15+15+mouseX, yy = mouseY
      // for(let xx=0;xx<width;xx+=20){
      //   for(let yy=0;yy<height;yy+=20){

      areas.forEach(area=>{
        if (area.isParticleInArea( {
          p: createVector(xx,yy)
        } )){
          let ar = color(area.color)
          let b = 0.2126*ar._getRed() + 0.7152*ar._getGreen() + 0.0722*ar._getBlue()
          if (b>255/2){
            fill(0)
          }else{
            fill(255)
          }
        }
      })
      noStroke()

      // ellipse(xx,yy,4,4)
        // }
      // }
      
      text(tokenData.hash[textId],xx,yy)
    }
  }

}
let showHash =true
function keyPressed() {
  if (key == "s") {
    save();
  }
  if (key ==" "){
    showHash  = !showHash 
  }
}

/*
  Helper functions
*/

// parse parameters
function setupParametersFromTokenData(token) {
  let hashPairs = [];
  //parse hash
  for (let j = 0; j < 32; j++) {
    hashPairs.push(token.hash.slice(2 + j * 2, 4 + j * 2));
  }
  // map to 0-255
  return hashPairs.map((x) => {
    return parseInt(x, 16);
  });
}

function generateSeedFromTokenData(token) {
  return parseInt(token.hash.slice(0, 16), 16);
}

/*
  Random setup and helper functions, some of these are taken from
  @mattdesl's canvas-sketch-util Random library and adapted to work
  with this
*/

function rnd() {
  seed ^= seed << 13;
  seed ^= seed >> 17;
  seed ^= seed << 5;

  let result = ((seed < 0 ? ~seed + 1 : seed) % 1000) / 1000;
  return result;
}

function range(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }

  if (typeof min !== "number" || typeof max !== "number") {
    throw new TypeError("Expected all arguments to be numbers");
  }

  return rnd() * (max - min) + min;
}

function rangeFloor(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }

  if (typeof min !== "number" || typeof max !== "number") {
    throw new TypeError("Expected all arguments to be numbers");
  }

  return Math.floor(range(min, max));
}

function pick(array) {
  if (array.length === 0) return undefined;
  return array[rangeFloor(0, array.length)];
}

function shuffleArray(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected Array, got " + typeof arr);
  }

  var rand;
  var tmp;
  var len = arr.length;
  var ret = arr.slice();
  while (len) {
    rand = Math.floor(rnd() * len--);
    tmp = ret[len];
    ret[len] = ret[rand];
    ret[rand] = tmp;
  }
  return ret;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function sampleSize(arr, num) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected Array, got " + typeof arr);
  }

  if (arr.length < num) {
    throw new TypeError(
      "Array is has less elements than sample size, " +
        arr.length +
        " vs " +
        num
    );
  }

  let shuffled = shuffleArray(arr);

  return { samples: shuffled.slice(0, num), leftOver: shuffled.slice(num) };
}

function mapd(n, start1, stop1, start2, stop2) {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

function mapParam(n, start, stop) {
  return mapd(n, 0, 255, start, stop);
}

function chooseWithParam(obj, param) {
  let useParam,
    useMax = 255;
  // console.log(param);
  if (Array.isArray(param)) {
    useParam = param.reduce((a, b) => a * 256 + b, 0);
    useMax = Math.pow(256, param.length) - 1;
  } else {
    useParam = param;
  }

  let sum = Object.values(obj).reduce((a, b) => a + b, 0);
  let steps = Object.values(obj).reduce(
    (arr, num) => {
      arr.push((arr.slice(-1) || 0) * 1 + num);
      return arr;
    },
    [0]
  );
  let ran = mapd(useParam, 0, useMax, 0, sum);

  let result = 0;
  for (let i = steps.length - 1; i >= 1; i--) {
    result = i - 1;
    if (ran > steps[i - 1] && ran < steps[i]) {
      break;
    }
  }
  return Object.keys(obj)[result];
}

function convertToRarity(obj) {
  let cloneObj = JSON.parse(JSON.stringify(obj));
  let sum = Object.values(obj).reduce((a, b) => a + b, 0);
  for (let key of Object.keys(obj)) {
    cloneObj[key] = ((cloneObj[key] / sum) * 100).toFixed(2) + "%";
  }
  return cloneObj;
}
