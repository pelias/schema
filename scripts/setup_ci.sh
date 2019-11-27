#!/bin/bash
set -e

# create elasticsearch directory
mkdir /tmp/elasticsearch

# allow switching the JDK version
curl -s https://raw.githubusercontent.com/michaelklishin/jdk_switcher/master/jdk_switcher.sh | bash -s use "${JDK_VERSION}"

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
  FILENAME="elasticsearch-${ES_VERSION}-linux-x86_64.tar.gz"
  STRIP_COMPONENTS=1

  # prior to ES7 the architecture was not included in the filename
  if [[ "${ES_VERSION}" == "5"* || "${ES_VERSION}" == "6"* ]]; then
    FILENAME="elasticsearch-${ES_VERSION}.tar.gz"
  fi

  # the 6.8.5 release is inconsisent with the others
  # https://github.com/elastic/elasticsearch/issues/49599
  if [[ "${ES_VERSION}" == "6.8.5" ]]; then
    STRIP_COMPONENTS=2
  fi

  # download from new host
  wget -O - "https://artifacts.elastic.co/downloads/elasticsearch/${FILENAME}" \
    | tar xz --directory=/tmp/elasticsearch --strip-components="${STRIP_COMPONENTS}"

  # install ICU plugin
  /tmp/elasticsearch/bin/elasticsearch-plugin install analysis-icu

  # start elasticsearch server
  /tmp/elasticsearch/bin/elasticsearch --daemonize -Epath.data=/tmp/elasticsearch -Ediscovery.type=single-node
fi

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
    --arg typeName "${ES_TYPE}" \
    '{
      esclient: {
        apiVersion: $apiVersion
      },
      schema: {
        typeName: $typeName
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
