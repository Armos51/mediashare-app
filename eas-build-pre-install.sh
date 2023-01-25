#!/usr/bin/env bash

# set -xeuo pipefail

ROOT_DIR="$(pwd)"
echo "RUN preinstall HOOK"

if ! [ -d "$ROOT_DIR/.git" ]; then
  echo "...Initialize git"
  git init
fi

echo "...Create .gitmodules file"
if [ -f "$ROOT_DIR/.gitmodules" ]; then
  rm -r "$ROOT_DIR/.gitmodules"
fi

if ! [ -f "$ROOT_DIR/.gitmodules" ]; then
cat << EOF > $ROOT_DIR/.gitmodules
[submodule "app"]
  path = app
  url = https://github.com/bluecollardev/mediashare-source.git
EOF
fi

if ! [ -d "$ROOT_DIR/.git/modules" ]; then
  echo "...Creating submodule"
  if [ -d "$ROOT_DIR/app" ]; then
    echo "......Remove app dir"
    rm -rf $ROOT_DIR/app
  fi
  echo "......Create submodule"
  git submodule add https://github.com/bluecollardev/mediashare-source.git $ROOT_DIR/app \
    && cd $ROOT_DIR/app && git checkout main \
    && cd $ROOT_DIR || exit

else
  echo "...Re-initialize submodules"
  git submodule update --init --recursive \
   && cd $ROOT_DIR/app && git checkout main \
   && cd $ROOT_DIR || exit
fi
echo "RUN preinstall HOOK COMPLETE"
