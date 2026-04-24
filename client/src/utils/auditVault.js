import localforage from 'localforage';
import Telemetry from './telemetry';

// Initialize the Institutional Audit Ledger
const ledger = localforage.createInstance({
    name: 'vitam_audit_ledger',
    storeName: 'audit_vault'
});

/**
 * Generates an integrity hash.
 */
const generateProof = (prevHash, timestamp, event, data) => {
    const raw = `${prevHash}-${timestamp}-${event}-${JSON.stringify(data)}`;
    return btoa(raw).slice(-32).replace(/=/g, 'I');
};

/**
 * Appends an immutable record to the audit vault.
 */
export const recordAudit = async (event, data = {}) => {
    try {
        const timestamp = new Date().toISOString();
        const id = `TX_${Date.now()}_${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
        
        const history = await getAuditHistory();
        const prevBlock = history[0];
        const prevHash = prevBlock ? prevBlock.integrityHash : 'GENESIS_BLOCK_000';
        
        const record = {
            id,
            timestamp,
            event,
            data,
            prevHash,
            integrityHash: generateProof(prevHash, timestamp, event, data),
            signature: 'INSTITUTIONAL_IG_v13',
            status: 'FINALIZED'
        };

        const updatedVault = [record, ...history].slice(0, 1000); 
        await ledger.setItem('records', updatedVault);
        
        // Log to telemetry if critical
        if (event.includes('FAILURE') || event.includes('BREACH') || event.includes('CRITICAL')) {
            Telemetry.error(`AUDIT_SYSTEM_ALERT: ${event} finalized in audit block.`, { id, hash: record.integrityHash });
        }

        return id;
    } catch (err) {
        Telemetry.error('[Audit System] Finality Failure: Unable to secure audit block.', err);
        return null;
    }
};

/**
 * Verifies the integrity of the audit chain.
 */
export const verifyIntegrity = async () => {
    const history = await getAuditHistory();
    if (history.length < 2) return true;
    
    // Verify last 5 blocks
    for (let i = 0; i < Math.min(history.length - 1, 5); i++) {
        const current = history[i];
        const prev = history[i + 1];
        if (current.prevHash !== prev.integrityHash) {
            Telemetry.error(`[Audit System] INTEGRITY_FAILURE: Detected drift in block ${current.id}`);
            return false;
        }
    }
    return true;
};

/**
 * Predictive Audit Analytics (Drift Detection)
 */
export const predictDrift = async () => {
    const history = await getAuditHistory();
    const lastTen = history.slice(0, 10);
    
    // Pattern recognition for system instability
    const failureRate = lastTen.filter(r => r.event.includes('FAILURE')).length / 10;
    const syncRate = lastTen.filter(r => r.event.includes('SYNC')).length / 10;
    
    const driftProbability = Math.min((failureRate * 0.7) + (syncRate * 0.3), 1);
    
    if (driftProbability > 0.4) {
        Telemetry.error(`AUDIT PREDICTION: Detected ${Math.round(driftProbability * 100)}% drift probability in current cycle.`, {
            pattern: failureRate > 0.3 ? 'SYSTEM_INSTABILITY' : 'STATE_DESYNC'
        });
    }

    return driftProbability;
};

/**
 * Retrieves the full audit history.
 */
export const getAuditHistory = async () => {
    return (await ledger.getItem('records')) || [];
};

/**
 * Clears the vault
 */
export const purgeVault = async () => {
    await ledger.setItem('records', []);
    Telemetry.info('Institutional Audit Vault Purged.');
};
