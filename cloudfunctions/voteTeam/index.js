// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { data } = await db.collection('room')
    .where( { roomid })
    .get()
  let teamvote = data[0].room.teamvote
  if (teamvote.length == data[0].room.maxPlayer) {
    teamvote = [event.vote]
  }
  else {
    teamvote.push(event.vote)
  }
  db.collection('room')
      .where({
        'room.roomid': event.roomid
      }).update({
        data: {
          room: {
            teamvote: teamvote
          }
        }
      })
      
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}