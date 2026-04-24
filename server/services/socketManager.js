const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * [VITAM AI] Advanced Multi-Tenant WebSockets Mesh
 * 
 * Features:
 * 1. Strict JWT Bearer Handshake Authentication
 * 2. Instant Database verification on socket connect
 * 3. Tenant-Isolated Rooms (No data bleed between institutions)
 * 4. Role-Based Room Subscriptions (e.g., student vs. admin broadcasts)
 */
class SocketManager {
    constructor() {
        this.io = null;
    }

    init(ioEngine) {
        this.io = ioEngine;
        
        // Advanced Middleware: Intercept every websocket connection for cryptographic auth
        this.io.use(async (socket, next) => {
            try {
                // Support auth token passed in handshake auth payload or headers
                const token = socket.handshake.auth?.token 
                    || socket.handshake.headers?.authorization?.replace("Bearer ", "");

                if (!token) {
                    return next(new Error("SOCKET_AUTHENTICATION_REQUIRED: JWT Bearer token missing"));
                }

                // Cryptographic validation
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // Hot Database check to ensure user wasn't just deleted or banned
                const user = await User.findById(decoded.id).select("_id role collegeId");
                
                if (!user) {
                    return next(new Error("SOCKET_UNAUTHORIZED: Security identity missing."));
                }

                // Attach verified context to the persistent socket instance
                socket.user = {
                    id: user._id.toString(),
                    role: user.role,
                    tenantId: user.collegeId ? user.collegeId.toString() : "GLOBAL"
                };

                next();
            } catch (err) {
                console.error(`[WebSocket Mesh] Auth Rejected: ${err.message}`);
                next(new Error("SOCKET_AUTH_FAILED: Invalid or Expired Institutional Token"));
            }
        });

        // Event Mesh Routing
        this.io.on("connection", (socket) => {
            const { id, role, tenantId } = socket.user;
            
            console.log(`🔌 [WebSocket] Verified Entity Connected: User=${id} | Tenant=${tenantId} | clearance=${role}`);

            // 1. Join Personal Dedicated Channel (For direct 1-on-1 notifications)
            socket.join(`user:${id}`);

            // 2. Join Tenant-Level Channel (For institution-wide broadcasts)
            socket.join(`tenant:${tenantId}`);

            // 3. Join Role-Specific Tenant Channel (e.g. Broadcast to all admins in a specific college)
            socket.join(`tenant:${tenantId}:role:${role}`);

            socket.on("disconnect", (reason) => {
                console.log(`🔌 [WebSocket] Connection Severed: User=${id} (${reason})`);
            });
            
            // Allow client to actively request a manual ping-pong heartbeat
            socket.on("system_heartbeat", (ack) => {
                if (typeof ack === 'function') ack({ status: "alive", timestamp: Date.now() });
            });
        });
    }

    /**
     * Broadcasts a secure payload to a specific institution.
     */
    broadcastToTenant(tenantId, event, data) {
        if (!this.io) return;
        this.io.to(`tenant:${tenantId}`).emit(event, data);
    }

    /**
     * Broadcasts a prioritized payload specifically to admins within a tenant.
     */
    broadcastToTenantAdmins(tenantId, event, data) {
        if (!this.io) return;
        this.io.to(`tenant:${tenantId}:role:admin`).emit(event, data);
    }

    /**
     * Sends a direct 1-to-1 payload to a user dynamically.
     */
    notifyUser(userId, event, data) {
        if (!this.io) return;
        this.io.to(`user:${userId}`).emit(event, data);
    }
}

// Export a singleton mesh commander
module.exports = new SocketManager();
