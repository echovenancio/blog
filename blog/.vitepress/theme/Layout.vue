<script setup>
import { useData } from 'vitepress'
import Home from './Home.vue'
import Post from './Post.vue'
const { site, frontmatter, page, theme } = useData()
</script>

<template>
    <div class="grid">
    <main class="container">
    <Home v-if="frontmatter.layout === 'home'"/>
    <Post v-else-if="frontmatter.layout === 'post'" />
    </main>
    <footer class="container secondary">
        <div>
        </div>
    </footer>
    </div>
</template>
