const app = getApp()

Page({
  data: {
    players: [],
    zoomid: String,
  },

  onLoad: function (query) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    };

    this.setData({
      zoomid: query.zoomid
    })

    const db = wx.cloud.database()
    db.collection('zoom').where({
      zoomid: this.data.zoomid
    }).get({
      success: function (res) {
        console.log(res.data)
      }
    })
    const watcher = db.collection('zoom')
      .where({
        zoomid: this.data.zoomid
      })
      .watch({
        onChange: function(snapshot) {
          console.log('query result snapshot after the event', snapshot.docs)
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