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
    video: {width: videoWidth, height: videoHeight}
  })
  const videoEl = $('#inputVideo').get(0)
  videoEl.srcObject = stream
}

async function takeSnaphot() {
  var canvas = document.createElement('canvas')
  canvas.width = videoWidth
  canvas.height = videoHeight
  var ctx = canvas.getContext('2d')
  var videoEl = $('#inputVideo').get(0)
  
  ctx.drawImage(videoEl, 0, 0, 1920, 1080)
  var imgData = canvas.toDataURL('image/jpg')
  
}

$(document).ready(function() {
  run()
})