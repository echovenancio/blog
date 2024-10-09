<script setup>
import { useData } from 'vitepress'

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter, page } = useData()
</script>

<template>
  <hgroup>
    <h1>echovenancio</h1>
    <p>*Esse site é propositalmente simples por questões de disponibilidade e acessibilidade</p>
  </hgroup>
  <Content />
</template>
