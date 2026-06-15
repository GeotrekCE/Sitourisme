'use strict'

/**
 * Détection des doublons de instanceStructureGeotrekId (Product/Event).
 * Lecture seule — écrit le rapport dans library/data/debug.log (log.writeLog).
 *
 * Usage : NODE_ENV=development node scripts/checkDuplicate.js
 */

const path = require('path'),
  chalk = require('chalk'),
  mongoose = require('mongoose'),
  log = require(path.resolve('./library/data/log.js')),
  mongooseLib = require(path.resolve('./config/lib/mongoose.js')),
  EntityServer = require(path.resolve('./library/modules/server/models/entity.server.model.js')),
  ProductSchema = require(path.resolve('./modules/products/server/models/product.schema.js')),
  EventSchema = require(path.resolve('./modules/events/server/models/event.schema.js'))

async function checkModel(label, Model) {
  const duplicates = await Model.aggregate([
    { $match: { instanceStructureGeotrekId: { $exists: true, $ne: null } } },
    { $group: {
        _id: '$instanceStructureGeotrekId',
        count: { $sum: 1 },
        docs: { $push: { id: '$_id', name: '$name', created: '$created', lastUpdate: '$lastUpdate', specialIdSitra: '$specialIdSitra' } }
    } },
    { $match: { count: { $gt: 1 } } },
    { $sort: { count: -1 } }
  ])

  console.log(chalk.cyan(`\n===== ${label} : ${duplicates.length} clé(s) en doublon =====`))
  log.writeLog(`[CHECK-DUP] ${label} : ${duplicates.length} clé(s) en doublon`)

  for (const dup of duplicates) {
    console.log(chalk.yellow(`${dup._id}`) + `  → ${dup.count} documents`)
    dup.docs.forEach(d =>
      console.log(`   - ${d.id} | ${d.name} | créé: ${d.created} | maj: ${d.lastUpdate} | sitra: ${d.specialIdSitra || '-'}`)
    )
    log.writeLog(`[CHECK-DUP] ${label} ${dup._id} → ${dup.count} doublons`, dup.docs)
  }

  return duplicates.length
}

mongooseLib.connect(async function () {
  try {
    log.writeLog('[CHECK-DUP] === Démarrage détection ===')

    const MODELS = [
      { label: 'Product', model: new EntityServer('Product', ProductSchema).getModel() },
      { label: 'Event', model: new EntityServer('Event', EventSchema).getModel() }
    ]

    let total = 0
    for (const m of MODELS) total += await checkModel(m.label, m.model)

    const summary = total === 0
      ? '✅ Aucun doublon.'
      : `⚠️  ${total} clé(s) en doublon. Voir debug.log`
    console.log(total === 0 ? chalk.green('\n' + summary) : chalk.red('\n' + summary))
    log.writeLog('[CHECK-DUP] ' + summary)
  } catch (err) {
    console.error(chalk.red('Erreur :'), err)
    log.writeLog('[CHECK-DUP] ERREUR', { message: err.message, stack: err.stack })
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
})