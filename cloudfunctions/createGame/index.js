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
  
  const zooms = db.collection('zoom')
  console.log(event.data)

  return zooms.add({
    data: {
      zoomid: "123",
      players: [event.creator],
    }
    }).then(res => {
      return "123"
    })
}