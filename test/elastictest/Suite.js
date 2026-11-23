const _ = require('lodash')
const randomstring = require('randomstring')
const elasticsearch = require('elasticsearch')

function Suite (clientOpts, props) {
  this.actions = []
  this.asserts = []
  this.client = null
  this.clientOpts = clientOpts ? clone(clientOpts) : {
    host: 'localhost:9200',
    keepAlive: true
  }
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

Suite.prototype.start = function () {
  this.client = new elasticsearch.Client(this.clientOpts)
}

Suite.prototype.create = function () {
  const cmd = _.merge(this.props.create, { index: this.props.index })
  if (_.has(this, 'props.schema')) {
    cmd.body = this.props.schema
  }
  return this.client.indices.create(cmd)
}

Suite.prototype.delete = function () {
  const cmd = _.merge(this.props.delete, { index: this.props.index })
  return this.client.indices.delete(cmd)
}

Suite.prototype.refresh = function () {
  const cmd = _.merge(this.props.refresh, { index: this.props.index })
  return this.client.indices.refresh(cmd)
}

Suite.prototype.optimize = function () {
  return this.client.indices.forcemerge({ index: this.props.index })
}

Suite.prototype.waitForStatus = function (status) {
  return this.client.cluster.health({ waitForStatus: status || 'yellow' })
}

Suite.prototype.run = function (cb) {
  const promise = this._run()
  if (!_.isFunction(cb)) { return promise }
  promise.then(() => cb(), cb)
}

Suite.prototype._run = async function () {
  this.start()
  try {
    await this.waitForStatus('yellow')
    await this.create()
    for (const action of this.actions) { await step(action) }
    await this.refresh()
    await this.optimize()
    for (const assert of this.asserts) { await step(assert) }
    await this.delete()
  } finally {
    this.client.close()
  }
}

// convert a callback style function to a promise, promise style functions
// (those which declare no arguments) are called directly.
function step (fn) {
  if (fn.length === 0) { return Promise.resolve(fn()) }
  return new Promise((resolve, reject) => {
    fn(err => err ? reject(err) : resolve())
  })
}

// elasticsearch client requires that config objects not be reused.
// Error: Do not reuse objects to configure the elasticsearch Client class:
// https://github.com/elasticsearch/elasticsearch-js/issues/33
function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

module.exports = Suite
