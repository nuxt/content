#!/bin/bash

CWD=$(pwd)
ARG1=${1}

# Remove all .nuxt directories in the test/fixtures directory
for d in $(find $CWD/test/fixtures -maxdepth 1 -mindepth 1 -type d); do
  cd $d
  rm -rf .nuxt
  npx nuxi prepare
  cd $CWD
done

if [[ $ARG1 ]]
then
  (npx vitest run -t $ARG1)
else
  (npx vitest run)
fi
