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
            'network',
            'architecture', 
            'wallets',
            'testnet',
            'tools',
            'dapp',
            'mapping',
            'tron-bttc',
            'del-val',
            'node',
            'fullnode',
            'validator-node-system-requirements',
            'snapshots-instructions',
            'contract',
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
            '/simplified/network',
            '/simplified/architecture', 
            '/simplified/wallets',   
            '/simplified/testnet',
            '/simplified/tools',
            '/simplified/dapp',
            '/simplified/mapping',
            '/simplified/tron-bttc',
            '/simplified/del-val',
            '/simplified/node',
            '/simplified/fullnode',
            '/simplified/validator-node-system-requirements',
            '/simplified/snapshots-instructions',
            '/simplified/contract',
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
            '/traditional/network',
            '/traditional/architecture', 
            '/traditional/wallets',   
            '/traditional/testnet',
            '/traditional/tools',
            '/traditional/dapp',
            '/traditional/mapping',
            '/traditional/tron-bttc',
            '/traditional/del-val',
            '/traditional/node',
            '/traditional/fullnode',
            '/traditional/validator-node-system-requirements',
            '/traditional/snapshots-instructions',
            '/traditional/contract',
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
