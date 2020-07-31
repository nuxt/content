---
title: Content とは
description: 'nuxt/contentモジュールを使ってNuxtJSアプリケーションを強化します。content/ディレクトリに書き込むことで、MongoDBのようなAPIを使ってMarkdown、JSON、YAML、CSVファイルを取得します。これはGitベースのヘッドレスCMSとして動作します。'
position: 1
category: 入門
features:
  - 開発モードでのビックリするほど高速なホットリロード
  - Markdownの中でVueコンポーネントを利用できます
  - 全文検索
  - 静的サイト生成(SSG)のサポート `nuxt generate`
  - 強力なクエリビルダーAPI (MongoDBライク)
  - PrismJSを利用した、Markdown内コードブロックのシンタックスハイライト
  - 目次の自動生成
  - Markdown, CSV, YAML, JSON(5)、XMLを適切に処理します
  - hooksによる拡張
---

`nuxt/content`モジュールを使ってNuxtJSアプリケーションを強化します。`content/`ディレクトリに書き込むことで、MongoDBのようなAPIを使ってMarkdown、JSON、YAML、XML、CSVファイルを取得します。これは**GitベースのヘッドレスCMS**として動作します。

## 特徴

<list :items="features"></list>

<p class="flex items-center">ライトテーマとダークテーマを試してみる: <app-color-switcher class="inline-flex ml-2"></app-color-switcher></p>

## 動画

Markdownページを表示するために `$content` と `<nuxt-content>` を使うデモ。

<video poster="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content_wxnjje.jpg" loop playsinline controls>
  <source src="https://res.cloudinary.com/nuxt/video/upload/q_auto/v1588091670/nuxt-content_wxnjje.webm" type="video/webm" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/q_auto/v1588091670/nuxt-content_wxnjje.mp4" type="video/mp4" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/q_auto/v1588091670/nuxt-content_wxnjje.ogv" type="video/ogg" />
</video>

ディレクトリ上で `$content()` を使うと、コンテンツの一覧表示、フィルタリング、検索を行うことができます。

<video poster="https://res.cloudinary.com/nuxt/video/upload/v1588095794/nuxt-content-movies_c0cq9p.jpg" loop playsinline controls>
  <source src="https://res.cloudinary.com/nuxt/video/upload/q_auto/v1588095794/nuxt-content-movies_c0cq9p.webm" type="video/webm" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/q_auto/v1588095794/nuxt-content-movies_c0cq9p.mp4" type="video/mp4" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/q_auto/v1588095794/nuxt-content-movies_c0cq9p.ogv" type="video/ogg" />
</video>
