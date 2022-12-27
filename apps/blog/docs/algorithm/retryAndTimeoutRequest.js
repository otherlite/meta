var fetchData = function () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const num = Math.ceil(Math.random() * 20)
      if (num < 10) {
        console.log(`num 小于 10，执行成功 n=${num}`)
        resolve(num)
      } else {
        console.log(`num 大于等于 10，执行失败 n=${num}`)
        reject(num)
      }
    }, 2000)
  })
}

var request = function (timeout = 5000, retry = 5) {
  return new Promise((resolve, reject) => {
    let flag = true
    const time = setTimeout(() => {
      flag = false
      reject('timeout')
    }, timeout)
    const retryRequest = (retry) => {
      return fetchData()
        .then((res) => {
          resolve(res)
          clearTimeout(time)
        })
        .catch((res) => {
          if (retry > 0 && flag) {
            retryRequest(retry - 1)
          } else {
            reject(res)
          }
        })
    }
    retryRequest(retry)
  })
}

request()
  .then((res) => {
    console.log(`请求成功`, res)
  })
  .catch((res) => {
    console.log(`请求失败`, res)
  })
