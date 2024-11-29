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
  | 'config'      // Configuration changes
  | 'research';   // Research page and data operations

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
      'error',     // Always keep error logging
      'api',       // API call logs
      'data',      // Data fetching logs
      // 'players',   // Player-related logs
      // 'research',  // Research page logs
      // 'ui',        // UI rendering logs
      // 'router',    // Routing logs
      // 'init',      // Initialization logs
      // 'config'     // Configuration change logs
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
