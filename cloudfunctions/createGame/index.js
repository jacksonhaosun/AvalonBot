// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

function genRandomNumber() {
  return (Math.floor(100000 + Math.random() * 900000)).toString()
}

async function createNewGame(maxPlayer, creator) {
  const roomid = genRandomNumber()
  const { data } = await db.collection('room')
    .where( { roomid })
    .get()
  if (data.length) {
    return this.createNewGame(maxPlayer, creator)
  }

  let room = {
    roomid,
    maxPlayer: maxPlayer,
    curPlayer: 1,
    createTimestamp: Date.now().toString(),
    players: [creator.nickName.substring(0,5)],
    playerAvatars: [creator.avatarUrl]
  }
  return db.collection('room').add({
    data: {
      room
    }
    }).then(res => {
      return res._id
    })
}
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if (event.maxPlayer < 5 || event.maxPlayer > 10) {
    return "房间人数为5-10人"
  } else {
    return createNewGame(event.maxPlayer, event.creator)
  }
}