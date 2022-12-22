var fetchData = function (url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('success: ' + url)
      resolve('success: ' + url)
    }, 1000)
  })
}

class Pool {
  constructor(limit) {
    this.limit = limit
    this.queue = []
    this.current = 0
  }
  async activated() {
    if (this.current >= this.limit) {
      await new Promise((resolve) => this.queue.push(resolve))
    }
    this.current++
  }
  async disActivated() {
    this.current--
    if (this.queue.length > 0) this.queue.shift()()
  }
}

var multiRequest = function (urls, maxNum) {
  const pool = new Pool(maxNum)
  return Promise.all(
    urls.map(async (url) => {
      await pool.activated() // 申请并发
      const res = await fetchData(url)
      pool.disActivated() // 释放并发
      return res
    }),
  )
}

multiRequest(
  [
    'http://baidu.com/1',
    'http://baidu.com/2',
    'http://baidu.com/3',
    'http://baidu.com/4',
    'http://baidu.com/5',
    'http://baidu.com/6',
    'http://baidu.com/7',
    'http://baidu.com/8',
    'http://baidu.com/9',
    'http://baidu.com/10',
  ],
  3,
).then((res) => console.log)
