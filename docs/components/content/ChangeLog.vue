<template>
  <div>
    <GithubReleases v-slot="{ releases }">
      <div v-for="release in releases" :key="release.name" class="release">
        <div class="release-name">
          <h2 class="">
            {{ release.name }}
          </h2>
        </div>
        <div class="content">
          <h3 class="sr-only">
            Description
          </h3>

          <ContentRenderer :value="release">
            <template #empty>
              <p>
                No description provided
              </p>
            </template>
          </ContentRenderer>
        </div>
      </div>
    </GithubReleases>
  </div>
</template>

<style scoped lang="ts">
css({
  '.release': {
    position: 'relative',
    display: 'flex',
    overflow: 'hidden',
    flex: '1',
    padding: '{space.4} {space.8}',
    paddingBottom: '{space.8}',
    overflowY: 'auto',
  },
  '.release-name': {
    position: 'relative',
    paddingTop: '{space.4}',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '{space.4}',
    paddingBottom: '{space.4}',

    'h2': {
      fontSize: '{fontSize.2xl}',
      fontWeight: '{fontWeight.bold}',
      color: '{color.gray.900}',
      marginTop: '{space.8}',
      '@dark': {
        color: '{color.gray.100}'
      }
    }
  },
  '.content': {
    paddingLeft: '{space.8}',
    paddingRight: '{space.8}',
    paddingBottom: '{space.24}',
  }
})
</style>
