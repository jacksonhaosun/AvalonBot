// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const roomid = event.roomid
  const _ = db.command

  return db.collection('room')
  .where({ 'room.roomid': roomid })
  .get()
  .then(res => {
    if (res.data.length == 0) {
      return 'does not exist'
    }
    if (res.data[0].room.maxPlayer > res.data[0].room.curPlayer && res.data[0].room.players.find((nickName) => nickName === event.player.nickName) === undefined) {
      return db.collection('room').where({
        'room.roomid': roomid
      })
      .update({
        data: {
          room: {
            players: _.push(event.player.nickName),
            playerAvatars: _.push(event.player.avatarUrl),
            curPlayer: _.inc(1)
          }
        }
      }).then(r => {
        return res.data[0]._id
      })
    } else {
      if (res.data[0].room.maxPlayer <= res.data[0].room.curPlayer && res.data[0].room.players.find((nickName) => nickName === event.player.nickName) === undefined) {
        return 'full'
      }
      return res.data[0]._id
    } 
  })
  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}