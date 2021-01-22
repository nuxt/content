---
title: Вступление
description: 'Прокачайте ваше NuxtJS приложение с модулем @nuxt/content: пишите в директории content/ и получайте ваши Markdown, JSON, YAML и CSV файлы через MongoDB подобное API, работает как базирующаяся на Git безголовая CMS.'
position: 1
category: Начало
features:
  - Потрясающе быстрая горячая перезагрузка в режиме разработки
  - Vue компоненты внутри Markdown
  - Полнотекстовый поиск
  - Поддержка статической генерации через `nuxt generate`
  - Мощный API конструктора запросов (MongoDB подобный)
  - Подсветка синтаксиса для блоков кода в файлах markdown с помощью PrismJS.
  - Генерация оглавления
  - Работает с Markdown, CSV, YAML, JSON(5), XML
  - Расширяется с помощью собственных парсеров
  - Расширяется с помощью хуков
---

Прокачайте ваше NuxtJS приложение с модулем `@nuxt/content`: пишите в директории `content/` и получайте ваши Markdown, JSON, YAML и CSV файлы через MongoDB подобное API, работает как **базирующаяся на Git безголовая CMS**.

## Особенности

<list :items="features"></list>

<p class="flex items-center">Попробуйте светлую и темную темы: <app-color-switcher class="inline-flex ml-2"></app-color-switcher></p>

## Видео

Демонстрация использования `$content` и `<nuxt-content>` для отображения Markdown страниц:

<video poster="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content_wxnjje.jpg" loop playsinline controls>
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content_wxnjje.webm" type="video/webm" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content_wxnjje.mp4" type="video/mp4" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588091670/nuxt-content_wxnjje.ogv" type="video/ogg" />
</video>

Использование `$content()` для получения списка, фильтрации и поиска контента:

<video poster="https://res.cloudinary.com/nuxt/video/upload/v1588095794/nuxt-content-movies_c0cq9p.jpg" loop playsinline controls>
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588095794/nuxt-content-movies_c0cq9p.webm" type="video/webm" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588095794/nuxt-content-movies_c0cq9p.mp4" type="video/mp4" />
  <source src="https://res.cloudinary.com/nuxt/video/upload/v1588095794/nuxt-content-movies_c0cq9p.ogv" type="video/ogg" />
</video>

## Отзывы

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Adding an FAQ to <a href="https://twitter.com/turnaudio?ref_src=twsrc%5Etfw">@TurnAudio</a> using <a href="https://twitter.com/nuxt_js?ref_src=twsrc%5Etfw">@nuxt_js</a> nuxt/content. Really great module for organizing a little bit of content within your static website <a href="https://t.co/o2uA9Lvmuu">https://t.co/o2uA9Lvmuu</a></p>&mdash; Lee Martin (@leemartin) <a href="https://twitter.com/leemartin/status/1290374428107341830?ref_src=twsrc%5Etfw">August 3, 2020</a></blockquote>

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Wanted to try out <a href="https://twitter.com/nuxt_js?ref_src=twsrc%5Etfw">@nuxt_js</a> new content theme doc, was a blast!<br><br>Managed to hack its interals to extend its Tailwind config with mine hihihi... <a href="https://t.co/fuXXOBKXYE">pic.twitter.com/fuXXOBKXYE</a></p>&mdash; lihbr (@li_hbr) <a href="https://twitter.com/li_hbr/status/1289536277897834497?ref_src=twsrc%5Etfw">August 1, 2020</a></blockquote>

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">On an upper <a href="https://twitter.com/nuxt_js?ref_src=twsrc%5Etfw">@nuxt_js</a> is the most exciting thing in web for me right now, everything they put out is golden. The content module is phenomenal.</p>&mdash; Liam Hall - Three Bears (@wearethreebears) <a href="https://twitter.com/wearethreebears/status/1289345099214725120?ref_src=twsrc%5Etfw">July 31, 2020</a></blockquote>

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">I&#39;ve been working on a new portfolio/blog today with <a href="https://twitter.com/tailwindcss?ref_src=twsrc%5Etfw">@tailwindcss</a> and <a href="https://twitter.com/nuxt_js?ref_src=twsrc%5Etfw">@nuxt_js</a>. I&#39;m blown away by Nuxt Content.</p>&mdash; Cameron Baney (@cameronbaney) <a href="https://twitter.com/cameronbaney/status/1289671455559413761?ref_src=twsrc%5Etfw">August 1, 2020</a></blockquote>

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Docs powered by the new <a href="https://twitter.com/nuxt_js?ref_src=twsrc%5Etfw">@nuxt_js</a> content plugin and stored in <a href="https://twitter.com/Netlify?ref_src=twsrc%5Etfw">@Netlify</a> what a time to be a developer</p>&mdash; Alfonso Bribiesca (@alfonsobries) <a href="https://twitter.com/alfonsobries/status/1288653236833062913?ref_src=twsrc%5Etfw">July 30, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">The new vee-validate v4 documentation is using <a href="https://twitter.com/nuxt_js?ref_src=twsrc%5Etfw">@nuxt_js</a> content module and so far it is too damn good 🔥<br><br>I like being able to create my own layouts and &quot;on this page&quot; and &quot;menu&quot; components, in other words, to be in full control 🎮</p>&mdash; Abdelrahman Awad (@logaretm) <a href="https://twitter.com/logaretm/status/1287526576847048705?ref_src=twsrc%5Etfw">July 26, 2020</a></blockquote>

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Decided to build a blog with <a href="https://twitter.com/nuxt_js?ref_src=twsrc%5Etfw">@nuxt_js</a> content module. I mean, it&#39;s rapid and lightning quick to setup. Super nice experience thus far 👌</p>&mdash; 𝖊𝖗𝖉 (@erd_xyz) <a href="https://twitter.com/erd_xyz/status/1286395125447483394?ref_src=twsrc%5Etfw">July 23, 2020</a></blockquote>

<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
