import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "SQLSeal Charts",
  description: "Charts extension for SQLSeal",
  base: '/sql-seal-charts/',
  head: [
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/sql-seal/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/sql-seal/favicon-16x16.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/sql-seal/apple-touch-icon.png' }],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quick Start', link: '/quick-start' }
    ],
    search: {
      provider: 'local'
    },
    logo: '/logo.svg',

    sidebar: [
      {
        text: 'Documentation',
        items: [
          { text: 'Quick Start', link: '/quick-start' },
          { text: 'Syntax', link: '/syntax' },
          { text: 'Advanced Mode', link: '/advanced-mode' },
          { text: 'Data Analysis Features', link: '/data-analysis-features' }


        ]
      },
      {
        text: 'Chart Types',
        items: [
          { text: 'Line Chart', link: '/chart-type/line-chart' },
          { text: 'Bar Chart', link: '/chart-type/bar-chart' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/h-sphere/sql-seal' },
      { icon: 'discord', link: 'https://discord.gg/ZMRnFeAWXb' },
      { icon: 'bluesky', link: 'https://bsky.app/profile/hypersphereblog.bsky.social' }
    ],
    footer: {
      message: '',
      copyright: 'By <a href="https://hypersphere.blog">hypersphere</a>.<br/>Sponsor Me: <a href="https://ko-fi.com/hypersphere">Ko-Fi</a>'
    }
  }
})
