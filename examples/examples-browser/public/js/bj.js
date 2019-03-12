// import { ObjectDetection } from "../../../../dist/face-api";

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
    generateAvatarData(videoEl, results)
    var imgData = await generateAvatarData(videoEl, results)
    if (imgData.length > 0) {
      $("#avatar").attr('src', imgData[0])
    }
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

async function generateAvatarData(imgObj, results) {
  // const resizedDetetions = resizeCanvasAndResults(imgObj, $('#overlay').get(0), results)
  const resizedDetetions = results
  var detectionArray = Array.isArray(resizedDetetions)
    ? resizedDetetions
    : [resizedDetetions]
  imgData = []
  detectionArray.forEach(async function (det) {
    var box = det.box
    var data = await getImagePortion(imgObj, box)
    imgData.push(data)
  })

  return imgData
}

async function getImagePortion(imgObj, box) {
  let canvas = document.createElement('canvas')
  const scale = 2;
  canvas.width = box.width
  canvas.height = box.height
  let ctx = canvas.getContext('2d')
  
  let scaledBox = boxScaleCentered(box, scale)
  ctx.drawImage(
    imgObj,
    scaledBox.x, scaledBox.y, scaledBox.width, scaledBox.height,
    0, 0, box.width, box.height)
  return canvas.toDataURL();
}

function boxScaleCentered(box, scale) {
  var centerX = box.x + box.width / 2, centerY = box.y + box.height / 2
  var newW = box.width * scale, newH = box.height * scale
  return {
    x: centerX - newW / 2,
    y: centerY - newH / 2,
    width: newW,
    height: newH
  }
}

$(document).ready(function() {
  run()
})