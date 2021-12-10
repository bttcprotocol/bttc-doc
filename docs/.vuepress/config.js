module.exports = {
  title: 'BitTorrent-Chain',
  description: 'BitTorrent-Chain Documentation',
  base: '/v1/doc/',
  theme: '',
  locales: { 
    '/': { 
      lang: 'en-US',
      label: 'English',
      title: 'BitTorrent-Chain Developer Documentation',
      description: 'BitTorrent-Chain Developer Documentation'
    },
    '/traditional/': {
      lang: 'zh-HK',
      label: '繁體中文',
      title: 'BitTorrent-Chain 開發文檔',
      description: 'BitTorrent-Chain 開發和使用手冊'
    },
    '/simplified/': {
      lang: 'zh-CN',
      label: '简体中文',
      title: 'BitTorrent-Chain 开发文档',
      description: 'BitTorrent-Chain 开发和使用手册'
    }
  },
  themeConfig: {
    locales: {
      '/': {
        selectText: 'Select Language',
        label: 'English',
        sidebar : {
          '/': [
            '', 
            'architecture', 
            'wallets',
            'jsonrpc',
            'testnet',
            'tools',
            'dapp',
            'tron-bttc',
            'del-val',
            'node',
            // 'sentry',
            // 'validator/node',
            'validator/faq'
          ]
        }
      },
      '/simplified/': {
        selectText: '选择语言',
        label: '简体中文',
        sidebar: {
          '/simplified' : [
            '/simplified/', 
            '/simplified/architecture', 
            '/simplified/wallets',
            '/simplified/jsonrpc',   
            '/simplified/testnet',
            '/simplified/tools',
            '/simplified/dapp',
            '/simplified/tron-bttc',
            '/simplified/del-val',
            '/simplified/node',
            // '/simplified/sentry',
            // '/simplified/validator/node',
            '/simplified/validator/faq'
          ]
        }
      },
      '/traditional/': {
        selectText: '選擇語言',
        label: '繁體中文',
        sidebar: {
          '/traditional' : [
            '/traditional/', 
            '/traditional/architecture', 
            '/traditional/wallets',
            '/traditional/jsonrpc',   
            '/traditional/testnet',
            '/traditional/tools',
            '/traditional/dapp',
            '/traditional/tron-bttc',
            '/traditional/del-val',
            '/traditional/node',
            // '/traditional/sentry',
            // '/traditional/validator/node',
            '/traditional/validator/faq'
          ]
        }
      },
      sidebar: 'auto',
      sidebarDepth: 4,
    },
    markdown: {
      anchor: {
        permalink: true,
        permalinkBefore: true,
        permalinkSymbol: '#'
      }
    },
  },
  head: [
    ['link', {
      rel: 'icon',
      href: '/bttc.png'
    }]
  ]
}
