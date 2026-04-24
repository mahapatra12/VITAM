const Scholarship = require('../models/Scholarship');
const ScholarshipApplication = require('../models/ScholarshipApplication');
const User = require('../models/User');

const getScholarships = async (req, res) => {
  try {
    const query = req.tenant?.id ? { collegeId: req.tenant.id } : {};
    const scholarships = await Scholarship.find(query);
    res.json(scholarships);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const getApplications = async (req, res) => {
  try {
    const query = req.tenant?.id ? { collegeId: req.tenant.id } : {};
    const applications = await ScholarshipApplication.find(query)
      .populate('studentId', 'name email rollNo department')
      .populate('scholarshipId', 'name color id')
      .sort({ createdAt: -1 });

    const formatted = applications.map(app => ({
      id: app.id,
      _id: app._id,
      name: app.studentId.name,
      rollNo: app.studentId.rollNo,
      dept: app.studentId.department,
      cgpa: app.academicSnapshot.cgpa,
      attendance: app.academicSnapshot.attendance,
      schId: app.scholarshipId.id,
      schName: app.scholarshipId.name,
      schColor: app.scholarshipId.color,
      status: app.status,
      aiScore: app.aiScore,
      income: app.income,
      appliedOn: app.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      remarks: app.remarks
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id, status, remarks } = req.body;
    const application = await ScholarshipApplication.findOne({ id });

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    application.status = status;
    if (remarks !== undefined) application.remarks = remarks;

    await application.save();
    res.json({ msg: `Application status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const getScholarshipStats = async (req, res) => {
  try {
    const query = req.tenant?.id ? { collegeId: req.tenant.id } : {};
    const scholarships = await Scholarship.find(query);
    const applications = await ScholarshipApplication.find(query);

    const totalBudget = scholarships.reduce((sum, s) => sum + (s.budget || 0), 0);
    const awardedApps = applications.filter(a => a.status === 'awarded');
    const budgetUsed = awardedApps.length * 35000; // Estimated average disbursement

    res.json({
      total: applications.length,
      awarded: awardedApps.length,
      pending: applications.filter(a => a.status === 'submitted').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      totalBudget,
      budgetUsed
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  getScholarships,
  getApplications,
  updateApplicationStatus,
  getScholarshipStats
};
