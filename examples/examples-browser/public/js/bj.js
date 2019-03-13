// import { ObjectDetection } from "../../../../dist/face-api";

const videoWidth = 1920
const videoHeight = 1080
var frameCount = 0

async function onPlay() { 
  requestAnimationFrame(onPlay)

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
    console.log(results.length)
    drawDetections(videoEl, $('#overlay').get(0), results)
    // faceapi.drawDetection($('#overlay').get(0), results)
    // generateAvatarData(videoEl, results)
    if (frameCount % 30 === 0) {
      var imgData = await generateAvatarData(videoEl, results)
      if (imgData.length > 0) {
        $("#avatar").attr('src', imgData[0])
        uploadAvatars(imgData)
      }
    }
  }
  frameCount += 1
  // setTimeout(()=>onPlay())
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

async function uploadAvatars(results) {
  if (results === undefined || results.length === 0) {
    return
  }
  var fileData = []
  results.forEach((d, idx)=>{
    fileData.push({
      filename: `${frameCount}-${idx}`,
      data: d
    })
  })
  var dataToUpload = {
    ts: Date.now(),
    avatars: fileData
  }

  $.ajax({
    url: 'http://localhost:3000/snapshot',
    type: 'POST',
    data: JSON.stringify(dataToUpload),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    async: true,
    success: function(msg) {
      console.log('success')
    },
    error: function(err) {
      console.log(err)
    }
  })
}

$(document).ready(function() {
  run()
})