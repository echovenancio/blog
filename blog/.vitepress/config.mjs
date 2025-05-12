import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/blog/",
  title: "echovenancio",
  description: "Blog pessoal",
  themeConfig: {
        lastUpdatedText: 'Ultima vez editado'
    },
  markdown: {
        math: true,
        theme: 'vitesse-light',
        config: (md) => {
        }
  },
  lastUpdated: true,
  lang: 'pt-BR',
  appearance: true,
})
