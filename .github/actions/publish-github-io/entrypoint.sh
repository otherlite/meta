#!/bin/bash

set -e

echo ''

echo "==> change directory to the dest"
git config --global --add safe.directory $PUBLISH_DIR
cd $PUBLISH_DIR
echo "==> 1111"
pwd
ls -a
echo "==> 222"
echo "==> prepare to deploy"
git init
echo "==> 333"
git --version
# git config user.name "${GITHUB_ACTOR}"
# git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"
# if [ -z "$(git status --porcelain)" ]; then
#     echo "The BUILD_DIR is setting error or nothing produced" && \
#     echo "Exiting..."
#     exit 0
# fi

# echo "==> starting deploying"
# git add .
# git commit -m "Auto deploy from Github Actions"
# git push --force https://username:${ACCESS_TOKEN}@github.com/${TARGET_REPO}.git master:$TARGET_BRANCH
# rm -fr .git
cd $GITHUB_WORKSPACE
echo "Successfully deployed!" && \
echo "See: https://github.com/$TARGET_REPO/tree/$TARGET_BRANCH"