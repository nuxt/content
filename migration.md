- Queries with simple path filtering can be converted to `cms.get(route.path)`
  ```diff
  - const doc = queryCollection(version.value.collection).path(path.value).first()
  + const doc = cms.get(path.value)
  ```
