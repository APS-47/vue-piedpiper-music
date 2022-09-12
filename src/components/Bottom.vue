// 底部模块
<template>
  <div class="bottom">
    <!-- 左侧歌曲详情方格 -->
    <div class="music-box">
      <!-- onselectstart="return false" 为的是避免多次点击左下角歌曲封面的时候出现蓝色选中效果 -->
      <div class="img-wrap el-icon-arrow-up"
           :class="{'el-icon-arrow-down':this.hoverImg==false}"
           @click="toSongDetail()"
           title="打开音乐详情页"
           onselectstart="return false">
        <img :src="globalMusicInfo.imgUrl ? globalMusicInfo.imgUrl : defaultImg"
             alt="">
      </div>
      <div class="music-info"
           v-show="globalMusicInfo.songName">
        <span class="music-name"
              :title="globalMusicInfo.songName">{{globalMusicInfo.songName}}</span>

        <div class="music-singer">
          <span v-for="(singer,i) in globalMusicInfo.artistInfo"
                :key="i+99">{{singer.name}} </span>
        </div>
      </div>
      <span class="music-name"
            v-show="!globalMusicInfo.songName"
            style="line-height:50px">还没有播放音乐哦</span>
    </div>
    <div class="download"
         title="下载"
         @click="downloadSong">
      <div style="font-size: 22px;color:#5292fe;margin:20px -10px 0px 10px;">
        <span class="el-icon-download"></span>
      </div>
    </div>
    <Audio :musicUrl="globalMusicUrl"
           @timeupdate="updateTime"
           @play="playStatus"
           @pause="pauseStatus"
           @next="next"
           @prev="prev"
           @end="next"></Audio>

    <!-- el-tooltip会在#app外生成一个dom -->
    <!-- <el-tooltip content="播放队列" placement="top" effect="light"> -->
    <!-- 播放列表 -->
    <div @click="showQueue($event)"
         ref="queue"
         title="播放队列"
         :class="{'delete-queue-style bofangliebiao'
        :this.queueStyle=='delete','add-queue-style bofangliebiao'
        :this.queueStyle=='add','bofangliebiao'
        :this.queueStyle=='normal'}">
      <span class="iconfont icon-yinleliebiao"></span>
      <span>{{musicQueue.length}}</span>
    </div>
    <!-- </el-tooltip> -->
    <!-- 用于下载的a标签 -->
    <a :href="playMusicInfo.url"
       :download="playMusicInfo.name"
       target="_blank"
       id="downloadCurrentMusic"></a>
  </div>
</template>

