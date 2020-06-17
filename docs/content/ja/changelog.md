---
title: 変更ログ
description: 'nuxt/contentモジュールの異なるバージョンの変更点を学びます'
position: 8
category: 入門
---

## v2.0.0

### Markdown plugins

<base-alert>
  markdown.basePluginsとmarkdown.pluginsは削除されました。代わりにmarkdown.remarkPluginsとmarkdown.rehypePluginsを利用してください。
</base-alert>

- プラグインオプションのオーバーライドは接頭辞に`remark` / `rehype`を使用することで引き続き実行できます。たとえば、`externalLinks`は`remarkExternalLinks`になります。
- `remarkPlugins` / `rehypePlugins`を利用することで、プラグインをオーバーライドしたり、新しいプラグインを追加することができるようになりました。
- `~/plugins/remark-plugin.js`でローカルプラグインを利用できます。
- `['remark-plugin', { option: 1 }]`のようにして、一行でプラグインの登録と設定が完了します。

完全なドキュメントは[ここ](/ja/configuration#markdown)にあります。
