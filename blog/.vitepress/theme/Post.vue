<script setup>
import { useData } from 'vitepress'

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter, page } = useData()
</script>

<template>
    <article>
        <Content />
    </article> 
</template>
