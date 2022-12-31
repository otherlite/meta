#!/bin/bash

set -e

echo ''

TEMP_DIR=".tmp_dir"
git config --global --add safe.directory "*"

echo "==> prepare deploying"
if [ -z "$TARGET_REPO_DIR" ]; then 
  echo "TARGET_REPO_DIR: "
  cp -vfr $BUILD_DIR $TEMP_DIR
elif [ "$TARGET_REPO_DIR" = "/" ]; then    
  echo "TARGET_REPO_DIR: /"
  git clone https://github.com/$TARGET_REPO.git $TEMP_DIR
  rm -fr $TEMP_DIR/.git
  cp -vfr $BUILD_DIR/* $TEMP_DIR # $TEMP_DIR已存在时需要使用 $BUILD_DIR/*
else   
  echo "TARGET_REPO_DIR: $TARGET_REPO_DIR"
  git clone https://github.com/$TARGET_REPO.git $TEMP_DIR
  rm -fr $TEMP_DIR/.git
  rm -fr $TEMP_DIR/$TARGET_REPO_DIR
  cp -vfr $BUILD_DIR $TEMP_DIR/$TARGET_REPO_DIR
fi 

echo "==> starting deploying"
cd $TEMP_DIR
git init 
git config user.name "${GITHUB_ACTOR}"
git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"
git add .
git commit -m "Auto deploy from Github Actions"
git push --force https://username:${ACCESS_TOKEN}@github.com/${TARGET_REPO}.git master:$TARGET_REPO_BRANCH
rm -fr .git
cd $GITHUB_WORKSPACE
echo "Successfully deployed!" && \
echo "See: https://github.com/$TARGET_REPO/tree/$TARGET_REPO_BRANCH"