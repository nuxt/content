<template>
  <div class="layout">
    <aside>
      <NuxtLink to="/">
        <strong>Home</strong>
      </NuxtLink>

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

const { data: blogNav } = await useAsyncData('nav-blog', () => queryCollectionNavigation('blog'))
const { data: docsNav } = await useAsyncData('nav-docs', () => queryCollectionNavigation('docs'))

// Navigation trees are rooted at the collection prefix (`/blog`, `/docs`),
// so unwrap that top-level node to list its pages directly.
function unwrap(tree: NavigationItem[] | null | undefined): NavigationItem[] {
  if (tree?.length === 1 && tree[0]!.children?.length) {
    return tree[0]!.children
  }
  return tree ?? []
}

const sections = computed(() => [
  { label: 'Blog', items: unwrap(blogNav.value) },
  { label: 'Docs', items: unwrap(docsNav.value) },
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
  overflow-y: auto;
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

pre {
  overflow-x: auto;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 6px;
}
</style>
