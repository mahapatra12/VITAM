const router = require("express").Router();
const roleOrSubRoleMiddleware = require("../middleware/roleOrSubRoleMiddleware");
const { getHodStats } = require("../controllers/hodController");

router.get("/dashboard", roleOrSubRoleMiddleware({ roles: ["superadmin"], subRoles: ["hod"] }), getHodStats);

module.exports = router;
