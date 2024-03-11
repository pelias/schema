const _ = require('lodash')
const randomstring = require('randomstring')
const elasticsearch = require('elasticsearch')
const async = require('async')

function Suite (clientOpts, props) {
  this.actions = []
  this.asserts = []
  this.client = null
  this.clientOpts = !!clientOpts && (clone(clientOpts) || {
    host: 'localhost:9200',
    keepAlive: true
  })
  this.props = props || {}
  if (!_.has(this, 'props.index')) {
    this.props.index = 'testindex-' + randomstring.generate(7).toLowerCase()
  }
}

Suite.prototype.action = function (action) {
  this.actions.push(action)
}

Suite.prototype.assert = function (assert) {
  this.asserts.push(assert)
}

Suite.prototype.start = function (cb) {
  this.client = new elasticsearch.Client(this.clientOpts)
  cb()
}

Suite.prototype.create = function (cb) {
  const cmd = _.merge(this.props.create, { index: this.props.index })
  if (_.has(this, 'props.schema')) {
    cmd.body = this.props.schema
  }
  this.client.indices.create(cmd, cb)
}

Suite.prototype.delete = function (cb) {
  const cmd = _.merge(this.props.delete, { index: this.props.index })
  this.client.indices.delete(cmd, cb)
}

Suite.prototype.refresh = function (cb) {
  const cmd = _.merge(this.props.refresh, { index: this.props.index })
  this.client.indices.refresh(cmd, cb)
}

// note: optimize was replaced in version ES@2.0, forcemerge used for later versions:
// https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-forcemerge.html
Suite.prototype.optimize = function (cb) {
  try {
    this.client.indices.forcemerge({ index: this.props.index }, cb)
  } catch (e) {
    const cmd = { index: this.props.index, waitForMerge: true, force: true }
    this.client.indices.optimize(cmd, cb)
  }
}

Suite.prototype.waitForStatus = function (status, cb) {
  const cmd = { waitForStatus: status || 'yellow' }
  this.client.cluster.health(cmd, cb)
}

Suite.prototype.run = function (cb) {
  const self = this
  self.start(err => {
    if (err) { throw new Error(err) }
    self.waitForStatus('yellow', err => {
      if (err) { throw new Error(err) }
      self.create(err => {
        if (err) { throw new Error(err) }
        async.series(self.actions, err => {
          if (err) { throw new Error(err) }
          self.refresh(err => {
            if (err) { throw new Error(err) }
            self.optimize(async.series(self.asserts, err => {
              if (err) { throw new Error(err) }
              self.delete(err => {
                if (err) { throw new Error(err) }
                self.client.close()
                if (_.isFunction(cb)) {
                  cb()
                }
              })
            }))
          })
        })
      })
    })
  })
}

// elasticsearch client requires that config objects not be reused.
// Error: Do not reuse objects to configure the elasticsearch Client class:
// https://github.com/elasticsearch/elasticsearch-js/issues/33
function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

module.exports = Suite
