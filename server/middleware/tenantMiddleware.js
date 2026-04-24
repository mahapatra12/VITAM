const mongoose = require("mongoose");
const College = require("../models/College");

const TENANT_CACHE_TTL_MS = Number(process.env.TENANT_CACHE_TTL_MS || 60000);
const TENANT_CACHE_MAX = Number(process.env.TENANT_CACHE_MAX || 500);
const tenantCache = new Map();

const normalizeDomain = (value) => String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .toLowerCase();

const makeCacheKey = (prefix, value) => `${prefix}:${value}`;

const pruneExpiredCacheEntries = () => {
    const now = Date.now();
    for (const [key, entry] of tenantCache.entries()) {
        if (entry.expiresAt <= now) {
            tenantCache.delete(key);
        }
    }
};

const readTenantCache = (key) => {
    if (!key) return { hit: false, value: null };

    const entry = tenantCache.get(key);
    if (!entry) {
        return { hit: false, value: null };
    }

    if (entry.expiresAt <= Date.now()) {
        tenantCache.delete(key);
        return { hit: false, value: null };
    }

    return { hit: true, value: entry.value };
};

const writeTenantCache = (key, value) => {
    if (!key) return;

    pruneExpiredCacheEntries();
    if (tenantCache.size >= TENANT_CACHE_MAX) {
        const oldestKey = tenantCache.keys().next().value;
        if (oldestKey) {
            tenantCache.delete(oldestKey);
        }
    }

    tenantCache.set(key, {
        value,
        expiresAt: Date.now() + TENANT_CACHE_TTL_MS
    });
};

const serializeTenant = (tenant) => tenant ? {
    id: tenant._id,
    plan: tenant.plan,
    domain: tenant.domain
} : null;

/**
 * Lightweight multi-tenant resolver.
 * Resolves tenant by (priority): x-api-key -> x-college-id -> x-college-domain.
 * Attaches req.tenant with { id, plan, domain } but does not block if missing.
 */
module.exports = async function tenantMiddleware(req, res, next) {
    try {
        if (["OPTIONS", "HEAD"].includes(req.method) || req.path === "/health") {
            req.tenant = null;
            return next();
        }

        const apiKey = req.header("x-api-key") || req.header("x-tenant-api-key");
        const collegeId = req.header("x-college-id") || req.header("x-tenant-id");
        const domain = normalizeDomain(req.header("x-college-domain") || req.header("x-tenant-domain") || req.hostname);

        const apiKeyCacheKey = apiKey ? makeCacheKey("apiKey", apiKey) : null;
        const collegeIdCacheKey = collegeId ? makeCacheKey("collegeId", collegeId) : null;
        const domainCacheKey = domain ? makeCacheKey("domain", domain) : null;

        for (const cacheKey of [apiKeyCacheKey, collegeIdCacheKey, domainCacheKey]) {
            const cached = readTenantCache(cacheKey);
            if (cached.hit) {
                req.tenant = cached.value;
                return next();
            }
        }

        let tenant = null;
        if (apiKey) {
            tenant = await College.findOne({ apiKey, isActive: true }).lean();
        }
        if (!tenant && collegeId && mongoose.Types.ObjectId.isValid(collegeId)) {
            tenant = await College.findOne({ _id: collegeId, isActive: true }).lean();
        }
        if (!tenant && domain) {
            tenant = await College.findOne({ domain, isActive: true }).lean();
        }

        req.tenant = serializeTenant(tenant);

        for (const cacheKey of [apiKeyCacheKey, collegeIdCacheKey, domainCacheKey]) {
            writeTenantCache(cacheKey, req.tenant);
        }

        return next();
    } catch (err) {
        console.error("Tenant resolution error:", err);
        // Do not block requests; continue without tenant to avoid outages
        req.tenant = null;
        return next();
    }
};
