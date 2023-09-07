<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user'
import axios from 'axios'

const { userInfo, newName } = storeToRefs(useUserStore())

const request = axios.create({
  baseURL: '/api'
})
request.get('/user/list')
</script>

<template>
  <div class="user">
    <el-button type="primary" icon="Edit">点击</el-button>
    <h2>Hello World!</h2>
    <p>name: {{ userInfo.name }}</p>
    <p>age: {{ userInfo.age }}</p>
    <p>newName: {{ newName }}</p>
  </div>
</template>

<style lang="scss" scoped></style>
