const express = require('express')
const path = require('path')
const { get } = require('request')
const fs = require('fs')
const { promisify } = require('util')

const app = express()

app.use(express.json(
  {limit: '50mb', extended: true}
))
app.use(express.urlencoded({ extended: true }))

const viewsDir = path.join(__dirname, 'views')
app.use(express.static(viewsDir))
app.use(express.static(path.join(__dirname, './public')))
app.use(express.static(path.join(__dirname, '../images')))
app.use(express.static(path.join(__dirname, '../media')))
app.use(express.static(path.join(__dirname, '../../weights')))
app.use(express.static(path.join(__dirname, '../../dist')))

app.get('/', (req, res) => res.redirect('/face_detection'))
app.get('/face_detection', (req, res) => res.sendFile(path.join(viewsDir, 'faceDetection.html')))
app.get('/face_landmark_detection', (req, res) => res.sendFile(path.join(viewsDir, 'faceLandmarkDetection.html')))
app.get('/face_expression_recognition', (req, res) => res.sendFile(path.join(viewsDir, 'faceExpressionRecognition.html')))
app.get('/face_extraction', (req, res) => res.sendFile(path.join(viewsDir, 'faceExtraction.html')))
app.get('/face_recognition', (req, res) => res.sendFile(path.join(viewsDir, 'faceRecognition.html')))
app.get('/video_face_tracking', (req, res) => res.sendFile(path.join(viewsDir, 'videoFaceTracking.html')))
app.get('/webcam_face_detection', (req, res) => res.sendFile(path.join(viewsDir, 'webcamFaceDetection.html')))
app.get('/webcam_face_landmark_detection', (req, res) => res.sendFile(path.join(viewsDir, 'webcamFaceLandmarkDetection.html')))
app.get('/webcam_face_expression_recognition', (req, res) => res.sendFile(path.join(viewsDir, 'webcamFaceExpressionRecognition.html')))
app.get('/bbt_face_landmark_detection', (req, res) => res.sendFile(path.join(viewsDir, 'bbtFaceLandmarkDetection.html')))
app.get('/bbt_face_similarity', (req, res) => res.sendFile(path.join(viewsDir, 'bbtFaceSimilarity.html')))
app.get('/bbt_face_matching', (req, res) => res.sendFile(path.join(viewsDir, 'bbtFaceMatching.html')))
app.get('/bbt_face_recognition', (req, res) => res.sendFile(path.join(viewsDir, 'bbtFaceRecognition.html')))
app.get('/batch_face_landmarks', (req, res) => res.sendFile(path.join(viewsDir, 'batchFaceLandmarks.html')))
app.get('/batch_face_recognition', (req, res) => res.sendFile(path.join(viewsDir, 'batchFaceRecognition.html')))
app.get('/bj', (req, res) => res.sendFile(path.join(viewsDir, 'BJFaceDetect.html')))

app.post('/fetch_external_image', async (req, res) => {
  const { imageUrl } = req.body
  if (!imageUrl) {
    return res.status(400).send('imageUrl param required')
  }
  try {
    const externalResponse = await request(imageUrl)
    res.set('content-type', externalResponse.headers['content-type'])
    return res.status(202).send(Buffer.from(externalResponse.body))
  } catch (err) {
    return res.status(404).send(err.toString())
  }
})

const avatarPathPrefix = '/Users/lena/Projects/2019/FacePaint/data/avatars/'
const snapshotPathPrefix = '/Users/lena/Projects/2019/FacePaint/data/snapshots/'

const writeFile = promisify(fs.writeFile)

function getExt(data_url){
  return data_url.split("data:image/")[1].split(";")[0];
}

// gets the base64 encoded image from the data url
function getBa64Img(data_url){
  return data_url.split(";base64,").pop();
}

app.post('/snapshot', async (req, res) => {
  let imDatas = req.body['avatars']
  if (imDatas === undefined) {
    console.log('avatar not found')
    return res.status(200).json({err: "avatar not found"})
  }
  let snapshotImg = req.body['snapshot']
  if (snapshotImg === undefined) {
    console.log('snapshot not found')
    return res.status(200).json({err: "snapshot not found"})
  }
  imDatas = Array.isArray(imDatas) ? imDatas: [imDatas]
  imDatas.forEach(async data => {
    let b64Data = data['data']
    let filename = data['filename']
    let err = await writeFile(avatarPathPrefix + filename + '.' + getExt(b64Data), getBa64Img(b64Data), 'base64')
    if (err !== undefined) {
      console.log('fail to save image')
      return res.status(200).json({'err': err})
    }
  });

  let _data = snapshotImg['data']
  let _fname = snapshotImg['filename']
  let err = await writeFile(
    snapshotPathPrefix + snapshotImg["filename"] + '.' + getExt(_data),
    getBa64Img(_data),
    'base64')
  if (err !== undefined) {
    console.log('fail to save snapshot')
    return res.status(200).json({'err': err})
  }

  return res.status(200).json({'err': ''})
})

app.listen(3000, () => console.log('Listening on port 3000!'))

function request(url, returnBuffer = true, timeout = 10000) {
  return new Promise(function(resolve, reject) {
    const options = Object.assign(
      {},
      {
        url,
        isBuffer: true,
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
        }
      },
      returnBuffer ? { encoding: null } : {}
    )

    get(options, function(err, res) {
      if (err) return reject(err)
      return resolve(res)
    })
  })
}