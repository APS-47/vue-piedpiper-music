// 播放功能模块
<template>
  <div class="audio-wrap">
    <audio :src="musicUrl"
           controls
           autoplay
           ref="audio"
           style="display:none"
           @canplay="getDuration"
           @timeupdate="updateTime"
           @ended="onEnded"
           您的浏览器不支持audio标签></audio>
    <div class="audio-left">
      <!-- 音乐播放控制按钮 -->
      <div class="audio-btns">
        <div class="play-box">
          <span class="iconfont icon-shangyishou"
                title="上一首"
                @click="prev"></span>
        </div>
        <div class="play-box"
             v-if="!isPaused">
          <span class="iconfont icon-play"
                id="play"
                title="播放"
                @click="changeStatus('play')"></span>
        </div>
        <div class="play-box"
             v-if="isPaused">
          <span class="iconfont icon-pause"
                id="pause"
                title="暂停"
                @click="changeStatus('pause')"></span>
        </div>
        <div class="play-box">
          <span class="iconfont icon-xiayishou"
                title="下一首"
                @click="next"></span>
        </div>
      </div>
      <!-- 音乐播放进度条 -->
      <div class="audio-progress">
        <span>{{currentTime | timeFormat}}</span>
        <div class="block">
          <el-slider v-model="currentTime"
                     :max="duration"
                     :show-tooltip="false"
                     @change="changeCurrentTime"
                     @mousedown.native="isDrag = true"
                     @mouseup.native="isDrag = false"></el-slider>
        </div>
        <span>{{duration | timeFormat}}</span>
      </div>
    </div>

    <div class="audio-right">
      <div class="slot"></div>
      <!-- 音量控制 -->
      <div class="audio-voice">
        <span class="iconfont icon-yinliang"
              v-if="voice"
              @click="voice=0"></span>
        <span class="iconfont icon-jingyin"
              v-if="!voice"
              @click="voice=(cacheVoice == 0 ? 0.7 : cacheVoice)"></span>
        <div class="block">
          <!-- 音量滑动条 -->
          <el-slider v-model="voice"
                     :max=1
                     :step=0.01
                     :show-tooltip="true"
                     @input="changeVolume"
                     @change="changeCacheVolume"
                     :format-tooltip="formatTooltip"></el-slider>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      currentTime: 0,
      duration: 0,
      isPaused: false,
      isDrag: false, //添加判断是否拖拽，可解决拖动超过1s出现的bug
      voice: 0.7,
      cacheVoice: 0.7
    }
  },
  props: {
    musicUrl: String
  },
  methods: {
    changeStatus (option) {
      if (option == 'play') {
        if (this.musicUrl) {
          this.isPaused = !this.isPaused
          this.$refs.audio.play()
          this.$emit('play')
        } else {
          this.$message({
            type: 'error',
            message: '还没有播放音乐哦',
            showClose: true
          })
        }
      } else {
        this.isPaused = !this.isPaused
        this.$refs.audio.pause()
        this.$emit('pause')
      }
    },
    changeCurrentTime () {
      // 存在拖动进度条歌词不随着滚动的bug
      this.$refs.audio.currentTime = this.currentTime
      this.isDrag = false
      // this.changeStatus(this.isPaused?'play':'pause')
    },
    updateTime (e) {
      // console.log(e.target.currentTime)
      if (!this.isDrag) {
        this.currentTime = e.target.currentTime
        this.$emit('timeupdate', event)
      }
    },
    getDuration (e) {
      // console.log(e.target.duration)
      this.duration = e.target.duration

      // 下面两句会导致在暂停时滑动进度条使得按钮状态改变，图片旋转而不播放的bug
      // this.isPaused = true
      // this.$emit('play')
    },
    changeVolume () {
      this.$refs.audio.volume = this.voice
    },
    changeCacheVolume () {
      // 设置缓存音量,点击静音恢复至该音量，如缓存也为0，恢复默认0.7
      this.cacheVoice = this.voice
    },
    formatTooltip (val) {
      return val * 100 + "%";
    },
    onEnded () {
      // this.isPaused = false
      // this.$emit('pause')
      this.$emit('end')
    },
    next () {
      this.$emit('next')
    },
    prev () {
      this.$emit('prev')
    }

  },
  filters: {
    timeFormat (time) {
      let min = parseInt(time / 60).toString().padStart(2, '0')
      let second = parseInt(time - min * 60).toString().padStart(2, '0')
      return min + ":" + second
    },
  },
  watch: {
    voice () {
      if (!this.voice) {
        this.$refs.audio.muted = true
      } else
        this.$refs.audio.muted = false
    },
    musicUrl () {
      if (this.musicUrl)
        this.isPaused = true
      else {
        this.isPaused = false
        this.duration = 0
        this.$refs.audio.currentTime = 0
        this.currentTime = 0
      }
    }
  }
}
</script>

<style>
.audio-wrap {
  width: 1100px;
  min-width: 400px;
  height: 100%;
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
}

.audio-left {
  flex: 1;
  display: flex;
  align-items: center;
}
.audio-btns .play-box:first-child,
.audio-btns .play-box:last-child {
  width: 30px;
  height: 30px;
  line-height: 30px;
  vertical-align: middle;
}

.play-box {
  display: inline-block;
  width: 40px;
  height: 40px;
  line-height: 40px;
  border-radius: 40px !important;
  background-color: #5292fe;
  color: white;
  margin: 0px 5px;
}

.audio-btns span {
  cursor: pointer;
  font-size: 20px;
  padding: 5px;
  border-radius: 10px;
}

#play,
#pause {
  padding-left: 10px;
}

.play-box:hover {
  background-color: rgba(82, 146, 254, 0.5);
}

.audio-progress {
  display: flex;
  width: 700px;
  margin-left: 30px;
}

.audio-progress span {
  display: flex;
  font-size: 18px;
  padding: 0px 10px;
  align-items: center;
}

.block {
  flex: 1;
  margin: 0 10px;
}

.el-slider__bar {
  background-color: #5292fe !important;
}

.el-slider__button {
  border-color: #5292fe !important;
  width: 8px !important;
  height: 8px !important;
}

.audio-right {
  display: flex;
  /* width: 20%; */
  /* min-width: 100px; */
  /* margin-left: 50px; */
}

.slot {
  height: 50%;
}

.audio-voice {
  display: flex;
  align-items: center;
  width: 150px;
}

.audio-voice span {
  cursor: pointer;
  margin-right: 10px;
}
</style>