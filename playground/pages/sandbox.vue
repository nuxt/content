<template>
  <div>
    <!-- This showcases renderless usage of <Content /> component-->
    <Content tag="div" :query="{ where: { path: '/test' } }" :renderer="false" :sync="false">
      <template #default="{ data }">
        <pre>{{ data }}</pre>

        <ContentRenderer :value="data" />
      </template>

      <template #empty>
        <div>
          Hello
        </div>
      </template>
    </Content>
  </div>
</template>
