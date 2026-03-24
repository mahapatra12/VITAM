const cron = require("node-cron");
const Student = require("../models/Student");

const generateNewRoll = (student) => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${student.branch}${year}${random}`;
};

// Run promotion job every day at midnight
const initPromotionJob = () => {
    cron.schedule("0 0 * * *", async () => {
        console.log("Running Student Promotion Job...");
        try {
            const eligibleStudents = await Student.find({ translationEligible: true });

            for (let student of eligibleStudents) {
                // In a real system, we'd check if 10 days have passed since examCompletedDate
                // For this demo, we assume the flag is set after 10 days of processing
                student.semester += 1;
                student.rollNo = generateNewRoll(student);
                student.promotionEligible = false;
                student.examCompleted = false;
                
                await student.save();
                console.log(`Promoted student ${student.userId} to semester ${student.semester}`);
            }
        } catch (err) {
            console.error("Promotion Job Error:", err);
        }
    });
};

module.exports = initPromotionJob;
