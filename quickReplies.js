module.exports = [
  {
    type: 'text',
    text: '1. 年代を教えてください',
    quickReply: {
      items: [
        { type: 'action', action: { type: 'message', label: '10代', text: '10代' } },
        { type: 'action', action: { type: 'message', label: '20代', text: '20代' } },
        { type: 'action', action: { type: 'message', label: '30代', text: '30代' } }
      ]
    }
  },
  {
    type: 'text',
    text: '2. 性別を教えてください',
    quickReply: {
      items: [
        { type: 'action', action: { type: 'message', label: '男性', text: '男性' } },
        { type: 'action', action: { type: 'message', label: '女性', text: '女性' } }
      ]
    }
  },
  {
    type: 'text',
    text: '3. 希望勤務地を教えてください',
    quickReply: {
      items: [
        { type: 'action', action: { type: 'message', label: '一都三県', text: '一都三県' } },
        { type: 'action', action: { type: 'message', label: '大阪', text: '大阪' } },
        { type: 'action', action: { type: 'message', label: '愛知・福岡', text: '愛知・福岡' } },
        { type: 'action', action: { type: 'message', label: 'その他', text: 'その他' } }
      ]
    }
  },
  {
    type: 'text',
    text: '4. 最終学歴を教えてください',
    quickReply: {
      items: [
        { type: 'action', action: { type: 'message', label: '中卒', text: '中卒' } },
        { type: 'action', action: { type: 'message', label: '高卒', text: '高卒' } },
        { type: 'action', action: { type: 'message', label: '短大・専門卒', text: '短大・専門卒' } },
        { type: 'action', action: { type: 'message', label: '4大卒', text: '4大卒' } }
      ]
    }
  },
  {
    type: 'text',
    text: '5. 経験社数を教えてください',
    quickReply: {
      items: [
        { type: 'action', action: { type: 'message', label: '0社', text: '0社' } },
        { type: 'action', action: { type: 'message', label: '1~2社', text: '1~2社' } },
        { type: 'action', action: { type: 'message', label: '3社', text: '3社' } },
        { type: 'action', action: { type: 'message', label: '4社以上', text: '4社以上' } }
      ]
    }
  },
  {
    type: 'text',
    text: '6. 職種を教えてください',
    quickReply: {
      items: [
        { type: 'action', action: { type: 'message', label: '営業', text: '営業' } },
        { type: 'action', action: { type: 'message', label: 'エンジニア', text: 'エンジニア' } },
        { type: 'action', action: { type: 'message', label: '事務・受付', text: '事務・受付' } },
        { type: 'action', action: { type: 'message', label: 'その他の職種', text: 'その他の職種' } }
      ]
    }
  },
  {
    type: 'text',
    text: '7. あてはまるものを教えてください',
    quickReply: {
      items: [
        { type: 'action', action: { type: 'message', label: '年収UP', text: '年収UP' } },
        { type: 'action', action: { type: 'message', label: '未経験OK', text: '未経験OK' } },
        { type: 'action', action: { type: 'message', label: '自分に合う仕事が知りたい', text: '自分に合う仕事が知りたい' } },
        { type: 'action', action: { type: 'message', label: 'ワークライフバランス重視', text: 'ワークライフバランス重視' } }
      ]
    }
  },
  {
    type: 'text',
    text: '8. 転職理由（自由記述）を教えてください'
  }
];
