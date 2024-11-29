export type LogCategory = 
  | 'players'     // Player-related operations
  | 'scoring'     // Fantasy point calculations
  | 'api'         // API calls and responses
  | 'stats'       // Statistics processing
  | 'cache'       // Cache operations
  | 'debug'       // General debugging
  | 'error'       // Error logging
  | 'performance' // Performance metrics
  | 'ui'          // UI component rendering and updates
  | 'router'      // Next.js routing operations
  | 'data'        // Data fetching and transformations
  | 'init'        // Initialization and setup
  | 'config';     // Configuration changes

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogConfig {
  enabledCategories: LogCategory[];
  logLevel: LogLevel;
  showTimestamp: boolean;
  grouping: boolean;
  performance: boolean;
}

// Logging configuration object
export const LOGGING_CONFIG: Record<string, LogConfig> = {
  // Development logging settings
  development: {
    // Easily toggle categories by commenting/uncommenting
    enabledCategories: [
      // Core logging
      'error',     // Always keep error logging
      'api',       // API call details
      'performance', // Performance metrics
      'players',   // Player-related logs
      'scoring',   // Fantasy point calculation logs
      'stats',     // Stats processing
      'debug',     // General debugging
      'ui',        // UI rendering logs
      'router',    // Routing logs
      'data',      // Data fetching logs
      'init',      // Initialization logs
      'config'     // Configuration change logs
    ],
    logLevel: 'info',
    showTimestamp: true,
    grouping: true,
    performance: true
  },
  
  // Production logging settings (minimal)
  production: {
    enabledCategories: ['error'],
    logLevel: 'error',
    showTimestamp: false,
    grouping: false,
    performance: false
  },

  // Minimal logging preset
  minimal: {
    enabledCategories: ['error'],
    logLevel: 'error',
    showTimestamp: false,
    grouping: false,
    performance: false
  }
};

// Current configuration (initialized with development defaults)
export const currentConfig: LogConfig = { ...LOGGING_CONFIG.development };
