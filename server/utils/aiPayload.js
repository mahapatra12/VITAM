const DEFAULT_MAX_AI_PAYLOAD_CHARS = Number(process.env.AI_MAX_PAYLOAD_CHARS || 6000);

const createReplacer = () => {
    const seen = new WeakSet();

    return (_key, value) => {
        if (typeof value === "bigint") {
            return value.toString();
        }

        if (Buffer.isBuffer(value)) {
            return `[binary:${value.length}]`;
        }

        if (value instanceof Date) {
            return value.toISOString();
        }

        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return "[circular]";
            }
            seen.add(value);
        }

        return value;
    };
};

const toAiPayloadSnippet = (value, maxLength = DEFAULT_MAX_AI_PAYLOAD_CHARS) => {
    let serialized = "";

    try {
        if (typeof value === "string") {
            serialized = value;
        } else if (value === undefined) {
            serialized = "";
        } else {
            serialized = JSON.stringify(value, createReplacer());
        }
    } catch (_) {
        serialized = "[unserializable]";
    }

    const normalized = String(serialized || "").replace(/\s+/g, " ").trim();
    if (normalized.length <= maxLength) {
        return {
            text: normalized,
            truncated: false
        };
    }

    return {
        text: `${normalized.slice(0, maxLength)}… [truncated]`,
        truncated: true
    };
};

module.exports = {
    DEFAULT_MAX_AI_PAYLOAD_CHARS,
    toAiPayloadSnippet
};
