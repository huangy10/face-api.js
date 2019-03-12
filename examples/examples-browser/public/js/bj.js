import { ObjectDetection } from "../../../../dist/face-api";

const videoWidth = 1920
const videoHeight = 1080


async function onPlay() { 
  const videoEl = $('#inputVideo').get(0)
  if (videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded()) {
    return setTimeout(() => onPlay())
  }
  let inputSize = 256
  let scoreThreshold = 0.5
  // const options = getFaceDetectorOptions()
  const options = new faceapi.TinyFaceDetectorOptions({inputSize, scoreThreshold})
  const results = await faceapi.detectAllFaces(videoEl, options)
  if (results.length !== 0)  {
    drawDetections(videoEl, $('#overlay').get(0), results)
  }
  setTimeout(()=>onPlay())
}

async function run() {
  await changeFaceDetectorFlag(TINY_FACE_DETECTOR)
  // changeInputSize(128)
  await getCurrentFaceDetectionNet().load('/')

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: videoWidth, height: videoHeight,
      deviceId: "4fad1d8224e145a5153f193a572f9012d34a864eb97172b1cf274548c3b58dd2"
    }
  })
  const videoEl = $('#inputVideo').get(0)
  videoEl.srcObject = stream
}

async function generateAvatarData(results) {
  const resizedDetetions = resizeCanvasAndResults(videoEl, $('#overlay').get(0), results)
  var detectionArray = Array.isArray(results)
    ? results
    : [results]
  imgData = []
  detectionArray.forEach(function (det) {
    var box = det instanceof ObjectDetection ? det.box : det
    var data = getImagePortion(videoEl, box)
    imgData.push(data)
  })

  return imgData
}

async function getImagePortion(imgObj, box) {
  let canvas = document.createElement('canvas')
  canvas.width = box.width
  canvas.height = box.height
  let ctx = canvas.getContext("2d")
  
  canvas.drawImage(
    imgObj,
    box.x, box.y, box.width, box.height,
    0, 0, box.width, box.height)
  return canvas.toDataURL();
}

$(document).ready(function() {
  run()
})