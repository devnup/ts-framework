#!/bin/bash

export DOCS_VERSION="$(echo "console.log(require(\"./package.json\").version)" | node)";
echo "Generating documentation for v$DOCS_VERSION...";
./node_modules/.bin/typedoc --name "ts-framework (v$DOCS_VERSION)" --mode file --out ./docs --theme node_modules/devnup-typedoc-theme/bin lib/index.ts;