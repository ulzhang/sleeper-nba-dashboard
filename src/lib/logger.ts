import { LogCategory, LogLevel, currentConfig, LOGGING_CONFIG, LogConfig } from './logConfig';

// Apply a preset configuration
export function applyLogPreset(preset: keyof typeof LOGGING_CONFIG) {
  Object.assign(currentConfig, LOGGING_CONFIG[preset]);
}

// Update specific configuration options
export function updateLogConfig(config: Partial<LogConfig>) {
  Object.assign(currentConfig, config);
}

// Enable specific logging categories
export function enableLogging(...categories: LogCategory[]) {
  categories.forEach(category => {
    if (!currentConfig.enabledCategories.includes(category)) {
      currentConfig.enabledCategories.push(category);
    }
  });
}

// Disable specific logging categories
export function disableLogging(...categories: LogCategory[]) {
  currentConfig.enabledCategories = currentConfig.enabledCategories.filter(
    cat => !categories.includes(cat)
  );
}

// Clear all logging categories except 'error'
export function clearLogging() {
  currentConfig.enabledCategories = ['error'];
}

// Format the log message with optional timestamp
function formatLogMessage(category: LogCategory, message: string): string {
  const timestamp = currentConfig.showTimestamp ? `${new Date().toISOString()} ` : '';
  return `[${category.toUpperCase()}] ${timestamp}${message}`;
}

// Main logging function
export function log(category: LogCategory, message: string, data?: any) {
  if (currentConfig.enabledCategories.includes(category)) {
    const formattedMessage = formatLogMessage(category, message);
    
    if (data !== undefined) {
      console.log(formattedMessage, data);
    } else {
      console.log(formattedMessage);
    }
  }
}

// Error logging function (always enabled)
export function logError(message: string, error?: any) {
  const formattedMessage = formatLogMessage('error', message);
  
  if (error) {
    console.error(formattedMessage, error);
  } else {
    console.error(formattedMessage);
  }
}

// Performance logging
export function logPerformance(operation: string, startTime: number) {
  if (currentConfig.performance) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    log('performance', `${operation} took ${duration.toFixed(2)}ms`);
  }
}

// Grouped logging for related operations
export function logGroup(category: LogCategory, groupName: string, fn: () => void) {
  if (currentConfig.enabledCategories.includes(category) && currentConfig.grouping) {
    const formattedGroupName = formatLogMessage(category, groupName);
    console.group(formattedGroupName);
    fn();
    console.groupEnd();
  } else {
    fn();
  }
}

// Development-only logging
export function devLog(category: LogCategory, message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    log(category, message, data);
  }
}

// Initialize logging based on environment
export function initializeLogging() {
  const isDev = process.env.NODE_ENV === 'development';
  applyLogPreset(isDev ? 'development' : 'minimal');
  
  // Enable all logging categories in development by default
  if (isDev) {
    enableLogging(
      'api',
      'performance',
      'players',
      'scoring',
      'stats',
      'debug',
      'ui',
      'router',
      'data',
      'init',
      'config'
    );
  }
}