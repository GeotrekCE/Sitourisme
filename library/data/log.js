const 
    path = require('path'),
    fs = require('fs'),
    logFile = path.join(__dirname, 'debug.log')

function writeLog(message, data = null) {
  const timestamp = new Date().toISOString()

  const fullMessage = data
    ? `${timestamp} - ${message}\n${JSON.stringify(data, null, 2)}\n\n`
    : `${timestamp} - ${message}\n`

  fs.appendFile(logFile, fullMessage, (err) => {
    if (err) console.error('Erreur écriture log:', err)
  })
}

module.exports = {
  writeLog
}