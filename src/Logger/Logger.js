import RNLogs from 'react-native-logs';

const options = {
  logDirectory: 'logs', // Directory to store logs
  dateFormat: 'YYYY-MM-DD',
  infoFile: 'info.log', // Name of the info log file
  errorFile: 'error.log', // Name of the error log file
  warnFile: 'warn.log', // Name of the warn log file
  debugFile: 'debug.log', // Name of the debug log file
  timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
};

const Logger = new RNLogs(options);

export default Logger;
