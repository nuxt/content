#!/bin/bash

# Restore all git changes
git restore -s@ -SW  -- example src templates

# Resolve yarn
yarn

# Update token
if [[ ! -z ${NODE_AUTH_TOKEN} ]] ; then
  echo "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}" >> ~/.npmrc
  echo "registry=https://registry.npmjs.org/" >> ~/.npmrc
  echo "always-auth=true" >> ~/.npmrc
  npm whoami
fi

# Release package
echo "Publishing @docus/core"
npm publish -q --access public
