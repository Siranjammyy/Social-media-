import Report from '../models/Report.js';

// @desc    Submit content or user report
// @route   POST /api/reports
// @access  Private
export const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide targetType, targetId, and a reason for the report.',
      });
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      description: description ? description.trim() : '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our safety team will review it.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports (Admin only)
// @route   GET /api/reports
// @access  Admin
export const getReports = async (req, res, next) => {
  try {
    const status = req.query.status || 'pending';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = status === 'all' ? {} : { status };

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('reporter', 'name username email')
      .populate('reviewedBy', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status (Admin only)
// @route   PATCH /api/reports/:id
// @access  Admin
export const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['reviewed', 'dismissed', 'action_taken'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report status.',
      });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status,
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: `Report marked as ${status}.`,
      report,
    });
  } catch (error) {
    next(error);
  }
};
