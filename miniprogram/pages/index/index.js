//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    isDisabled: true,
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                logged: true,
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
              })
              app.globalData.name = res.userInfo.nickName
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onCreateGame: function(e) {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'createGame',
      data: {creator: {
        nickName: this.data.userInfo.nickName,
        avatarUrl: this.data.userInfo.avatarUrl},
        maxPlayer: Number(e.detail.value.input)},
      success: res => {
        console.log('[云函数] [createGame]')
        console.log(res.result)
        if (res.result === "房间人数为5-10人") {
          wx.showToast({
            title: res.result,
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.redirectTo({
            url: '../game/game?id=' + res.result,
          })
        }
      },
      fail: err => {
        console.error('[云函数] [createGame] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  onJoinGame: function(e) {
    wx.cloud.callFunction({
      name: 'joinGame',
      data: {
        roomid: e.detail.value.input,
        player: {
          nickName: this.data.userInfo.nickName,
          avatarUrl: this.data.userInfo.avatarUrl
        }
      },
      success: res => {
        console.log('[云函数] [joinGame]')
        if (res.result == 'does not exist') {
          wx.showToast({
            title: '房间不存在',
            icon: 'none',
            duration: 2000
          })
        } else if (res.result == 'full') {
          wx.showToast({
            title: '房间已满',
            icon: 'none',
            duration: 2000
          })
        }
          else {
          console.log(res.result)
          wx.redirectTo({
            url: '../game/game?id=' + res.result,
          })
        }
      },
      fail: err => {
        console.error('[云函数] [joinGame] 调用失败', err)
      }
    })
  }
})
