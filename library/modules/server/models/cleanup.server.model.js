'use strict'

const path = require('path'),
  axios = require('axios'),
  Geotrek = require(path.resolve('./library/import/geotrek.js')),
  ApidaeCleanup = require(path.resolve('./library/export/apidae.cleanup.js')),
  config = require(path.resolve('./config/config.js')),
  configImportGEOTREK = require(path.resolve('./config/configImport_GEOTREK.js')),
  log = require(path.resolve('./library/data/log.js'))

const CLEANUP_MODES = ['masking', 'deletion']

function normalizeMode(value) {
  return CLEANUP_MODES.indexOf(value) !== -1 ? value : null
}

function resolveCleanupMode(instanceConfig, structureConfig) {
  const instanceMode = normalizeMode(instanceConfig.cleanup)
  const structureMode = normalizeMode(
    structureConfig && structureConfig.production
      ? structureConfig.production.cleanup
      : null
  )

  const priority = instanceConfig.cleanupPrio === 'structure'
    ? 'structure'
    : 'instance'

  if (priority === 'structure') {
    return structureMode || instanceMode
  }

  return instanceMode
}

function parseStructure(value) {
  if (value === undefined || value === null || value === '') return null
  const structure = parseInt(value, 10)
  return Number.isInteger(structure) ? structure : null
}

function isNumericApidaeId(value) {
  return /^\d+$/.test(String(value || ''))
}

class CleanupServer extends Geotrek {
  constructor(options) {
    super()

    options = options || {}

    this.Model = options.Model
    this.importApi = options.importApi
    this.moduleName = options.moduleName
    this.instance = parseInt(options.instance, 10)

    this.http = options.http || axios
    this.apidae = options.apidae || new ApidaeCleanup()
    this.config = options.config || config
    this.configImportGEOTREK = options.configImportGEOTREK || configImportGEOTREK
    this.log = options.log || log
  }

  writeLog(step, data) {
    const line = '[GEOTREK CLEANUP] ' + step + ' ' + JSON.stringify(data || {})

    console.log(line)

    if (this.config.debug && this.config.debug.logsFile) {
      this.log.writeLog(line)
    }
  }

  getDebugGeotrekId() {
    const value = this.config.debug ? this.config.debug.idGeo : null

    if (value === undefined || value === null || value === '' || Number(value) === 0) {
      return null
    }

    return String(value)
  }

  getCleanupApidaeId() {
    const value = this.config.debug ? this.config.debug.cleanupIdApidae : null

    if (value === undefined || value === null || value === '' || Number(value) === 0) {
      return null
    }

    if (!isNumericApidaeId(value)) {
      const err = new Error('debug.cleanupIdApidae doit etre un ID Apidae numerique ou 0')
      err.statusCode = 400
      throw err
    }

    return String(value)
  }

  getInstanceConfig() {
    const instanceConfig = this.configImportGEOTREK.geotrekInstance[this.instance]

    if (!instanceConfig) {
      const err = new Error('Instance Geotrek introuvable : ' + this.instance)
      err.statusCode = 400
      throw err
    }

    return instanceConfig
  }

  getSyncFlag() {
    if (this.importApi === 'trek') return 'syncTrek'
    if (this.importApi === 'touristicevent') return 'syncEvent'

    const err = new Error('Type Geotrek non supporte pour cleanup : ' + this.importApi)
    err.statusCode = 400
    throw err
  }

