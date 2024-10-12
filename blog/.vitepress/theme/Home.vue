<script setup>
import { useData } from 'vitepress'

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter, page } = useData()
</script>

<template>
  <article>
  <hgroup>
    <h1>ECHOVENANCIO</h1>
    <p>Programação e afins.</p>
  </hgroup>
  <hr>
  <h3>POSTS</h3>
  <Content />
  </article>
</template>
