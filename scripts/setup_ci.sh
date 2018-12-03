#!/bin/bash
set -e

# download and install elasticsearch with ICU plugin
# note: the download servers and plugin install binary changed between versions

# default download and plugin locations
ES_PLUGIN_BIN="/usr/share/elasticsearch/bin/elasticsearch-plugin"
ES_DEB_URL="https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-${ES_VERSION}.deb"

# override if using old Elasticsearch versions
if [[ "${ES_VERSION}" == "2.4"* ]]; then
	ES_PLUGIN_BIN="/usr/share/elasticsearch/bin/plugin"
	ES_DEB_URL="https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/deb/elasticsearch/${ES_VERSION}/elasticsearch-${ES_VERSION}.deb"
fi

# download correct ES version
curl -O $ES_DEB_URL

# install debian package
sudo dpkg -i --force-confnew elasticsearch-${ES_VERSION}.deb

# install ICU plugin
sudo $ES_PLUGIN_BIN install analysis-icu

# restart elasticsearch server
sudo service elasticsearch restart

# set the correct esclient.apiVersion in pelias.json
v=( ${ES_VERSION//./ } ) # split version number on '.'
echo "{\"esclient\":{\"apiVersion\":\"${v[0]}.${v[1]}\"}}" > ~/pelias.json

# debugging
echo "--- pelias.json ---"
cat ~/pelias.json

echo "--- elasticsearch.yml ---"
sudo cat /etc/elasticsearch/elasticsearch.yml
