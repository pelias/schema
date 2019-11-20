function elastic_status(){
  curl --output /dev/null --silent --write-out "%{http_code}" "http://${ELASTIC_HOST:-localhost:9200}" || true;
}

function elastic_wait(){
  echo 'waiting for elasticsearch service to come up';
  retry_count=30

  i=1
  while [[ "$i" -le "$retry_count" ]]; do
    if [[ $(elastic_status) -eq 200 ]]; then
      echo "Elasticsearch up!"
      exit 0
    fi
    sleep 2
    printf "."
    i=$(($i + 1))
  done

  echo
  echo "Elasticsearch did not come up, check configuration"
  exit 1
}