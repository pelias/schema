#!/bin/bash
set -e

# create elasticsearch directory
mkdir /tmp/elasticsearch

# allow switching the JDK version
curl -s https://raw.githubusercontent.com/michaelklishin/jdk_switcher/master/jdk_switcher.sh | bash -s use "${JDK_VERSION}"

# download and install elasticsearch with ICU plugin
FILENAME="elasticsearch-${ES_VERSION}-linux-x86_64.tar.gz"
STRIP_COMPONENTS=1

# prior to ES7 the architecture was not included in the filename
if [[ "${ES_VERSION}" == "5"* || "${ES_VERSION}" == "6"* ]]; then
  FILENAME="elasticsearch-${ES_VERSION}.tar.gz"
fi

# download from new host
wget -O - "https://artifacts.elastic.co/downloads/elasticsearch/${FILENAME}" \
  | tar xz --directory=/tmp/elasticsearch --strip-components="${STRIP_COMPONENTS}"

# install ICU plugin
/tmp/elasticsearch/bin/elasticsearch-plugin install analysis-icu
