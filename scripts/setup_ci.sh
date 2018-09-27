#!/bin/bash
set -e

# download and install elasticsearch with ICU plugin
# note: the download servers and plugin install binary changed between versions

if [[ "${ES_VERSION}" == "2.4"* ]]; then

  # download from legacy host
  wget -O - https://download.elasticsearch.org/elasticsearch/release/org/elasticsearch/distribution/tar/elasticsearch/${ES_VERSION}/elasticsearch-${ES_VERSION}.tar.gz \
    | tar xz --directory=/tmp/elasticsearch --strip-components=1

  # install ICU plugin
  /tmp/elasticsearch/bin/plugin install analysis-icu

  # start elasticsearch server
  /tmp/elasticsearch/bin/elasticsearch --daemonize --path.data /tmp
else

  # download from new host
  wget -O - https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-${ES_VERSION}.tar.gz \
    | tar xz --directory=/tmp/elasticsearch --strip-components=1

  # install ICU plugin
  /tmp/elasticsearch/bin/elasticsearch-plugin install analysis-icu

  # start elasticsearch server
  /tmp/elasticsearch/bin/elasticsearch --daemonize -Epath.data=/tmp -Edefault.path.data=/tmp -Ediscovery.type=single-node
fi

# set the correct esclient.apiVersion in pelias.json
v=( ${ES_VERSION//./ } ) # split version number on '.'
echo "{\"esclient\":{\"apiVersion\":\"${v[0]}.${v[1]}\"}}" > ~/pelias.json

# debugging
echo "--- pelias.json ---"
cat ~/pelias.json

echo "--- elasticsearch.yml ---"
cat /tmp/elasticsearch/config/elasticsearch.yml