  getStructures(instanceConfig, requestedStructure) {
    const syncFlag = this.getSyncFlag()
    const structureFilter = parseStructure(requestedStructure)
    const structures = []

    if (
      instanceConfig.cleanup !== undefined &&
      !normalizeMode(instanceConfig.cleanup)
    ) {
      const err = new Error(
        "Configuration cleanup invalide sur l'instance " + this.instance +
        " : utiliser 'masking' ou 'deletion'"
      )
      err.statusCode = 400
      throw err
    }

    Object.keys(instanceConfig.structures || {}).forEach((structureId) => {
      const id = parseInt(structureId, 10)
      const structureConfig = instanceConfig.structures[structureId] || {}
      const production = structureConfig.production || {}

      if (structureFilter !== null && id !== structureFilter) return
      if (production[syncFlag] !== true) return

      if (
        production.cleanup !== undefined &&
        !normalizeMode(production.cleanup)
      ) {
        const err = new Error(
          'Configuration cleanup invalide sur la structure ' + id +
          " : utiliser 'masking' ou 'deletion'"
        )
        err.statusCode = 400
        throw err
      }

      const mode = resolveCleanupMode(instanceConfig, structureConfig)
      if (!mode) return

      structures.push({
        id,
        mode
      })
    })

    if (structureFilter !== null && structures.length === 0) {
      const err = new Error(
        'Structure ' + structureFilter +
        ' non active ou sans configuration cleanup pour ' + this.importApi
      )
      err.statusCode = 400
      throw err
    }

    return structures
  }

  getFiltering(instanceConfig) {
    if (this.importApi === 'trek') {
      return instanceConfig.trek_filtering || ''
    }

    if (this.importApi === 'touristicevent') {
      return instanceConfig.touristicevent_filtering || ''
    }

    return ''
  }

  buildGeotrekUrl(instanceConfig, page) {
    const base = String(instanceConfig.geotrekUrl || '').replace(/\/+$/, '')
    const params = new URLSearchParams()

    params.set('format', 'json')
    params.set('fields', 'id,structure')
    params.set('page', String(page))

    const filtering = String(this.getFiltering(instanceConfig) || '')
      .replace(/^\?/, '')
      .replace(/^&/, '')
      .trim()

    if (filtering && filtering !== 'null') {
      const extra = new URLSearchParams(filtering)
      extra.forEach((value, key) => params.append(key, value))
    }

    return base + '/' + this.importApi + '/?' + params.toString()
  }

  async getGeotrekIds(instanceConfig) {
    const idsByStructure = new Map()
    let page = 1
    let total = 0

    while (true) {
      const url = this.buildGeotrekUrl(instanceConfig, page)
      const response = await this.http.get(url, {
        validateStatus(status) {
          return status < 500
        }
      })

      if (!response || response.status !== 200) {
        const err = new Error(
          'Erreur API Geotrek HTTP ' + (response ? response.status : 'inconnue')
        )
        err.statusCode = 502
        throw err
      }

      const data = response.data

      if (!data || !Array.isArray(data.results)) {
        const err = new Error('Reponse API Geotrek invalide : results absent')
        err.statusCode = 502
        throw err
      }

      data.results.forEach((item) => {
        if (item.id === undefined || item.structure === undefined) return

        const structure = parseInt(item.structure, 10)
        if (!Number.isInteger(structure)) return

        if (!idsByStructure.has(structure)) {
          idsByStructure.set(structure, new Set())
        }

        idsByStructure.get(structure).add(String(item.id))
        total++
      })

      if (!data.next) break

      page++

      if (page > 1000) {
        const err = new Error('Pagination Geotrek anormalement longue')
        err.statusCode = 502
        throw err
      }
    }

    return {
      idsByStructure,
      total,
      pages: page
    }
  }

  async getMongoRows(structureIds) {
    const filter = {
      importType: 'GEOTREK-API',
      geotrekInstanceId: this.instance,
      geotrekStructureId: { $in: structureIds }
    }

    const query = this.Model.find(filter)
      .select(
        '_id specialId specialIdSitra geotrekInstanceId ' +
        'geotrekStructureId statusImport name'
      )

    const rows = typeof query.lean === 'function'
      ? await query.lean()
      : await query

    return {
      filter,
      rows
    }
  }

  async callApidae(row, mode, cleanupApidaeId) {
    const apidaeRow = cleanupApidaeId
      ? Object.assign({}, row, { specialIdSitra: cleanupApidaeId })
      : row

    return new Promise((resolve, reject) => {
      this.apidae.cleanup(apidaeRow, mode, (err, result) => {
        if (err) return reject(err)
        return resolve(result)
      })
    })
  }

