// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { data } = await db.collection('room')
    .where( { 'room.roomid': event.roomid })
    .get()

  db.collection('room')
      .where({
        'room.roomid': event.roomid
      }).update({
        data: {
          room: {
            questvote: _.push(event.vote)
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