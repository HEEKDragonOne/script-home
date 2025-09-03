// import * as path from 'node:path';
import {defineConfig} from 'rspress/config';

export default defineConfig({
  root: 'docs',
  // root: path.join(__dirname, 'docs'),
  title: 'Polars中文指南',
  description:"polars-python中文指南",
  icon: './docs/public/polars.svg',
  logoText:"Polars中文指南",
  logo: {
    light: '/polars.svg',
    dark: '/polars.svg',
  },
  route: {
    cleanUrls: false,
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/HEEKDragonOne/polars-doc',
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
      docRepoBaseUrl: "https://github.com/HEEKDragonOne/polars-doc",
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
