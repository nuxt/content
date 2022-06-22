#!/bin/bash

CWD=$(pwd)
ARG1=${1:-basic}
FIXTURE_PATH=$CWD/test/fixtures/$ARG1

(cd $FIXTURE_PATH && npx nuxi dev)
