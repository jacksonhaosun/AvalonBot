const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    players: [],
    docid: String,
    roomid: String,
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
        this.setData({roomid: res.data[0].room.roomid})
      })

    const watcher = db.collection('room')
      .where({
        _id: this.data.docid
      })
      .watch({
        onChange: snapshot => {
          console.log(snapshot)
          const { docs, docChanges } = snapshot
          if(docChanges[0].dataType === 'update') {
            console.log('query result snapshot after the event', docs)
          }
          
          // this.setData({
          //   players: [snapshot.docs]
          // })
        },
        onError: function(err) {
          console.error(err);
        }
      })
  }
})