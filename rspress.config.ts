// import * as path from 'node:path';
import {defineConfig} from 'rspress/config';

export default defineConfig({
  root: 'docs',
  // root: path.join(__dirname, 'docs'),
  title: '脚本库',
  description:"脚本工具集合",
  icon: './docs/public/rspress-logo.png',
  logoText:"脚本库",
  logo: {
    light: '/rspress-logo.png',
    dark: '/rspress-logo.png',
  },
  route: {
    cleanUrls: false,
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/HEEKDragonOne/script-home',
      }
    ],
    // 导航栏显示设置
    hideNavbar: 'auto',
    outlineTitle: '目录',
    prevPageText: '上一页',
    nextPageText: '下一页',
    enableContentAnimation: true,
    enableScrollToTop: true,
    enableAppearanceAnimation: true,
    outline: true,
    lastUpdated: true,
    lastUpdatedText: "上次更新时间",
    editLink: {
      text:"📝在 GitHub 上编辑此页",
      docRepoBaseUrl: "https://github.com/HEEKDragonOne/script-home",
    },
  },
  search: {
    codeBlocks: true,
  },
  markdown: {
    showLineNumbers: true,
  }
  // base: '/docs-polars-cn/'
});
