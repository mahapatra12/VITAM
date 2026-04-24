const crypto = require('crypto');

/**
 * [VITAM AI] Enterprise Security Layer: Data-At-Rest Cryptographic Vault
 * 
 * Implements AES-256-GCM (Advanced Encryption Standard in Galois/Counter Mode).
 * GCM provides both data confidentiality and authenticity (MAC verification).
 */
class CryptoVault {
    constructor() {
        // Must be exactly 32 bytes (256 bits)
        // If JWT_SECRET is too short, we buffer it with a secure hash derivation
        const baseKey = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'vitam-fallback-secure-key-32-byte';
        this.encryptionKey = crypto.createHash('sha256').update(String(baseKey)).digest();
        this.algorithm = 'aes-256-gcm';
    }

    /**
     * Encrypts plaintext into a secure hexadecimal string payload containing the IV, Tag, and Ciphertext.
     */
    encrypt(text) {
        if (!text) return text;
        
        // Prevent double encryption if the string is already a structured vault string
        if (typeof text === 'string' && text.startsWith('VAULT::')) return text;

        try {
            // Initialization Vector (12 bytes is standard for GCM)
            const iv = crypto.randomBytes(12);
            
            const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
            let encrypted = cipher.update(String(text), 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            // Authentication Tag (16 bytes)
            const authTag = cipher.getAuthTag().toString('hex');
            
            // Pack output cleanly into a recoverable string format
            return `VAULT::${iv.toString('hex')}::${authTag}::${encrypted}`;
        } catch (err) {
            console.error('[CryptoVault] Integrity Error during Encryption:', err);
            return text; // Fallback gracefully if panic occurs
        }
    }

    /**
     * Decrypts a vault string back to readable plaintext dynamically.
     */
    decrypt(encryptedString) {
        if (!encryptedString) return encryptedString;
        
        // Return immediately if it's plaintext
        if (typeof encryptedString !== 'string' || !encryptedString.startsWith('VAULT::')) {
            return encryptedString;
        }

        try {
            // Unpack the vault structure
            const parts = encryptedString.split('::');
            if (parts.length !== 4) return encryptedString;

            const iv = Buffer.from(parts[1], 'hex');
            const authTag = Buffer.from(parts[2], 'hex');
            const ciphertext = parts[3];

            const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
            decipher.setAuthTag(authTag); // Verifies anti-tampering MAC lock
            
            let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (err) {
            console.error('[CryptoVault] Severe Integrity Breach detected during Decryption or Invalid Master Key.');
            return "[REDACTED_CORRUPTED_CIPHER]";
        }
    }
}

module.exports = new CryptoVault();
