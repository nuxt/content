#!/bin/bash

# Restore all git changes
git restore -s@ -SW  -- examples src test

# Resolve PNPM
pnpm

# Update token
if [[ ! -z ${NODE_AUTH_TOKEN} ]] ; then
  echo "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}" >> ~/.npmrc
  echo "registry=https://registry.npmjs.org/" >> ~/.npmrc
  echo "always-auth=true" >> ~/.npmrc
  npm whoami
fi

# Release package
echo "Publishing Docus..."
npm publish -q --access public
echo "Published!"
