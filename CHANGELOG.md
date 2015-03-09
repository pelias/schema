0.0.15
  - Changed the way we analyze admin fields ('keyword' to 'pelias' analyzer)
  - Allows flexible even fuzzy searches on admin fields

0.0.14
  - Added population property to the poi mapping
  - Added a multiplier type

0.0.13
  - added osm address type

0.0.12
  - rename polygon mapping from quattroshapes to boundary
  - added open addresses type

0.0.11
  - revert alpha3 context

0.0.10
  - add alpha3 context
  - add default alpha3 value XXX

0.0.9
  - removed tags from schema
  - disabled storing payloads in FST

0.0.8
  - added plugin analyzer plugin
  - changed suggest analyzer to plugin

0.0.7
  - store all admin fields

0.0.6
  - added alpha3, alpha1_abbr 
  - only using precision levels upto 5 for the suggester

0.0.5
  - disabled storing and retrieving 'boundaries' field in _source
  - bug fixes

0.0.4
  - dynamic = strict
  - deprecated poi-noop

0.0.3
  - reduce geohash precision
  - set precision 1..12

0.0.2
  - add --force-yes option to drop index script

0.0.1
  - initial release