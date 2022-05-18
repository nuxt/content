<template>
  <div>
    <!-- This showcases renderless usage of <ContentDoc /> component-->
    <ContentDoc tag="div" path="/_test">
      <template #default="{ doc }">
        <pre>{{ doc }}</pre>

        <h1>Using ContentRenderer:</h1>

        <ContentRenderer :value="doc" />
      </template>

      <template #empty>
        <div>
          Hello empty
        </div>
      </template>

      <template #not-found>
        <div>
          Hello not found
        </div>
      </template>
    </ContentDoc>

    <ContentList />
  </div>
</template>