  async updateMongoAfterSuccess(row, mode) {
    if (mode === 'deletion') {
      return this.Model.deleteOne({ _id: row._id })
    }

    return this.Model.updateOne(
      { _id: row._id },
      {
        $set: {
          statusImport: 3,
          state: 'HIDDEN',
          lastUpdate: new Date()
        }
      }
    )
  }

  async run(options) {
    options = options || {}

    const dryRun = options.dryRun === true
    const requestedStructure = options.structure
    const debugGeotrekId = this.getDebugGeotrekId()
    const cleanupApidaeId = this.getCleanupApidaeId()

    const report = {
      instance: this.instance,
      resource: this.importApi,
      dryRun,
      debugGeotrekId,
      cleanupIdApidae: cleanupApidaeId,
      forcedDebugCleanup: Boolean(debugGeotrekId && cleanupApidaeId),
      structures: [],
      mongodbCount: 0,
      geotrekCount: 0,
      geotrekScopeCount: 0,
      differenceCount: 0,
      maskingCount: 0,
      deletionCount: 0,
      alreadyMaskedCount: 0,
      noApidaeIdCount: 0,
      successCount: 0,
      errorCount: 0,
      details: []
    }

    this.writeLog('START CLEANUP', {
      instance: this.instance,
      resource: this.importApi,
      structure: requestedStructure || null,
      dryRun,
      debugGeotrekId,
      cleanupIdApidae: cleanupApidaeId
    })

    try {
      const instanceConfig = this.getInstanceConfig()
      const structures = this.getStructures(instanceConfig, requestedStructure)
      const structureIds = structures.map((item) => item.id)
      const modeByStructure = new Map(
        structures.map((item) => [item.id, item.mode])
      )

      report.structures = structures

      if (structures.length === 0) {
        this.writeLog('FINAL CLEANUP', report)
        return report
      }

      const mongo = await this.getMongoRows(structureIds)
      report.mongodbCount = mongo.rows.length

      this.writeLog('MONGODB COUNT', {
        instance: this.instance,
        resource: this.importApi,
        count: report.mongodbCount,
        structures: structureIds
      })

      const geotrek = await this.getGeotrekIds(instanceConfig)
      report.geotrekCount = geotrek.total

      structureIds.forEach((structureId) => {
        const ids = geotrek.idsByStructure.get(structureId)
        if (ids) report.geotrekScopeCount += ids.size
      })

      this.writeLog('GEOTREK COUNT', {
        instance: this.instance,
        resource: this.importApi,
        count: report.geotrekCount,
        scopeCount: report.geotrekScopeCount,
        pages: geotrek.pages
      })

      if (mongo.rows.length > 0 && report.geotrekScopeCount === 0) {
        const message =
          `[GEOTREK CLEANUP] ABORT - Geotrek returned 0 item while Mongo contains ${mongo.rows.length} item(s)`

        if (config.debug && config.debug.logsFile) {
          log.writeLog(message)
        }

        const err = new Error(
          `Cleanup aborted: Geotrek returned 0 item while Mongo contains ${mongo.rows.length} item(s)`
        )

        err.statusCode = 502
        throw err
      }

      if (cleanupApidaeId && !debugGeotrekId) {
        const err = new Error(
          'debug.cleanupIdApidae requiert debug.idGeo pour cibler une seule fiche'
        )
        err.statusCode = 400
        throw err
      }

      let missing

      if (report.forcedDebugCleanup) {
        missing = mongo.rows.filter(
          (row) => String(row.specialId) === debugGeotrekId
        )

        if (missing.length === 0) {
          const err = new Error(
            'debug.idGeo ' + debugGeotrekId +
            ' introuvable dans MongoDB pour le perimetre cleanup demande'
          )
          err.statusCode = 404
          throw err
        }
      } else {
        missing = mongo.rows.filter((row) => {
          const structureId = parseInt(row.geotrekStructureId, 10)
          const ids = geotrek.idsByStructure.get(structureId) || new Set()
          return !ids.has(String(row.specialId))
        })

        if (debugGeotrekId) {
          missing = missing.filter(
            (row) => String(row.specialId) === debugGeotrekId
          )
        }
      }

      report.differenceCount = missing.length

      missing.forEach((row) => {
        const structureId = parseInt(row.geotrekStructureId, 10)
        const mode = modeByStructure.get(structureId)

        if (mode === 'masking') report.maskingCount++
        if (mode === 'deletion') report.deletionCount++
      })

      this.writeLog('DIFFERENCE', {
        instance: this.instance,
        resource: this.importApi,
        mongodb: report.mongodbCount,
        geotrekScope: report.geotrekScopeCount,
        difference: report.differenceCount,
        masking: report.maskingCount,
        deletion: report.deletionCount,
        debugGeotrekId,
        cleanupIdApidae: cleanupApidaeId,
        forcedDebugCleanup: report.forcedDebugCleanup
      })

      for (const row of missing) {
        const structureId = parseInt(row.geotrekStructureId, 10)
        const mode = modeByStructure.get(structureId)
        const detail = {
          mongoId: String(row._id),
          geotrekId: String(row.specialId),
          apidaeId: cleanupApidaeId || row.specialIdSitra || null,
          mongoApidaeId: row.specialIdSitra || null,
          cleanupIdApidae: cleanupApidaeId,
          structure: structureId,
          mode,
          success: false
        }

        if (mode === 'masking' && Number(row.statusImport) === 3) {
          report.alreadyMaskedCount++
          detail.skipped = 'already-masked'
          report.details.push(detail)
          continue
        }

        if (!isNumericApidaeId(detail.apidaeId)) {
          report.noApidaeIdCount++
          detail.skipped = 'no-apidae-id'
          report.details.push(detail)
          this.writeLog('APIDAE SKIP', detail)
          continue
        }

        this.writeLog(dryRun ? 'APIDAE PLAN' : 'APIDAE REQUEST', {
          geotrekId: detail.geotrekId,
          apidaeId: detail.apidaeId,
          mongoApidaeId: detail.mongoApidaeId,
          cleanupIdApidae: detail.cleanupIdApidae,
          structure: structureId,
          mode
        })

        if (dryRun) {
          detail.success = true
          detail.dryRun = true
          report.details.push(detail)
          continue
        }

        try {
          const apidaeResult = await this.callApidae(row, mode, cleanupApidaeId)
          detail.apidae = apidaeResult

          this.writeLog('APIDAE RESPONSE', {
            geotrekId: detail.geotrekId,
            apidaeId: detail.apidaeId,
            mongoApidaeId: detail.mongoApidaeId,
            cleanupIdApidae: detail.cleanupIdApidae,
            structure: structureId,
            mode,
            statusCode: apidaeResult.statusCode,
            body: apidaeResult.body
          })

          await this.updateMongoAfterSuccess(row, mode)

          detail.success = true
          report.successCount++

          this.writeLog('MONGODB UPDATE', {
            geotrekId: detail.geotrekId,
            apidaeId: detail.apidaeId,
            mongoApidaeId: detail.mongoApidaeId,
            cleanupIdApidae: detail.cleanupIdApidae,
            structure: structureId,
            mode,
            action: mode === 'deletion'
              ? 'deleteOne'
              : 'statusImport=3/state=HIDDEN'
          })
        } catch (err) {
          report.errorCount++
          detail.error = err && err.message ? err.message : String(err)

          if (err && err.statusCode) detail.statusCode = err.statusCode
          if (err && err.body !== undefined) detail.body = err.body

          this.writeLog('APIDAE ERROR', {
            geotrekId: detail.geotrekId,
            apidaeId: detail.apidaeId,
            mongoApidaeId: detail.mongoApidaeId,
            cleanupIdApidae: detail.cleanupIdApidae,
            structure: structureId,
            mode,
            error: detail.error,
            statusCode: detail.statusCode || null,
            body: detail.body || null
          })
        }

        report.details.push(detail)
      }

      this.writeLog('FINAL CLEANUP', report)
      return report
    } catch (err) {
      report.errorCount++
      report.fatalError = err && err.message ? err.message : String(err)

      this.writeLog('FINAL CLEANUP ERROR', report)
      throw err
    }
  }
}

module.exports = CleanupServer
module.exports.resolveCleanupMode = resolveCleanupMode
module.exports.isNumericApidaeId = isNumericApidaeId
