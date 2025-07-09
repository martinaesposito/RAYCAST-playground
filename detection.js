//original code from https://www.youtube.com/watch?v=BX8ibqq0MJU

// detections is a global variable that contains the hand detection information
//for now I keep the bject though I know I will probably only use one hand at a time
let detections = {};
const videoElement = document.getElementById("capture");

function gotHands(results) {
  detections = results;
  //console.log(detections);
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

hands.onResults(gotHands);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  // do your detections on a lower resolution for better performance (but slightly reduced accuracy)
  width: 320,
  height: 240,
});
camera.start();
