// SETTINGS
let settings = {
  mode: "",
  settings: {},
  colors: {},
};

// PALETTE DEFINITIONS
const COLOR_PALETTES = {
  vibrant: [
    "#FF1493",
    "#FF4500",
    "#00FA9A",
    "#E6FF00",
    "#1E90FF",
    "#FF8C00",
    "#FFFFFF",
  ],
  neon: [
    "#FF073A",
    "#39FF14",
    "#FF10F0",
    "#00FFFF",
    "#FFFF00",
    "#FF6600",
    "#FFFFFF",
  ],
  pastel: [
    "#FFB3BA",
    "#FFDFBA",
    "#FFFFBA",
    "#BAFFC9",
    "#BAE1FF",
    "#E6BAFF",
    "#FFFFFF",
  ],
  warm: [
    "#FF6B6B",
    "#FF8E53",
    "#FF6B9D",
    "#FFD93D",
    "#6BCF7F",
    "#4ECDC4",
    "#FFFFFF",
  ],
  cool: [
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#87CEEB",
    "#FFFFFF",
  ],
};

let showCamera;

// POPUP
let o = 1;
let hasMoved, fading;

//////////////////
// FORM SUBMIT
document.querySelectorAll(".form").forEach((formEl) => {
  formEl.addEventListener("submit", function (e) {
    e.preventDefault();

    if (formEl.id === "segments-form") {
      segmentSettings(formEl);
    } else if (formEl.id === "polygons-form") {
      poligonSettings(formEl);
    } else if (formEl.id === "text-form") {
      textSettings(formEl);
    }
  });
});

// SEGMENTS FORM
function segmentSettings(formEl) {
  const inputs = formEl.querySelectorAll("input[type='number']");

  const values = {
    min: Number(inputs[0].value || inputs[0].placeholder),
    max: Number(inputs[1].value || inputs[1].placeholder),
    number: Number(inputs[2].value || inputs[2].placeholder),
  };

  settings.mode = "segments";
  settings.settings = {
    min: values.min,
    max: values.max,
    number: values.number,
  };

  if (boundaries.length > 0) {
    boundaries = [];
  }
  segmentsBoundaries(settings.settings);
  if (particles.length > 0) {
    particles = [];
  }
  particleGenerate();
}

// POLYGONS FORM
function poligonSettings(formEl) {
  const inputs = formEl.querySelectorAll("input[type='number']");

  const values = {
    minVertex: Number(inputs[0].value || inputs[0].placeholder),
    maxVertex: Number(inputs[1].value || inputs[1].placeholder),
    minRadius: Number(inputs[2].value || inputs[2].placeholder),
    maxRadius: Number(inputs[3].value || inputs[3].placeholder),
    number: Number(inputs[4].value || inputs[4].placeholder),
  };

  console.log("Polygons Form Values:", values);

  settings.mode = "polygons";
  settings.settings = {
    minVertex: values.minVertex,
    maxVertex: values.maxVertex,
    minRadius: values.minRadius,
    maxRadius: values.maxRadius,
    number: values.number,
  };

  if (boundaries.length > 0) {
    boundaries = [];
  }
  polygonBoundaries(settings.settings);
  if (particles.length > 0) {
    particles = [];
  }
  particleGenerate();
}

// TEXT FORM
function textSettings(formEl) {
  const text =
    formEl.querySelector("input[type='text']").value ||
    formEl.querySelector("input[type='text']").placeholder;
  const size = Number(
    formEl.querySelector("input[type='number']").value ||
      formEl.querySelector("input[type='number']").placeholder
  );

  console.log("Text Form Values:", { text, size });

  settings.mode = "text";
  settings.settings = {
    value: text,
    size: size,
  };

  if (boundaries.length > 0) {
    boundaries = [];
  }
  textBoundaries(settings.settings);
  if (particles.length > 0) {
    particles = [];
  }
  particleGenerate();
}

//////////////////////////
// COLOR FORM SELECT
const colorFormsContent = document.querySelectorAll(".color-form-content");
const colorForms = document.querySelectorAll(".color-form");

colorForms.forEach((e, i) => {
  e.addEventListener("click", () => {
    const wasAlreadyActive = e.classList.contains("active");
    colorForms.forEach((f) => f.classList.remove("active"));
    document.querySelectorAll(".color-form-content").forEach((el) => {
      el.classList.add("hidden");
      if (!wasAlreadyActive) {
        resetInputsToPlaceholder();
        if (i == 0) multicoloredSettings(colorForms[i]);
        else if (i == 1) monochromeSettings(colorForms[i]);
      }
    });
    e.classList.add("active");
    colorFormsContent[i].classList.remove("hidden");
  });
});

