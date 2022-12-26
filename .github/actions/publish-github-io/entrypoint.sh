#!/bin/bash

# ACCESS_TOKEN
# BUILD_DIR
# BUILD_PACKAGE
# TARGET_REPO
# TARGET_BRANCH
# TARGET_DIR
DEST="dest"

set -e

echo ''

# env
echo "node version: $(node -v)"
echo "npm version: $(npm -v)"
echo "pnpm version: $(pnpm -v)"

echo "==> init repo"
git clone https://github.com/${TARGET_REPO}.git dest --depth 1

echo "==> change directory to the dest"
cd $DEST
rm -rf .git
rm -rf $TARGET_DIR
git init
git config user.name "${GITHUB_ACTOR}"
git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"

echo "==> cp dest files"
pnpm --filter=$BUILD_PACKAGE -c exec cp -rf $BUILD_DIR $GITHUB_WORKSPACE/$DEST/$TARGET_DIR

echo "==> starting deploying"
git add .
git commit -m "Auto deploy from Github Actions"
git push --force https://username:${ACCESS_TOKEN}@github.com/${TARGET_REPO}.git master:$TARGET_BRANCH
rm -fr .git
cd $GITHUB_WORKSPACE
echo "Successfully deployed!" && \
echo "See: https://github.com/$TARGET_REPO/tree/$TARGET_BRANCH"