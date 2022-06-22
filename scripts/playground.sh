#!/bin/bash

CWD=$(pwd)
ARG1=${1:-basic}
PLAYGROUND_PATH=$CWD/playground/$ARG1

(cd $PLAYGROUND_PATH && npx nuxi dev)
