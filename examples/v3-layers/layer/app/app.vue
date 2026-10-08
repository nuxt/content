<template>
  <div class="layout">
    <aside>
      <NuxtLink :to="localePath('/')">
        <strong>Home</strong>
      </NuxtLink>

      <nav class="locales">
        <NuxtLink
          v-for="item in locales"
          :key="item.code"
          :to="switchLocalePath(item.code)"
        >
          {{ item.name }}
        </NuxtLink>
      </nav>

      <template
        v-for="section in sections"
        :key="section.label"
      >
        <h3>{{ section.label }}</h3>
        <ul>
          <li
            v-for="item in section.items"
            :key="item.path"
          >
            <NuxtLink
              v-if="!item.children?.length"
              :to="item.path"
            >
              {{ item.title }}
            </NuxtLink>
            <template v-else>
              <span class="group">{{ item.title }}</span>
              <ul>
                <li
                  v-for="child in item.children"
                  :key="child.path"
                >
                  <NuxtLink :to="child.path">
                    {{ child.title }}
                  </NuxtLink>
                </li>
              </ul>
            </template>
          </li>
        </ul>
      </template>
    </aside>

    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { NavigationItem } from 'comark-content'

const { locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const code = computed(() => locale.value.replace('-', '_'))

// `docs_<locale>` is declared by the layer's `content.config.ts`, `changelog_<locale>` by the project's.
const { data: docsNav } = await useAsyncData(
  () => `nav-docs-${code.value}`,
  () => queryCollectionNavigation(`docs_${code.value}` as any),
)
const { data: changelogNav } = await useAsyncData(
  () => `nav-changelog-${code.value}`,
  () => queryCollectionNavigation(`changelog_${code.value}` as any),
)

// Navigation trees are rooted at `/`, so unwrap the single-child nodes down to
// the collection prefix (`/en` → `/en/docs`) to list its pages directly.
function unwrap(tree: NavigationItem[] | null | undefined, prefix: string): NavigationItem[] {
  let items = tree ?? []
  while (items.length === 1 && items[0]!.children?.length && prefix.startsWith(items[0]!.path)) {
    items = items[0]!.children
  }
  return items
}

const sections = computed(() => [
  { label: 'Docs (layer)', items: unwrap(docsNav.value, `/${locale.value}/docs`) },
  { label: 'Changelog (project)', items: unwrap(changelogNav.value, `/${locale.value}/changelog`) },
])
</script>

<style>
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}

.layout {
  display: flex;
  min-height: 100vh;
}

aside {
  width: 280px;
  flex-shrink: 0;
  padding: 1rem;
  border-right: 1px solid #e5e7eb;
}

aside .locales {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

aside h3 {
  margin: 1.5rem 0 0.5rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #6b7280;
}

aside ul {
  list-style: none;
  margin: 0;
  padding-left: 0.75rem;
}

aside .group {
  font-weight: 600;
}

main {
  flex: 1;
  padding: 1rem 2rem;
  min-width: 0;
}

a {
  color: #00a155;
  text-decoration: none;
}

a.router-link-exact-active {
  font-weight: 600;
}
</style>
