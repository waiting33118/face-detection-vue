<template>
  <section class="display">
    <video
      ref="videoEl"
      autoplay="true"
      playsinline
      @loadedmetadata="runModel"
    />
    <canvas ref="canvasEl" />
    <li class="board">
      <ul
        v-for="(item,key) in board"
        :key="key"
      >
        {{ key }} ： {{ item }}
      </ul>
    </li>
  </section>
</template>

<script>
import * as faceAPI from 'face-api.js'
import { onMounted, reactive, ref } from 'vue'
export default {
  name: 'Video',
  setup () {
    const initParams = reactive({
      modelUri: '/models',
      onlineModelUri: 'https://github.com/waiting33118/face-detection-vue/tree/main/public/models',
      option: new faceAPI.SsdMobilenetv1Options({ minConfidence: 0.5 })
    })
    const constraints = reactive({
      video: {
        width: {
          min: 320,
          ideal: 1280,
          max: 1920
        },
        height: {
          min: 240,
          ideal: 720,
          max: 1080
        },
        frameRate: {
          min: 15,
          ideal: 30,
          max: 60
        },
        facingMode: 'environment'
      }
    })
    const videoEl = ref(null)
    const canvasEl = ref(null)
    const board = reactive({
      realTimeCounts: 0,
      male: 0,
      female: 0
    })

    /**
       * @function
       * @description detect input video
       */
    const runModel = async () => {
      const result = await faceAPI.detectAllFaces(videoEl.value, initParams.option).withAgeAndGender()
      if (result) {
        const dims = faceAPI.matchDimensions(canvasEl.value, videoEl.value, true)
        const resizeResults = faceAPI.resizeResults(result, dims)
        console.log(resizeResults)
        board.realTimeCounts = resizeResults.length
        board.male = resizeResults.filter(data => data.gender === 'male').length
        board.female = resizeResults.filter(data => data.gender === 'female').length
        faceAPI.draw.drawDetections(canvasEl.value, resizeResults)
      }
      setTimeout(() => runModel())
    }

    onMounted(() => {
      /**
       * @function
       * @description load the trained model
       */
      const initModel = async () => {
        await faceAPI.nets.ssdMobilenetv1.loadFromUri(initParams.modelUri)
        await faceAPI.nets.ageGenderNet.loadFromUri(initParams.modelUri)
        await faceAPI.nets.ssdMobilenetv1.loadFromUri(initParams.onlineModelUri)
        await faceAPI.nets.ageGenderNet.loadFromUri(initParams.onlineModelUri)
      }

      /**
       * @function
       * @description startup webcam
       */
      const startStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints)
          videoEl.value.srcObject = stream
        } catch (error) {
          console.error(error.message)
        }
      }

      initModel()
      startStream()
    })

    return {
      videoEl,
      canvasEl,
      runModel,
      board
    }
  }
}
</script>

<style lang="scss" scoped>
.display{
  width: 100%;
  height: 100vh;
  position: relative;
  >video {
    position: absolute;
    object-fit: cover;
    width: 100%;
    height: 100vh;
  }
  >canvas {
    position: absolute;
    z-index: 10;
    width: 100%;
    height: 100%;
  }
  >.board{
    font-size: 30px;
    list-style: none;
    background-color: rgba(255, 255, 255, 0.65);
    border-radius: 10px;
    left: 10px;
    padding: 15px;
    position: absolute;
    top: 10px;
    z-index: 20;
  }
}
</style>
