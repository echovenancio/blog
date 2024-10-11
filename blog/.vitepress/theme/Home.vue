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
  <p class="secondary">*Esse site é propositalmente simples por questões de disponibilidade e acessibilidade.</p>
  </article>
</template>
