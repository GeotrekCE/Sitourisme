'use strict'

/**
 * Suppression d'une fiche par son _id Mongo :
 *   appelle la route /api/{module}/delete?id=<id>
 *   → suppression Apidae (deleteSitra) + suppression logique Mongo (statusImport: 3)
 *
 * Usage :
 *   NODE_ENV=development node scripts/deleteFiche.js <id>
 *   NODE_ENV=development API_BASE_URL=http://localhost:3005 node scripts/deleteFiche.js 665f1a...
 */

const path = require('path'),
  chalk = require('chalk'),
  mongoose = require('mongoose'),
  fetch = require('node-fetch'),
  log = require(path.resolve('./library/data/log.js')),
  mongooseLib = require(path.resolve('./config/lib/mongoose.js')),
  EntityServer = require(path.resolve('./library/modules/server/models/entity.server.model.js')),
  ProductSchema = require(path.resolve('./modules/products/server/models/product.schema.js')),
  EventSchema = require(path.resolve('./modules/events/server/models/event.schema.js'))

const ID = process.argv[2]
const BASE_URL = process.env.API_BASE_URL

if (!ID) {
  console.error(chalk.red('Usage : node scripts/deleteFiche.js <id>'))
  process.exit(1)
}

mongooseLib.connect(async function () {
  try {
    log.writeLog(`[DELETE-FICHE] === Démarrage id=${ID} (base=${BASE_URL}) ===`)

    const MODELS = [
      { label: 'Product', route: 'products', model: new EntityServer('Product', ProductSchema).getModel() },
      { label: 'Event', route: 'events', model: new EntityServer('Event', EventSchema).getModel() }
    ]

    let target = null
    for (const m of MODELS) {
      const doc = await m.model.findById(ID).lean()
      if (doc) { target = { ...m, doc }; break }
    }

    if (!target) {
      const msg = `❌ Aucune fiche trouvée pour id=${ID}`
      console.error(chalk.red(msg))
      log.writeLog('[DELETE-FICHE] ' + msg)
      return
    }

    console.log(chalk.cyan(
      `Fiche trouvée : ${target.label} | ${target.doc.name} | ` +
      `clé ${target.doc.instanceStructureGeotrekId} | sitra ${target.doc.specialIdSitra || '-'}`
    ))
    log.writeLog(`[DELETE-FICHE] ${target.label} ${ID} trouvée`, {
      name: target.doc.name,
      instanceStructureGeotrekId: target.doc.instanceStructureGeotrekId,
      specialIdSitra: target.doc.specialIdSitra
    })

    const url = `${BASE_URL}/api/${target.route}/delete?id=${ID}`
    const res = await fetch(url, { method: 'DELETE' })
    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      const msg = `✗ Échec suppression ${ID} — HTTP ${res.status}`
      console.error(chalk.red(msg), body)
      log.writeLog('[DELETE-FICHE] ' + msg, body)
      return
    }

    console.log(chalk.green(`✓ Fiche ${ID} supprimée (Apidae + suppression logique)`))
    log.writeLog(`[DELETE-FICHE] OK ${target.label} ${ID}`, body)
  } catch (err) {
    console.error(chalk.red('Erreur :'), err)
    log.writeLog('[DELETE-FICHE] ERREUR', { message: err.message, stack: err.stack })
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
})