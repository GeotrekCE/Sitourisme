'use strict'

const path = require('path'),
  config = require(path.resolve('./config/config.js')),
  CleanupServer = require(path.resolve('./library/modules/server/models/cleanup.server.model.js'))

function parseDryRun(value) {
  return ['1', 'true', 'yes'].includes(String(value || '').toLowerCase())
}

exports.run = async function (req, res, options) {
  options = options || {}

  const type = req.query && req.query.type
    ? String(req.query.type).toLowerCase()
    : 'geotrek-api'

  const instance = req.query && req.query.instance !== undefined
    ? parseInt(req.query.instance, 10)
    : null

  const structure = req.query && req.query.structure !== undefined
    ? req.query.structure
    : null

  const dryRun = parseDryRun(req.query && req.query.dryRun)

  if (!config.cleanupToken || typeof config.cleanupToken !== 'string') {
    return res.status(503).json({
      message: 'cleanupToken non configure'
    })
  }

  const authorization = req.headers && req.headers.authorization
    ? req.headers.authorization
    : ''

  if (authorization !== 'Bearer ' + config.cleanupToken) {
    return res.status(401).json({
      message: 'Authentification cleanup requise'
    })
  }

  if (type !== 'geotrek-api') {
    return res.status(400).json({
      message: 'type doit valoir geotrek-api'
    })
  }

  if (!Number.isInteger(instance)) {
    return res.status(400).json({
      message: 'instance requise et numerique'
    })
  }

  if (!options.Model || !options.importApi || !options.moduleName) {
    return res.status(500).json({
      message: 'Configuration interne cleanup incomplete'
    })
  }

  try {
    const cleanup = new CleanupServer({
      Model: options.Model,
      importApi: options.importApi,
      moduleName: options.moduleName,
      instance
    })

    const report = await cleanup.run({
      structure,
      dryRun
    })

    return res.json(report)
  } catch (err) {
    console.error('[GEOTREK CLEANUP] controller error', err)

    return res.status(err.statusCode || 500).json({
      message: err && err.message ? err.message : 'Erreur cleanup'
    })
  }
}
