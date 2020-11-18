const video = document.getElementById('video')

const happy = document.getElementById('happy')
const sad = document.getElementById('sad')
const angry = document.getElementById('angry')
const fearful = document.getElementById('fearful')
const disgusted = document.getElementById('disgusted')
const surprised = document.getElementById('surprised')
const neutral = document.getElementById('neutral')

const baseUrl = '/emojifier'

const startVideo = async () => {

    try {
        video.srcObject = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        })

    } catch (e) {
        console.error(e)
    }

}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(baseUrl + '/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri(baseUrl + '/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri(baseUrl + '/models'),
    faceapi.nets.faceExpressionNet.loadFromUri(baseUrl + '/models')
]).then(startVideo)


const bestExpression = (expressions) => {
    const keys = Object.keys(expressions)
    const sorted = keys.sort((a, b) => expressions[b] - expressions[a])
    console.log(sorted)
    if (sorted[0] == "neutral" && expressions["neutral"] < 0.8) {
        return sorted[1]
    } else {
        return sorted[0]
    }
}


const getEmojiByExpression = (expression) => {
    switch (expression) {
        case "surprised":
            return surprised
        case "disgusted":
            return disgusted
        case "angry":
            return angry
        case "sad":
            return sad
        case "neutral":
            return neutral
        case "happy":
            return happy
        case "fearful":
            return fearful
        default:
            return neutral
    }
}


const drawEmoji = (expression, context, x0, y0, width, height) => {

    const emoji = getEmojiByExpression(expression)

    context.drawImage(emoji, x0, y0, width, height)

}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.getElementById('emoji__canvas').append(canvas)
    //document.body.append(canvas)

    const displaySize = { width: video.width, height: video.height }

    faceapi.matchDimensions(canvas, displaySize)

    const options =  new faceapi.TinyFaceDetectorOptions()

    let oldDetections

    setInterval(async () => {

        const detections = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceExpressions()

        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        if (resizedDetections.length > 0) {
            oldDetections = resizedDetections
        }

        const context = canvas.getContext('2d')
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        oldDetections.forEach(detection => {
            const x0 = detection.alignedRect._box._x
            const y0 = detection.alignedRect._box._y
            const width = detection.alignedRect._box._width
            const height = detection.alignedRect._box._height
            const expression = bestExpression(detection.expressions)

            drawEmoji(expression, context, x0, y0, width, height)

        })

        //console.log(resizedDetections)

    }, 10)
})