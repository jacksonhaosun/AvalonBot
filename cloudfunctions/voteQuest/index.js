// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { data } = await db.collection('room')
    .where( { 'room.roomid': event.roomid })
    .get()
  let questvote = data[0].room.questvote === undefined ? [] : data[0].room.questvote
  questvote.push(event.vote)
  db.collection('room')
      .where({
        'room.roomid': event.roomid
      }).update({
        data: {
          room: {
            questvote: questvote
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