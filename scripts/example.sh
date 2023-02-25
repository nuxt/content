#!/bin/bash

EXAMPLE_PATH=examples/$1

if [[ ! -d "$EXAMPLE_PATH/node_modules" ]] ; then
  (cd $EXAMPLE_PATH && pnpm install)
fi

(cd $EXAMPLE_PATH && pnpm dev)
