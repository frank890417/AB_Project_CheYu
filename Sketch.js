// console.log(tokenData);
var features = {};
let projectNumber = Math.floor(parseInt(tokenData.tokenId) / 1000000);
let mintNumber = parseInt(tokenData.tokenId) % (projectNumber * 1000000);
let seed = parseInt(tokenData.hash.slice(0, 16), 16);

// Gets you an array of 32 parameters from the hash ranging from 0-255
let rawParams = setupParametersFromTokenData(tokenData);
let canvasTextureBase64 = `data:image/jpeg;base64, `;

(function () {
  canvasTextureBase64 += `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`;
})();
//%
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
      canGenCount: 2,
      generation: 0,
      id: int(R.random_num(0, 1000)),
      vFriction: R.random_num(0.99, 1),
      rFactor: R.random_num(0.99, 0.9995),
      affectFactor: R.random_num(0.8, 1.2),
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
    if (useSpecialType == "Spray") {
      for (var i = 0; i < 4; i++) {
        mainGraphics.fill(this.color);
        let dd = R.random_num(40) * R.random();
        let rr = (R.random_num(30) * R.random()) / (sqrt(dd) + 2);
        let aa = R.random_num(0, 2 * PI);
        mainGraphics.ellipse(dd * cos(aa), dd * sin(aa), rr, rr);
      }
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
      parallelAngle: R.random_num(0, 2 * PI),
      parallelAmp: R.random_num(0.0001, 0.002),
      gravity: createVector(R.random_num(-0.1, 0.1), R.random_num(-0.1, 0.1)),
      colors: useColorSet,
      color: R.random_choice(useColorSet),
      id: int(R.random_num(0, 100000)),
    };
    Object.assign(def, args);
    Object.assign(this, def);
    // console.log(this);
  }
  draw() {
    mainGraphics.push();
    mainGraphics.noStroke();
    mainGraphics.fill(this.color);
    if (useSpecialType == "Wireframe") {
      mainGraphics.noFill();
      mainGraphics.strokeWeight(5);
      mainGraphics.stroke(this.color);
    }
    if (useSpecialType == "Kinetic") {
      mainGraphics.translate(R.random_num(-8, 8), R.random_num(-8, 8));
      mainGraphics.rotate(R.random_num(-0.03, 0.03));
    }
    mainGraphics.rect(this.x, this.y, this.w, this.h);
    //debug type text
    // mainGraphics.fill(255, 0, 0);
    // mainGraphics.textSize(30);
    // mainGraphics.text(this.type, this.x + 50, this.y + 50);
    mainGraphics.pop();
  }
  affect(particle) {
    if (this.type == "field") {
      particle.v.x +=
        (cos((particle.p.x * this.sx) / 10) / 10) * particle.affectFactor;
      particle.v.y +=
        (sin((particle.p.y * this.sy) / 10) / 10) * particle.affectFactor;
    }
    if (this.type == "noise") {
      particle.v.x +=
        (noise((particle.p.x * this.sx) / 10) - 0.5) * particle.affectFactor;
      particle.v.y +=
        (noise((particle.p.y * this.sy) / 10) - 0.5) * particle.affectFactor;
    }
    if (this.type == "curl") {
      particle.v.rotate(
        ((this.polarAmp * particle.polarity) / pow(particle.r, 2)) *
          particle.affectFactor
      );
    }
    if (this.type == "square") {
      particle.v.x +=
        (cos(particle.p.x / 10 + particle.p.y / 20) / 2) *
        particle.affectFactor;
      particle.v.y +=
        (sin(particle.p.y / 10 + particle.p.x / 20) / 2) *
        particle.affectFactor;
    }
    if (this.type == "step") {
      particle.p.x +=
        cos(int(particle.p.x / 40) * 2) * 2 * particle.affectFactor;
      particle.p.y +=
        cos(int(particle.p.y / 40) * 2) * 2 * particle.affectFactor;
    }
    if (this.type == "parallel") {
      if (particle.v.heading() != this.parallelAngle) {
        particle.v.rotate(
          (this.parallelAngle - particle.v.heading()) * this.parallelAmp
        );
        // console.log(particle.v);
      }
      // particle.v.setHeading(this.parallelAngle);
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

class AngArea extends Area {
  constructor(args) {
    super(args);
  }
  draw() {
    let useR = (this.stR + this.edR) / 2;
    let sWeight = this.edR - this.stR;
    mainGraphics.push();
    mainGraphics.strokeCap(SQUARE);
    mainGraphics.noFill();
    mainGraphics.stroke(this.color);
    mainGraphics.translate(width / 2, height / 2);
    mainGraphics.strokeWeight(sWeight);
    mainGraphics.arc(0, 0, useR * 2, useR * 2, this.stAng, this.edAng, OPEN);
    mainGraphics.pop();
    if (useSpecialType == "Kinetic") {
      mainGraphics.translate(R.random_num(-8, 8), R.random_num(-8, 8));
      mainGraphics.rotate(R.random_num(-0.03, 0.03));
    }

    if (useSpecialType == "Wireframe") {
      console.log(useSpecialType);
      let useR = (this.stR + this.edR) / 2;
      let sWeight = this.edR - this.stR - 20;
      mainGraphics.push();
      mainGraphics.strokeCap(SQUARE);
      mainGraphics.noFill();
      mainGraphics.stroke(0);
      mainGraphics.translate(width / 2, height / 2);
      mainGraphics.strokeWeight(sWeight);
      mainGraphics.arc(0, 0, useR * 2, useR * 2, this.stAng, this.edAng, OPEN);
      mainGraphics.pop();
    }
  }
  isParticleInArea(particle) {
    let transformAng = (ang) => (ang < 0 ? ang + PI * 2 : ang);
    let pAng = transformAng(
      atan2(particle.p.y - height / 2, particle.p.x - width / 2)
    );

    let pR = dist(particle.p.x, particle.p.y, width / 2, height / 2);

    return (
      pAng >= this.stAng &&
      pAng <= this.edAng &&
      pR >= this.stR &&
      pR <= this.edR
    );
  }
}

let overAllTexture;
let canvasTexture;
let fullCanvasTexture;
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
    value: mapColorsToArr("333745-e63462-fe5f55-c7efcf-eef5db-fff"),
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
  Earth: {
    weight: 100,
    value: mapColorsToArr("0a0908-142228-f2f4f3-a9927d-5e503f-efc734-e0ba67"),
  },
};
let startPositions = {
  Center: {
    weight: 15,
    value: [0.5, 0.5],
  },
  CornerLT: [0.35, 0.35],
  CornerRT: [0.65, 0.35],
  CornerLB: [0.35, 0.65],
  CornerRB: [0.65, 0.65],
};
let specialTypes = {
  None: {
    weight: 10,
    value: "None",
  },
  Wireframe: {
    weight: 2,
    value: "Wireframe",
  },
  // Kinetic: {
  //   weight: 100,
  //   value: "Kinetic",
  // },
  Spray: {
    weight: 1,
    value: "Spray",
  },
};
let particleCounts = {
  Less: {
    weight: 2,
    value: 80,
  },
  Medium: {
    weight: 5,
    value: 100,
  },
  More: {
    weight: 1,
    value: 120,
  },
};
let particleSizes = {
  // XS: {
  //   weight: 2,
  //   value: 30,
  // },
  S: {
    weight: 5,
    value: 50,
  },
  M: {
    weight: 5,
    value: 65,
  },
  L: {
    weight: 4,
    value: 80,
  },
  XL: {
    weight: 2,
    value: 95,
  },
};
let areaTypes = {
  field: {
    weight: 30,
    value: "field",
  },
  curl: {
    weight: 6,
    value: "curl",
  },
  noise: {
    weight: 4,
    value: "noise",
  },
  square: {
    weight: 4,
    value: "square",
  },
  step: {
    weight: 10,
    value: "step",
  },
  parallel: {
    weight: 2,
    value: "parallel",
  },
  none: {
    weight: 2,
    value: "none",
  },
};
let emitTypes = {
  even: {
    weight: 10,
    value: "Even",
  },
  random: {
    weight: 15,
    value: "Random",
  },
  linearHorizontal: {
    weight: 3,
    value: "LinearHorzontal",
  },
  linearVertical: {
    weight: 3,
    value: "LinearVertical",
  },
  linearSlope: {
    weight: 2,
    value: "LinearSlope",
  },
};
let divisionTypes = {
  rect: {
    weight: 15,
    value: "Rect",
  },
  ang: {
    weight: 5,
    value: "Ang",
  },
};
let useStartPosition;
let useParticleCount;
let useColorSet;
let useParticleSize;
let useDivisionType;
let useEmitType;
let useSpecialType;
let showCanvasTexture = true;
let mainGraphics;
let areas = [];

//---------
let mapListToWeightedKeys = (list) => {
  return Object.entries(list)
    .filter((pair) => pair[0])
    .reduce((obj, arr) => {
      obj[arr[0]] = (arr[1] && arr[1].weight) || 1;
      return obj;
    }, {});
};
let allFeatureList = {
  Color: mapListToWeightedKeys(colors),
  StartPosition: mapListToWeightedKeys(startPositions),
  ParticleCount: mapListToWeightedKeys(particleCounts),
  ParticleSize: mapListToWeightedKeys(particleSizes),
  DivisionType: mapListToWeightedKeys(divisionTypes),
  EmitType: mapListToWeightedKeys(emitTypes),
  SpecialType: mapListToWeightedKeys(specialTypes),
  // RailType: {
  //   Sine: 20,
  //   Triangle: 5,
  //   Square: 5,
  // },
};
// features.RailType = R.random_choice_weight(allFeatureList.RailType);

//------------------------------

function getValueOfList(list, key) {
  return (list[key] && list[key].value) || list[key];
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

  features.EmitType = R.random_choice_weight(allFeatureList.EmitType);
  useEmitType = getValueOfList(emitTypes, features.EmitType);

  features.SpecialType = R.random_choice_weight(allFeatureList.SpecialType);
  useSpecialType = getValueOfList(specialTypes, features.SpecialType);
}

function preload() {
  renderFeatures();
  // canvasTexture = loadImage("canvas.jpeg");
  canvasTexture = loadImage(canvasTextureBase64);
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
      let splitNum = R.random_choice([2, 2, 2, 2, 2, 3, 4]);
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
  } else {
    let newArea = new AngArea({
      stR,
      edR,
      stAng,
      edAng,
      d,
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
var DEFAULT_SIZE = 1000;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var DIM = Math.min(WIDTH, HEIGHT);
var M = DIM / DEFAULT_SIZE;
//%
function setup() {
  // pixelDensity(2);
  let SZ = Math.min(WIDTH, HEIGHT);
  createCanvas(int(SZ), SZ);
  // createCanvas(windowWidth, windowHeight);
  mainGraphics = createGraphics(width, height);
  fullCanvasTexture = createGraphics(width, height);

  let textureGridSize = 120;

  for (let i = 0; i <= width + textureGridSize * 10; i += textureGridSize) {
    for (let o = 0; o <= height + textureGridSize * 10; o += textureGridSize) {
      fullCanvasTexture.image(
        canvasTexture,
        i,
        o,
        textureGridSize,
        textureGridSize
      );
    }
  }

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

  if (useDivisionType == "Rect") {
    div(0, 0, width, height, int(R.random_num(2, 4)));
  }
  if (useDivisionType == "Ang") {
    divAng(0, width, 0, 2 * PI, int(R.random_num(2, 5)));
  }
  features.AreaCount = areas.length;

  for (var i = 0; i < useParticleCount; i++) {
    let pColor = R.random_choice(useColorSet);
    let useEmitVelocity;
    let useEmitPosition = createVector(
      useStartPosition[0] * width,
      useStartPosition[1] * height
    );
    let useR = R.random_num(0, useParticleSize) * R.random_num(0.05, 1) + 1;
    if (useEmitType == "Random") {
      useEmitVelocity = createVector(0, 1)
        .rotate(R.random_num(0, 2 * PI))
        .mult(R.random_num(2, 6));
    } else if (useEmitType == "Even") {
      useEmitVelocity = createVector(0, 1)
        .rotate(map(i, 0, useParticleCount, 0, PI))
        .mult(R.random_num(2, 6));
      useR = sin(i / 4) * 10 + 12;
    } else if (useEmitType == "LinearHorzontal") {
      useEmitVelocity = createVector(0, 1)
        .rotate(sin((i / useParticleCount) * 2 * PI))
        .mult(R.random_num(2, 6));
      useEmitPosition = createVector(
        map(i, 0, useParticleCount, 0, width),
        height / 2
      );
    } else if (useEmitType == "LinearVertical") {
      useEmitVelocity = createVector(1, 0)
        .rotate(sin((i / useParticleCount) * 2 * PI))
        .mult(R.random_num(2, 6));
      useEmitPosition = createVector(
        width / 2,
        map(i, 0, useParticleCount, 0, height)
      );
    } else if (useEmitType == "LinearSlope") {
      useEmitVelocity = createVector(1, 0)
        .rotate(sin((i / useParticleCount) * 2 * PI))
        .mult(R.random_num(2, 6));
      useEmitPosition = createVector(
        map(i, 0, useParticleCount, 0, width),
        map(i, 0, useParticleCount, 0, height)
      );
    }
    particles.push(
      new Particle({
        p: useEmitPosition,
        v: useEmitVelocity,
        r: useR,
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
          if (
            R.random_dec() < 0.1 &&
            particle.generation < 2 &&
            particle.canGenCount > 0
          ) {
            let p = new Particle({
              p: particle.p.copy(),
              v: particle.v.copy(),
              a: particle.a.copy(),
              generation: particle.generation + 1,
            });
            particle.canGenCount--;
            // console.log(p.generation)
            particles.push(p);
          }
        }
      }
    });
    particle.draw();
  });
  particles = particles.filter((p) => p.life > 0);

  image(mainGraphics, 0, 0);

  // draw canvastexture
  if (showCanvasTexture) {
    push();
    blendMode(MULTIPLY);
    image(fullCanvasTexture, 0, 0);
    pop();
  }

  // Draw Hash
  if (showHash) {
    fill(0);
    textSize(20);
    textFont("Courier");
    // select('canvas').elt.style.letterSpacing = "5px";
    textAlign(RIGHT);

    for (var textId = 0; textId < tokenData.hash.length; textId++) {
      // let xx = textId*15+15+mouseX, yy = mouseY + sin(frameCount/50+xx/50)*50 + noise(frameCount/50+xx/50)*100
      // let xx = textId*15+15+mouseX, yy = mouseY + sin(frameCount/50+xx/50)*50
      // let xx = textId*15+15+mouseX, yy = mouseY
      let xx = textId * 15 + 30,
        yy = height - 30;
      // for(let xx=0;xx<width;xx+=20){
      //   for(let yy=0;yy<height;yy+=20){

      areas.forEach((area) => {
        if (
          area.isParticleInArea({
            p: createVector(xx, yy),
          })
        ) {
          let ar = color(area.color);
          let b =
            0.2126 * ar._getRed() +
            0.7152 * ar._getGreen() +
            0.0722 * ar._getBlue();
          if (b > 255 / 2) {
            fill(0);
          } else {
            fill(255);
          }
        }
      });
      noStroke();

      // ellipse(xx,yy,4,4)
      // }
      // }

      text(tokenData.hash[textId], xx, yy);
    }
  }
}
let showHash = false;
function keyPressed() {
  if (key == "s") {
    save("CYW_Electriz - " + tokenData.hash + ".png");
  }
  if (key == "t") {
    showCanvasTexture = !showCanvasTexture;
  }
  if (key == " ") {
    showHash = !showHash;
  }
}

function doubleClicked() {
  showCanvasTexture = !showCanvasTexture;
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
