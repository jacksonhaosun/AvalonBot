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
    info: String,
    questResult: [],
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
        console.log("name is " + app.globalData.name + " index " + index)
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
            if (docChanges[0].updatedFields && docChanges[0].updatedFields['room.curPlayer']) {
              this.setData({
                playerAvatars: docs[0].room.playerAvatars,
                players: docs[0].room.players,
              })
              console.log(this.data.players)
              if (docs[0].room.curPlayer === docs[0].room.maxPlayer && this.data.role === 'owner') {
                this.setData({
                  canStartGame: true,
                })
              }
            }
            
            // watch for game start
            if (docChanges[0].updatedFields && docChanges[0].updatedFields['room.roles']) {
              console.log('game started!')
              var otherString = docs[0].room.roles[this.data.playerNumber].otherUsers.map(index => {
                return docs[0].room.players[index]
              }).join(",")
              this.setData({
                character: docs[0].room.roles[this.data.playerNumber].name,
                info: docs[0].room.roles[this.data.playerNumber].message + "\n" + otherString,
              })
              this.showCharacterInfo()
            }

            // watch for team vote
            if (docChanges[0].updatedFields && docChanges[0].updatedFields['room.teamvote']) {
              if (docs[0].room.teamvote.length === docs[0].room.maxPlayer) {
                this.showTeamVoteResult(doc[0].room.teamvote)
              }
            } 

            // watch for quest result
            if (docChanges[0].updatedFields && docChanges[0].updatedFields['room.questvote']) {
              const questNumber = docs[0].room.questNumber;
              const questArray = docs[0].room.questArray;
              if (docs[0].room.questvote.length == questArray[questNumber]) {
                const requireTwoFail = docs[0].room.maxPlayer >= 7 && docs[0].room.questNumber == 3
                this.showQuestResult(docs[0].room.questvote, requireTwoFail)
                // go to next quest, done by owner
                if(this.data.role === 'owner') {
                  this.updateQuestNumber()
                }
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
      },
      fail: err => {
        console.error('[云函数] [startGame] 调用失败', err)
      }
    })
  },
  
  showCharacterInfo: function () {
    wx.showModal({
      title: '你的角色是',
      content: this.data.character + '\n' + this.data.info,
      showCancel: false
    })
  },

  voteTeamApprove: function () {
    console.log(this.data.roomid)
    wx.cloud.callFunction({
      name: 'voteTeam',
      data: {
        roomid: this.data.roomid,
        vote: 1,
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

  voteTeamReject: function () {
    console.log(this.data.roomid)
    wx.cloud.callFunction({
      name: 'voteTeam',
      data: {
        roomid: this.data.roomid,
        vote: 0,
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

  showQuestResult: function(questvote, requireTwoFail) {
    let success = 0
    questvote.forEach(vote => success += vote)
    let title = requireTwoFail ? (success >= questvote.length-1 ? '任务成功' : '任务失败') : (success = questvote.length ? '任务成功' : '任务失败')

    const questResult = this.data.questResult
    questResult.push(title)
    this.setData({
      questResult: questResult
    })
    wx.showModal({
      title: title,
      showCancel: false
    })
  },

  updateQuestNumber: function () {
    wx.cloud.callFunction({
      name: 'updateQuestNumber',
      data: {
        roomid: this.data.roomid
      },
      success: res => {
        console.log('[云函数] [updateQuestNumber]')
        console.log(res.result)
      },
      fail: err => {
        console.error('[云函数] [updateQuestNumber] 调用失败', err)
      }
    })
  },
})