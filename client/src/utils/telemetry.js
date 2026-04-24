/**
 * VITAM OS [Institutional Monitoring Engine]
 * 
 * Centralized logging system to eliminate console noise while maintaining
 * deep institutional insight. All logs are tiered and can be forwarded to the 
 * backend for audit analysis.
 */

import { API_BASE_URL } from '../config/runtime';

const LOG_LEVELS = {
  INFO: { label: 'INFO', color: '#60a5fa' }, // Blue
  WARNING: { label: 'WARNING', color: '#fbbf24' }, // Amber
  ERROR: { label: 'ERROR', color: '#f87171' }, // Red
  CRITICAL: { label: 'CRITICAL', color: '#ef4444' }, // Bright Red
};

// Internal buffer for the System Dashboard to consume
const telemetryBuffer = [];
const MAX_BUFFER_SIZE = 100;

class InstitutionalTelemetry {
  constructor() {
    let debugFromStorage = false;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        debugFromStorage = window.localStorage.getItem('VITAM_DEBUG') === 'true';
      }
    } catch (_error) {
      debugFromStorage = false;
    }
    this.isDebug = debugFromStorage || import.meta.env.VITE_DEBUG_TELEMETRY === 'true';
  }

  log(level, message, detail = null) {
    const entry = {
      level: level.label,
      msg: message,
      detail,
      timestamp: new Date().toISOString(),
      id: `ev-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Buffer for UI display
    telemetryBuffer.unshift(entry);
    if (telemetryBuffer.length > MAX_BUFFER_SIZE) telemetryBuffer.pop();

    // Console output logic
    if (this.isDebug) {
      const colorStyle = `color: ${level.color}; font-weight: bold;`;
      if (detail) {
        console.groupCollapsed(`%c[${level.label}] ${message}`, colorStyle);
        console.dir(detail);
        console.groupEnd();
      } else {
        console.log(`%c[${level.label}] ${message}`, colorStyle);
      }
    }

    // Forwarding logic for critical events
    if (level === LOG_LEVELS.CRITICAL || level === LOG_LEVELS.ERROR) {
      this.forwardToBackend(entry);
    }

    // Trigger UI updates via a institutional event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vitam_system_event', { detail: entry }));
    }
  }

  info(msg, detail) { this.log(LOG_LEVELS.INFO, msg, detail); }
  warn(msg, detail) { this.log(LOG_LEVELS.WARNING, msg, detail); }
  remediate(msg, detail) { this.log(LOG_LEVELS.WARNING, `[Strategic Remediation] ${msg}`, detail); }
  error(msg, detail) { this.log(LOG_LEVELS.ERROR, msg, detail); }
  critical(msg, detail) { this.log(LOG_LEVELS.CRITICAL, msg, detail); }

  // Institutional aliases
  advisory(msg, detail) { this.warn(msg, detail); }
  security(msg, detail) { this.error(msg, detail); }
  protocol(msg, detail) { this.remediate(msg, detail); }
  warden(msg, detail) { this.warn(`[Warden] ${msg}`, detail); }
  sentinel(msg, detail) { this.error(`[Sentinel] ${msg}`, detail); }
  remit(msg, detail) { this.info(`[Remit] ${msg}`, detail); }

  async forwardToBackend(entry) {
    // Only attempt if we have a token (logged in)
    let token = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        token = window.localStorage.getItem('vitam_token');
      }
    } catch (_error) {
      token = null;
    }
    if (!token) return;

    try {
      // Use raw fetch to avoid circular dependency with apiClient
      fetch(`${API_BASE_URL}/audit/telemetry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(entry),
      }).catch(() => {}); // Silent fail for forwarding
    } catch (_error) {
      // Fail silently to avoid infinite error loops
    }
  }

  getBuffer() {
    return [...telemetryBuffer];
  }

  clearBuffer() {
    telemetryBuffer.length = 0;
  }
}

const Telemetry = new InstitutionalTelemetry();
export default Telemetry;
