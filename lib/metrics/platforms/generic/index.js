'use strict'

const os = require('os')

const semver = require('semver')

const Stats = require('./stats')

module.exports = function createSystemMetrics (registry) {
  // Base system metrics
  registry.getOrCreateGauge(
    'system.cpu.total.norm.pct',
    require('./system-cpu')
  )
  registry.getOrCreateGauge(
    'system.memory.total',
    () => os.totalmem()
  )
  registry.getOrCreateGauge(
    'system.memory.actual.free',
    () => os.freemem()
  )

  // Process metrics
  // NOTE: Process CPU metrics are not supported on 6.0.x
  if (semver.satisfies(process.versions.node, '>=6.1')) {
    const stats = new Stats()
    registry.registerCollector(stats)

    const metrics = [
      'system.process.cpu.total.norm.pct',
      'system.process.cpu.system.norm.pct',
      'system.process.cpu.user.norm.pct'
    ]

    for (let metric of metrics) {
      registry.getOrCreateGauge(metric, () => stats.toJSON()[metric])
    }
  }
  registry.getOrCreateGauge(
    'system.process.memory.rss.bytes',
    () => process.memoryUsage().rss
  )
}
