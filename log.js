var Console = require('winston');
Console.add(Console.transports.File, { filename: 'applog.log' });
module.exports = Console;