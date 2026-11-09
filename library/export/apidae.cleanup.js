'use strict'

const path = require('path'),
  request = require('request'),
  Apidae = require(path.resolve('./library/export/apidae.js')),
  config = require(path.resolve('./config/config.js'))

class ApidaeCleanup extends Apidae {
  constructor() {
    super()
  }

  cleanup(product, cleanupMode, callback) {
    const actions = {
      masking: {
        mode: 'DEMANDE_MASQUAGE',
        expectedStatus: 'DEMANDE_MASQUAGE_SENT'
      },
      deletion: {
        mode: 'DEMANDE_SUPPRESSION',
        expectedStatus: 'DEMANDE_SUPPRESSION_SENT'
      }
    }

    const action = actions[cleanupMode]

    if (!action) {
      return callback(new Error('Mode cleanup Apidae invalide : ' + cleanupMode))
    }

    if (!product || !/^\d+$/.test(String(product.specialIdSitra || ''))) {
      return callback(new Error('Pas de specialIdSitra Apidae valide'))
    }

    this.__getSitraToken(this, product, null, (accessToken) => {
      if (!accessToken) {
        return callback(new Error('Token OAuth Apidae non obtenu'))
      }

      request(
        {
          url: `https://${config.sitra.api.host}${config.sitra.api.path}`,
          method: 'PUT',
          formData: {
            mode: action.mode,
            id: product.specialIdSitra
          },
          json: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        },
        (err, httpResponse, body) => {
          const statusCode = httpResponse ? httpResponse.statusCode : null
          const ok =
            !err &&
            statusCode === 200 &&
            body &&
            body.status === action.expectedStatus

          if (!ok) {
            const error = err || new Error(
              'Reponse Apidae inattendue pour ' + action.mode + ' : ' + JSON.stringify(body)
            )
            error.statusCode = statusCode
            error.body = body
            return callback(error, {
              statusCode,
              body
            })
          }

          return callback(null, {
            statusCode,
            body
          })
        }
      )
    })
  }
}

module.exports = ApidaeCleanup