// MULTICOLORED SETTINGS
function multicoloredSettings(formEl) {
  settings.colors.mode = "multicolored";

  const backgroundInput = formEl.querySelector("input[type='color']");
  settings.colors.background =
    backgroundInput.value || backgroundInput.placeholder;

  const paletteSelect = formEl.querySelector("select");
  settings.colors.palette =
    COLOR_PALETTES[paletteSelect.value] || COLOR_PALETTES.vibrant;

  console.log("Multicolored Settings:", settings.colors);
  particleGenerate();
}

// MONOCHROME SETTINGS
function monochromeSettings(formEl) {
  const inputs = formEl.querySelectorAll("input");

  const particlesColor = inputs[0].value || "#FFFFFF";
  const backgroundColor = inputs[1].value || "#000000";

  settings.colors.mode = "monochrome";
  settings.colors.particles = particlesColor;
  settings.colors.background = backgroundColor;

  console.log("Monochrome Settings:", settings.colors);
  particleGenerate();
}

// CHANGE MULTICOLOR
document.getElementById("particle-multi").addEventListener("change", () => {
  multicoloredSettings(document.getElementById("multicolored-form"));
});

document.getElementById("bg-multi").addEventListener("change", () => {
  multicoloredSettings(document.getElementById("multicolored-form"));
});

// CHANGE monochrome
document.getElementById("particle-mono").addEventListener("change", () => {
  monochromeSettings(document.getElementById("monochrome-form"));
});

document.getElementById("bg-mono").addEventListener("change", () => {
  monochromeSettings(document.getElementById("monochrome-form"));
});

//////////////////////////
// CAMERA TOGGLE
document
  .getElementById("toggle-camera")
  .addEventListener("change", function () {
    showCamera = this.checked;
    document.getElementById("capture").classList.toggle("hidden");
    console.log("Camera Toggle:", showCamera);
  });

///////////////
// DOWNLOAD BUTTON
document.getElementById("download").addEventListener("click", function () {
  console.log("Downloading canvas...");
  saveCanvas("raycast_output", "png");
});

///////////////
// FORM OPEN/ CLOSE
const formsContent = document.querySelectorAll(".form-content");
const forms = document.querySelectorAll(".form");

forms.forEach((e, i) => {
  e.addEventListener("click", () => {
    const wasAlreadyActive = e.classList.contains("active");

    forms.forEach((f) => f.classList.remove("active"));
    document.querySelectorAll(".form-content").forEach((el, a) => {
      // nasconde tutti i contenuti
      el.classList.add("hidden");
      if (!wasAlreadyActive) {
        resetInputsToPlaceholder();
        if (i == 0) segmentSettings(forms[i]);
        else if (i == 1) poligonSettings(forms[i]);
        else if (i == 2) textSettings(forms[i]);
      }
    });
    e.classList.add("active");
    formsContent[i].classList.remove("hidden");
  });
});

///////////////
// RESET INPUTS
function resetInputsToPlaceholder() {
  document
    .querySelectorAll(
      '.form input[type="number"], .form input[type="text"], input[type="color"]'
    )
    .forEach((input) => {
      input.value = "";
    });

  document.querySelectorAll('input[type="color"]').forEach((input) => {
    input.value = input.placeholder;
  });

  document.querySelectorAll("select").forEach((s) => {
    s.selectedIndex = 0;
  });
}

///////////////
// POPUP
function fadeOut() {
  const interval = setInterval(() => {
    if (o <= 0) {
      clearInterval(interval); //when opacity is equal to zero the interval resets
      return;
    }
    o -= 0.05;
    document.getElementById("popup").style.opacity = o;
  }, 1);
}

// if the mouse is moved make the instructions fade
window.addEventListener("mousemove", () => {
  if (!hasMoved) {
    hasMoved = true;
    fadeOut();
  }
});

// else wait for 5 seconds and then fade
setTimeout(() => {
  if (!hasMoved) {
    hasMoved = true;
    fadeOut();
  }
}, 5000);

/////////

// winndow resize
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(handleResize, 100); //use a setTimeOut to await for the resize to finish before calling the function
});

function handleResize() {
  resizeCanvas(window.innerWidth, window.innerHeight);
  //reset particles and boundaries
  particles = [];
  boundaries = [];

  settings.mode = "segments";
  segmentsBoundaries(settings.settings);
  particleGenerate();
}
