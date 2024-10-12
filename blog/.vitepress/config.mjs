import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/blog/",
  title: "echovenancio",
  description: "Blog pessoal",
  themeConfig: {
        footer: {
        },
        lastUpdatedText: 'Ultima vez editado'
    },
  markdown: {
        theme: 'vitesse-light',
        config: (md) => {
        }
  },
  lastUpdated: true,
  lang: 'pt-BR',
  appearance: true,
})
