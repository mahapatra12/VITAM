const express = require("express");
const router = express.Router();
const roleMiddleware = require("../middleware/roleMiddleware");
const { 
    getDashboard, 
    getProfile, 
    updateProfileImage, 
    getAcademics, 
    getFinance, 
    getBusSchedule,
    getPlacement
} = require("../controllers/studentController");

// All student routes require STUDENT role
router.get("/dashboard", roleMiddleware(["STUDENT"]), getDashboard);
router.get("/profile", roleMiddleware(["STUDENT"]), getProfile);
router.put("/profile/image", roleMiddleware(["STUDENT"]), updateProfileImage);
router.get("/academics", roleMiddleware(["STUDENT"]), getAcademics);
router.get("/finance", roleMiddleware(["STUDENT"]), getFinance);
router.get("/bus", roleMiddleware(["STUDENT"]), getBusSchedule);
router.get("/placement", roleMiddleware(["STUDENT"]), getPlacement);

module.exports = router;
