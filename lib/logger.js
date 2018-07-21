const winston = require('winston');
const { combine, timestamp, printf, colorize, splat } = winston.format;

const myFormat = printf(info => {
    return `${info.timestamp ? info.timestamp + ' ' : ''}${info.level}: ${info.message}`;
  });

function getFormat(enable) {
    return enable ? combine(colorize(), timestamp(), splat(), myFormat) : combine(colorize(), splat(), myFormat)
}

function setTimestamp(enable) {
    log.format = getFormat(enable)
};

const log = winston.createLogger({
    format: getFormat(true),
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = {
    log, setTimestamp
};