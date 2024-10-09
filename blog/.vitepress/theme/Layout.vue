<script setup>
import { useData } from 'vitepress'
import Home from './Home.vue'
import Post from './Post.vue'
// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter, page } = useData()
</script>

<template>
  <h1>Custom Layout</h1>
  <Home v-if="frontmatter.layout === 'home'"/>
  <Post v-else-if="frontmatter.layout === 'post'" />
</template>
