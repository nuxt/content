#!/bin/bash

CWD=$(pwd)
ARG1=${1:-basic}
FIXTURE_PATH=$CWD/test/fixtures/$ARG1

find $CWD/test -name ".nuxt" -exec rm -rf {} \;

(nuxi prepare $FIXTURE_PATH && npx vitest run -t $ARG1)
