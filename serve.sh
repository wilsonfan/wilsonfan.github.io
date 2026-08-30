#!/bin/sh
# Local preview server. Installs gems on first run, then serves with live rebuild.
set -e
cd "$(dirname "$0")"
bundle check >/dev/null 2>&1 || bundle install
exec bundle exec jekyll serve
