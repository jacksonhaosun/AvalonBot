const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    players: [],
    playerAvatars: [],
    docid: String,
    roomid: String,
    canStartGame: false,
    role: String,
    playerNumber: Number,
    character: String,
    info: String
  },

  onLoad: function (query) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    };

    this.setData({
      docid: query.id
    })
    console.log(this.data.docid)
    db.collection('room')
      .where({
        _id: this.data.docid
      }).get().then(res => {
        console.log(res)
        const index = res.data[0].room.players.indexOf(app.globalData.name)
        if (res.data[0].room.curPlayer == 1) {
          this.setData({
            roomid: res.data[0].room.roomid,
            role: "owner",
            playerNumber: index
          })
        }
        else {
          this.setData({
            roomid: res.data[0].room.roomid,
            role: "player",
            playerNumber: index
          })
        }
        // populate playerAvatars
        this.setData({
          playerAvatars:res.data[0].room["playerAvatars"]
        })
        // populate players
        this.setData({
          players:res.data[0].room["players"]
        })
      })

    // Watcher for player joining game
    const watcher = db.collection('room')
      .where({
        _id: this.data.docid
      })
      .watch({
        onChange: snapshot => {
          console.log(snapshot)
          const { docs, docChanges } = snapshot
          if (docChanges[0].dataType === 'update') {
            console.log('query result snapshot after the event', docs)

            // watch for player joining
<<<<<<< HEAD
            console.log(this.data.players);
            if (docChanges[0].updatedFields && docChanges[0].updatedFields.room.curPlayer) {
              if (docs[0].room.curPlayer === docs[0].room.maxPlayer && this.data.role === 'owner') {
                this.setData({
                  canStartGame: true,
                  playerAvatars: docs[0].room.playerAvatars,
                  players: docs[0].room.players,
                })
              }
              else if (docs[0].room.curPlayer === docs[0].room.maxPlayer) {
                
                this.setData({
                  playerAvatars: docs[0].room.playerAvatars,
                  players: docs[0].room.players,
=======
            if (docChanges[0].updatedFields && docChanges[0].updatedFields['room.curPlayer']) {
              this.setData({
                playerAvatars: docs[0].room.playerAvatars,
                players: docs[0].room.players,
              })
              console.log(this.data.players)
              if (docs[0].room.curPlayer === docs[0].room.maxPlayer && this.data.role === 'owner') {
                this.setData({
                  canStartGame: true,
>>>>>>> HL-clean-codo-base
                })
              }
            }

            // watch for team vote
            // TODO
            if (docChanges[0].updatedFields && docChanges[0].updatedFields['room.teamvote']) {
              if (doc[0].room.teamvote.length === doc[0].room.maxPlayer) {
                this.showTeamVoteResult(doc[0].room.teamvote)
              }
            }
          }
        },
        onError: function(err) {
          console.error(err);
        }
      })
      
  },

  startGame: function () {
    wx.cloud.callFunction({
      name: 'startGame',
      data: {
        roomid: this.data.roomid
      },
      success: res => {
        console.log('[云函数] [startGame]')
        console.log(res.result)
        const character = result[this.data.playerNumber].name
        const info = result[this.data.playerNumber].message
        this.setData({
          character: character,
          info: info,
        })
        wx.showModal({
          title: '你的角色是',
          content: character + '\n' + info,
          showCancel: false
        })
      },
      fail: err => {
        console.error('[云函数] [startGame] 调用失败', err)
      }
    })
  },

  voteTeam: function () {
    wx.cloud.callFunction({
      name: 'voteTeam',
      data: {
        roomid: this.data.roomid,
      },
      success: res => {
        console.log('[云函数] [voteTeam]')
        console.log(res.result)
      },
      fail: err => {
        console.error('[云函数] [voteTeam] 调用失败', err)
      }
    })
  },

  showTeamVoteResult: function(votes) {
    let approve = 0
    votes.forEach(vote => approve += vote)
    let title = success > votes.length/2 ? '发车成功' : '发车失败'
    let content = 'Approve: ' + approve + '\nReject: ' + votes.length - approve
    wx.showModal({
      title: title,
      content: content,
      showCancel: false
    })
  },
})