import { defineStore } from 'pinia'

const getUserInfo = () => {
  return new Promise<any>((resolve) => {
    setTimeout(() => {
      resolve({ name: 'JunCong', age: 23 })
    }, 1000)
  })
}

// defineStore第一个参数是id, 必须且值卫衣
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      name: 'JayChou',
      age: 18
    }
  }),
  getters: {
    newName: (state) => state.userInfo.name + ' vip'
  },
  actions: {
    async pdateUserInfo() {
      try {
        const res = await getUserInfo()
        this.userInfo = res
      } catch {
        //
      }
    }
  },

  // 开启数据持久化
  // 当更新state值时，会默认存储到localStorage中
  persist: true

  // 默认存储到localStorage的key值就是store模块id值。可以修改key值和存储位置
  // 将persist: true,改为
  // persist: {
  //   key: 'storekey', // 修改存储的键名，默认为当前 Store 的 id
  //   storage: window.sessionStorage, // 存储位置修改为 sessionStorage
  // },

  // 默认会将store中的所有字段都缓存，可以通过paths点符号路径数组指定要缓存的字段
  // persist: {
  //   paths: ['userInfo.name'], //存储userInfo的name
  // },
})
