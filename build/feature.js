
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

//%
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

renderFeatures();
