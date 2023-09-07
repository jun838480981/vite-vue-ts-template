// 手写Promise
class JCPromise {
  constructor(executor) {
    // 初始化状态为pending
    this.status = 'pending'
    // 初始化成功的值为undefined
    this.value = undefined
    // 初始化失败的原因为undefined
    this.reason = undefined
    // 初始化成功处理函数队列
    this.onFulfilledCallbacks = []
    // 初始化失败处理函数队列
    this.onRejectedCallbacks = []

    // 定义resolve方法
    const resolve = (value) => {
      // 只有在pending状态才能更改状态和值
      if (this.status === 'pending') {
        this.status = 'fulfilled'
        this.value = value

        // 执行所有成功处理函数
        this.onFulfilledCallbacks.forEach((cb) => cb())
      }
    }

    // 定义reject方法
    const reject = (reason) => {
      // 只有在pending状态才能更改状态和原因
      this.status = 'rejected'
      this.reason = reason

      // 执行所有失败处理函数
      this.onRejectedCallbacks.forEach((cb) => cb())
    }

    // 立即执行执行器函数
    try {
      executor(resolve, reject)
    } catch (error) {
      // 如果执行执行器函数抛出异常，将Promise状态更改伟rejected
      reject(error)
    }
  }

  // 实现Promise.resolve和Promise.reject静态方法
  static resolve(value) {
    if (value instanceof JCPromise) {
      return value
    }
    return new JCPromise((resolve) => {
      resolve(value)
    })
  }
  static reject(reason) {
    return new JCPromise((resolve, reject) => {
      reject(reason)
    })
  }

  // 实现Promise.all和Promise.race静态方法
  static all(promises) {
    return new JCPromise((resolve, reject) => {
      const result = []
      let resolveCount = 0

      promises.forEach((promise, index) => {
        JCPromise.resolve(promise).then(
          (value) => {
            result[index] = value
            resolveCount++
            if (resolveCount === promises.length) {
              // 全部处理成功返回结果数组
              resolve(result)
            }
          },
          (reason) => {
            reject(reason)
          }
        )
      })
    })
  }
  static race(promises) {
    return new JCPromise((resolve, reject) => {
      promises.forEach(
        (promise) => {
          JCPromise.resolve(promise).then((value) => {
            resolve(value)
          })
        },
        (reason) => {
          reject(reason)
        }
      )
    })
  }

  // 实现Promise.allSettled和Promise.any静态方法
  static allSettled(promises) {
    return new JCPromise((resolve) => {
      const result = []
      let settledCount = 0

      promises.forEach((promise, index) => {
        JCPromise.resolve(promise).then(
          (value) => {
            result[index] = { status: 'fulfilled', value }
            settledCount++
            if (settledCount === promises.length) {
              resolve(result)
            }
          },
          (reason) => {
            result[index] = { status: 'rejected', reason }
            settledCount++
            if (settledCount === promises.length) {
              resolve(result)
            }
          }
        )
      })
    })
  }
  static any(promises) {
    return new JCPromise((resolve, reject) => {
      const errors = []
      let rejectedCount = 0

      promises.forEach((promise, index) => {
        JCPromise.resolve(promise).then(
          (value) => {
            resolve(value)
          },
          (reason) => {
            errors[index] = reason
            rejectedCount++
            if (rejectedCount === promises.length) {
              reject(new AggregateError(errors, 'All promise were rejected'))
            }
          }
        )
      })
    })
  }

  // 实现then方法
  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : (value) => value
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (reason) => {
            throw reason
          }

    // 创建一个新的Promise实例，称为promise2
    const promise2 = new JCPromise((resolve, reject) => {
      if (this.status === 'fulfilled') {
        // 使用setTimeout保证异步调用
        setTimeout(() => {
          try {
            // 调用onFulfilled，并获取返回值
            const x = onFulfilled(this.value)
            // 使用返回值x和新的promise实例promise2来处理resolve和reject
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            // 如果处理函数抛出异常，则将promise2状态改为rejected
            reject(error)
          }
        })
      } else if (this.status === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      } else if (this.status === 'pending') {
        // 如果当前promise状态仍然伟pending，将处理函数加入相应的队列中
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        })

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        })
      }
    })

    // 返回新的Promise实例，以便链式调用
    return promise2
  }

  // 实现catch方法
  catch(onRejected) {
    // 调用then方法，仅传入失败的处理函数
    return this.then(null, onRejected)
  }

  // 实现finally方法
  finally(callback) {
    // 调用then方法，传入两个相同的处理函数
    return this.then(
      (value) => {
        // 创建一个新的Promise实例，确保异步执行callback
        return JCPromise.resolve(callback()).then(() => value)
      },
      (reason) => {
        // 创建一个新的Promise实例，确保异步执行callback
        return JCPromise.reject(callback()).then(() => {
          throw reason
        })
      }
    )
  }
}

// resolvePromise 辅助函数
function resolvePromise(promise2, x, resolve, reject) {
  // 1.如果promise2 和 x 相同，抛出TypeError
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle delected for promise'))
  }

  // 标记是否已调用，防止多次调用
  let called = false

  // 2.如果x是JCPromise实例
  if (x instanceof JCPromise) {
    // 根据x的状态调用resolve 或 reject
    x.then(
      (y) => {
        resolvePromise(promise2, y, resolve, reject)
      },
      (reason) => {
        reject(reason)
      }
    )
  } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // 3. 如果x是对象或者函数
    try {
      // 获取x的then方法
      const then = x.then
      // 如果then是函数
      if (typeof then === 'function') {
        // 使用x作为上下文调用then方法
        then.call(
          x,
          (y) => {
            // 成功回调
            if (called) return // 已调用直接返回
            called = true
            // 递归处理y
            resolvePromise(promise2, y, resolve, reject)
          },
          (reason) => {
            // 失败回调
            if (called) return
            called = true
            reject(reason)
          }
        )
      } else {
        // 如果then不是函数
        // 直接调用resolve
        resolve(x)
      }
    } catch (error) {
      // 如果获取或调用then方法抛出异常
      if (called) return
      called = true
      reject(error)
    }
  } else {
    // 4. 如果x不是对象或者函数
    // 直接调用resolve
    resolve(x)
  }
}

export default new JCPromise()
