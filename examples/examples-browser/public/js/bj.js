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
  canvas.width = box.width
  canvas.height = box.height
  let ctx = canvas.getContext('2d')
  
  ctx.drawImage(
    imgObj,
    box.x, box.y, box.width, box.height,
    0, 0, box.width, box.height)
  return canvas.toDataURL();
}

$(document).ready(function() {
  run()
})