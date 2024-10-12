<script setup>
import { useData } from 'vitepress'

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter, page } = useData()
</script>

<template>
    <article>
        <span><- <a href="/blog/">Voltar para pagina principal.</a></span>
        <hr>
        <Content />
    </article> 
</template>