<script scoped>
import Audio from './Audio.vue'
import { downloadMusic } from "../utils/request";
export default {
  data () {
    return {
      defaultImg: require("@/assets/imgs/defaultImg.png"),
      musicUrl: "",
      currentTime: 0,
      playMusicInfo: {
        name: "",
        url: "",
      },
      hoverImg: 'true'
    }
  },
  components: {
    Audio
  },
  props: {
    // 父组件传参，调用props算是方便的，但是子组件，孙组件通过this.$parent.$parent.xxx = 'xx'改变过于复杂，用Vuex优化
    // musicUrl:String,
    // musicInfo:Object
  },
  computed: {
    globalMusicUrl () {
      return this.$store.state.globalMusicUrl
    },
    globalMusicInfo () {
      return this.$store.state.globalMusicInfo
    },
    musicQueue () {
      return this.$store.state.musicQueue
    },
    nowIndex () {
      return this.$store.state.nowIndex
    },
    queueStyle () {
      return this.$store.state.queueStyle
    },
    playSongInfo () {
      return this.$store.state.playSongInfo
    }
  },
  mounted () {
    this.changeQueuePostion()
    window.onresize = () => this.changeQueuePostion()
  },
  methods: {
    // 点击下载按钮下载正在播放的音乐
    downloadSong () {
      let current = this.playSongInfo
      downloadMusic({ url: current.playsongUrl })
        .then(res => {
          // mp3文件进行媒体流处理再挂载到a标签进行下载
          let url = URL.createObjectURL(res.data);
          let a = document.querySelector("#downloadCurrentMusic");
          this.playMusicInfo.url = url;
          this.playMusicInfo.name = current.playsongName;
          this.$nextTick(() => {
            a.click();
            // 用完释放URL对象
            URL.revokeObjectURL(url);
          });
        })
        .catch(err => {
          this.$message.error("下载失败,请稍后重试!");
        });

    },
    changeQueuePostion () {
      if (this.$refs.queue.getBoundingClientRect) {
        // console.log(that.$refs.queue.getBoundingClientRect())
        let pos = {
          top: Math.floor(this.$refs.queue.getBoundingClientRect().top),
          left: Math.floor(this.$refs.queue.getBoundingClientRect().left)
        }
        this.$store.commit("changeQueuePos", pos)
      }
    },
    toSongDetail () {
      if (this.globalMusicUrl) {
        this.$parent.show = !this.$parent.show
        this.hoverImg = !this.hoverImg
        console.log(this.hoverImg);
      }
      else
        this.$message({
          showClose: true,
          message: '还没有播放音乐哦',
          type: 'error'
        });
    },
    updateTime (e) {
      this.currentTime = e.target.currentTime
    },
    pauseStatus () {
      this.$store.commit('changeMusicStatus', true)
    },
    playStatus () {
      this.$store.commit('changeMusicStatus', false)
    },
    showQueue (e) {
      this.$parent.showQueue = !this.$parent.showQueue
      console.log(`logo x:${e.x}, y:${e.y}`)
    },
    next () {
      if (this.musicQueue.length == 0)
        this.$message({
          type: 'warning',
          message: '播放列表是空的~',
          showClose: true
        })
      else {
        if (this.musicQueue.length == 1) {
          // 若播放列表只有一首歌 则单曲循环
          this.currentTime = 0
          let musicUrl = this.globalMusicUrl
          this.$store.commit('changeMusicUrl', "")
          setTimeout(() => {
            this.$store.commit('changeMusicUrl', musicUrl)
          }, 0);
        } else {
          let ids = []
          for (const item of this.musicQueue) {
            ids.push(item.id)
          }
          // console.log(ids)
          let nowIndex = ids.indexOf(this.globalMusicInfo.id)
          // console.log(nowIndex)
          let nextIndex = (nowIndex + 1) % this.musicQueue.length
          // let nextId = this.musicQueue[nextIndex].id
          this.$store.commit('changeNowIndex', nextIndex)
          this.$store.commit('changeMusicStatus', false)
        }
      }
    },
    prev () {
      if (this.musicQueue.length == 0)
        this.$message({
          type: 'warning',
          message: '播放列表是空的~',
          showClose: true
        })
      else {
        if (this.musicQueue.length == 1) {
          this.currentTime = 0
          let musicUrl = this.globalMusicUrl
          this.$store.commit('changeMusicUrl', "")
          setTimeout(() => {
            this.$store.commit('changeMusicUrl', musicUrl)
          }, 0);
        } else {
          let ids = []
          for (const item of this.musicQueue) {
            ids.push(item.id)
          }
          let nowIndex = ids.indexOf(this.globalMusicInfo.id)
          let prevIndex = (nowIndex - 1) % this.musicQueue.length < 0 ? ((nowIndex - 1) % this.musicQueue.length + this.musicQueue.length) : (nowIndex - 1) % this.musicQueue.length
          this.$store.commit('changeNowIndex', prevIndex)
          this.$store.commit('changeMusicStatus', false)
        }
      }
    }
  },
  watch: {
    currentTime () {
      this.$store.commit('changeCurrentTime', this.currentTime)
    },
    globalMusicInfo () {
      let obj = {
        musicUrl: this.globalMusicUrl,
        ...this.globalMusicInfo
      }
      this.$store.commit('changeMusicQueue', obj)
    },
  },
}
</script>

<style>
.add-queue-style {
  animation-name: addAni;
  animation-duration: 0.3s;
  animation-direction: alternate-reverse;
  transform: scale(1);
}

@keyframes addAni {
  to {
    color: #5292fe;
    transform: scale(1.5);
  }
}

.add-queue-style::before {
  content: "+1";
  position: absolute;
  top: -8px;
  left: -20px;
  transform: scale(0.8);
  font-weight: bold;
}

.delete-queue-style {
  animation-name: deleteAni;
  animation-duration: 0.3s;
  animation-direction: alternate-reverse;
  transform: scale(1);
}

@keyframes deleteAni {
  to {
    color: green;
    transform: scale(1.5);
  }
}

.delete-queue-style::before {
  content: "-1";
  position: absolute;
  top: -8px;
  left: -20px;
  transform: scale(0.8);
  font-weight: bold;
}

.bottom {
  display: flex;
  align-items: center;
  background-color: #f1f3f4;
  box-shadow: 0px -2px 2px rgba(0, 0, 0, 0.3);

  position: relative; /* 防止被覆盖 */
  /* #f1f3f4 */
}

.bottom audio {
  width: 100%;
  outline: none;
}

.music-box {
  display: flex;
  padding: 5px;
  box-sizing: border-box;
}

.music-box .img-wrap {
  width: 50px;
  height: 50px;
  margin-right: 10px;
  cursor: pointer;
  position: relative;
}

.music-box .img-wrap::before {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
  color: #fff;
  border-radius: 5px;
  display: none;
}

.music-box .img-wrap:hover::before {
  display: flex;
}

.music-box .img-wrap img {
  height: 100%;
  border-radius: 5px;
}

.music-name {
  font-size: 14px;
  width: 150px;
  display: block;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 6px;
}

.music-singer {
  margin-top: 5px;
  font-size: 12px;
  width: 150px;
  display: block;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bofangliebiao {
  margin-right: 100px;
  font-size: 12px;
  cursor: pointer;
}

.bofangliebiao span:nth-of-type(1) {
  font-size: 22px;
}
</style>