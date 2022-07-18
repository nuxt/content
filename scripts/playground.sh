#!/bin/bash

CWD=$(pwd)
ARG1=${1:-basic}
PLAYGROUND_PATH=$CWD/playground/$ARG1

if [[ $ARG1 == docs ]]
then
PLAYGROUND_PATH=$CWD/docs
(cd $PLAYGROUND_PATH && npx nuxi dev)
else
(cd $PLAYGROUND_PATH && npx nuxi dev)
fi
