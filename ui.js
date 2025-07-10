let settings = {
  mode: "",
  settings: {},
};

let showCamera;

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

// segments
function segmentSettings(formEl) {
  const inputs = formEl.querySelectorAll("input[type='number']");

  const values = {
    min: Number(inputs[0].value || inputs[0].placeholder),
    max: Number(inputs[1].value || inputs[1].placeholder),
    number: Number(inputs[2].value || inputs[2].placeholder),
  };

  console.log("Segments Form Values:", values);

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

// /////////////

// CAMERA TOGGLE
// showCamera = true;
document
  .getElementById("toggle-camera")
  .addEventListener("change", function () {
    showCamera = this.checked;
    console.log("Camera Toggle:", showCamera);
  });

//  /////////////

// DOWNLOAD BUTTON
document.getElementById("download").addEventListener("click", function () {
  console.log("Downloading canvas...");
  saveCanvas("raycast_output", "png");
});

//  /////////////

// FORM OPEN/ CLOSE
const formsContent = document.querySelectorAll(".form-content");
const forms = document.querySelectorAll(".form");

forms.forEach((e, i) => {
  e.addEventListener("click", () => {
    forms.forEach((f) => f.classList.remove("active"));
    document.querySelectorAll(".form-content").forEach((el, a) => {
      // nasconde tutti i contenuti
      el.classList.add("hidden");
      if (i == 0) segmentSettings(forms[i]);
      else if (i == 1) poligonSettings(forms[i]);
      else if (i == 2) textSettings(forms[i]);
    });
    e.classList.add("active");
    formsContent[i].classList.remove("hidden"); //tranne quello cliccato
  });
});

//
window.addEventListener("resize", () => {
  location.reload();
});

document.getElementById("instructions-btn").addEventListener("click", () => {
  document.getElementById("instructions-ctn").classList.toggle("hidden");
});
