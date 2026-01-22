#!/usr/bin/env sh
#
# Copyright (c) Microsoft Corporation. All rights reserved.
#
ROOT="$(dirname "$(dirname "$(dirname "$(readlink -f "$0")")")")"

APP_NAME="cursor"
VERSION="2.4.20"
COMMIT="20b56586b0785b8843487045393c57c6d89b7100"
EXEC_NAME="cursor"
CLI_SCRIPT="$ROOT/out/server-cli.js"
"$ROOT/node" "$CLI_SCRIPT" "$APP_NAME" "$VERSION" "$COMMIT" "$EXEC_NAME" "--openExternal" "$@"
