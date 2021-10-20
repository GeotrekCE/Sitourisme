'use strict';

/*
 * Config codes for terminal
 * More details :
 *   https://telepathy.freedesktop.org/doc/telepathy-glib/telepathy-glib-debug-ansi.html#TP-ANSI-FG-BLACK:CAPS
 */
var cfg = {
	// Reset tag
	reset: '\x1b[0m',
	// Font weight tag
	bold: '\x1b[1m',
	boldClose: '\x1b[22m',
	// Font color tag
	black: '\x1b[30m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m'
};

/**
 * function log
 * Method to output a message into the console styled with font color and/or bold font weight
 * @param pColor
 * @param pMsg
 * @param pBold optional
 */
function __log(pMsg, pColor, pBold) {
	// Define the output console font color
	var color =
			pColor && cfg[pColor.toLowerCase()]
				? cfg[pColor.toLowerCase()]
				: cfg.white,
		openTag = pBold ? color + cfg.bold : color,
		closeTag = pBold ? cfg.boldClose + cfg.reset : cfg.reset;

	// Log the output into the console
	console.log(openTag, pMsg, closeTag);
}
exports.log = __log;

function __success(pMsg) {
	__log(pMsg, 'green');
}
exports.success = __success;

function __info(pMsg) {
	__log(pMsg, 'blue');
}
exports.info = __info;

function __warn(pMsg) {
	__log(pMsg, 'yellow');
}
exports.warn = __warn;

function __error(pMsg) {
	__log(pMsg, 'red');
}
exports.error = __error;

function __debug(pMsg) {
	__log(pMsg, 'cyan', true);
}
exports.debug = __debug;
