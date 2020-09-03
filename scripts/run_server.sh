#!/bin/bash

set -e

# start elasticsearch server
/tmp/elasticsearch/bin/elasticsearch --daemonize -Epath.data=/tmp/elasticsearch -Ediscovery.type=single-node

# wait for server to boot up
# logs show that on travis-ci it can take ~17s to boot an ES6 server
source "${BASH_SOURCE%/*}/elastic_wait.sh"
(elastic_wait)

# set the correct esclient.apiVersion in pelias.json
v=( ${ES_VERSION//./ } ) # split version number on '.'

# generate a pelias.json config
PELIAS_CONFIG=$(
  jq -n \
    --arg apiVersion "${v[0]}.${v[1]}" \
    '{
      esclient: {
        apiVersion: $apiVersion
      }
    } | del(.. | select(. == ""))'
);

# write to filesystem
echo "${PELIAS_CONFIG}" > ~/pelias.json

# debugging
echo "--- pelias.json ---"
cat ~/pelias.json

echo "--- elasticsearch.yml ---"
cat /tmp/elasticsearch/config/elasticsearch.yml
