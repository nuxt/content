---
title: История изменений
description: 'Узнайте о изменениях между версиями модуля @nuxt/content.'
position: 8
category: Начало
---

## v2.0.0

### Markdown плагины

<base-alert>
  markdown.basePlugins и markdown.plugins были заменены на markdown.remarkPlugins и markdown.rehypePlugins.
</base-alert>

- В режиме разработки, вы можете использовать [редактирование в реальном времени](/displaying#live-editing) для вашего контента.
- Переопределение параметров плагинов все еще возможно, но с префиксом `remark` или `rehype`, к примеру `externalLinks` превращается в `remarkExternalLinks`.
- Теперь вы можете переопределить все плагины или добавить новый плагин, используя `remarkPlugins` / `rehypePlugins`.
- Вы можете использовать локальные плагины используя `~/plugins/remark-plugin.js`.
- Вы можете зарегистрировать и настроить плагин одной строкой, к примеру `['remark-plugin', { option: 1 }]`.

Подробности описаны в [этом разделе](/configuration#markdown).
