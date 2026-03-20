import { Profile, College, FinancialAidReport, User } from '../models/index.js';
import { analyzeFinancialAid } from '../services/financialAidAnalyzer.js';
import logger from '../utils/logger.js';

/**
 * Generate financial aid report for a college
 */
export const generateFinancialAidReport = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    const userId = req.user.id;

    // Get user profile
    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.status(400).json({
        message: 'Please complete your profile before generating reports',
      });
    }

    // Get college
    const college = await College.findByPk(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    const force = req.query.force === 'true';

    // Check if report already exists (cache for 7 days)
    const existingReport = await FinancialAidReport.findOne({
      where: { user_id: userId, college_id: collegeId },
      order: [['created_at', 'DESC']],
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (!force && existingReport && existingReport.created_at > sevenDaysAgo) {
      logger.info(`Returning cached report for ${college.name}`);
      return res.json({
        cached: true,
        report: existingReport,
      });
    }

    // Delete stale report so a fresh one is created
    if (existingReport) {
      await existingReport.destroy();
    }

    // Generate new analysis
    logger.info(`Generating financial aid report for ${college.name}`);
    const analysis = await analyzeFinancialAid(profile, college);

    // Create report record
    const report = await FinancialAidReport.create({
      user_id: userId,
      college_id: collegeId,
      college_name: college.name,
      estimated_tuition: analysis.estimated_tuition,
      estimated_room_board: analysis.estimated_room_board,
      estimated_total_cost: analysis.estimated_total_cost,
      estimated_grants: analysis.estimated_grants,
      estimated_loans: analysis.estimated_loans,
      estimated_work_study: analysis.estimated_work_study,
      estimated_net_price: analysis.estimated_net_price,
      ai_analysis: analysis,
      recommendations: analysis.recommendations || [],
      analysis_basis: JSON.stringify({
        income: profile.family_income,
        household_size: profile.household_size,
        gpa: profile.gpa_weighted || profile.gpa_unweighted,
        state: profile.state,
      }),
    });

    logger.info(`Report generated successfully for ${college.name}`);

    res.json({
      message: 'Financial aid report generated successfully',
      report,
    });
  } catch (error) {
    logger.error('Failed to generate financial aid report:', error);
    next(error);
  }
};

/**
 * Get financial aid report
 */
export const getFinancialAidReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const report = await FinancialAidReport.findOne({
      where: { id: reportId, user_id: userId },
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ report });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reports for a user
 */
export const getUserReports = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const reports = await FinancialAidReport.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    res.json({
      reports,
      total: reports.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a report
 */
export const deleteReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const report = await FinancialAidReport.findOne({
      where: { id: reportId, user_id: userId },
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await report.destroy();

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Compare multiple colleges
 */
export const compareColleges = async (req, res, next) => {
  try {
    const { collegeIds } = req.body;
    const userId = req.user.id;

    if (!collegeIds || !Array.isArray(collegeIds) || collegeIds.length === 0) {
      return res.status(400).json({ message: 'Please provide college IDs to compare' });
    }

    // Get or create reports for each college
    const reports = [];
    for (const collegeId of collegeIds) {
      const college = await College.findByPk(collegeId);
      if (!college) continue;

      let report = await FinancialAidReport.findOne({
        where: { user_id: userId, college_id: collegeId },
        order: [['created_at', 'DESC']],
      });

      if (!report) {
        // Generate report if doesn't exist
        const profile = await Profile.findOne({ where: { user_id: userId } });
        if (profile) {
          const analysis = await analyzeFinancialAid(profile, college);
          report = await FinancialAidReport.create({
            user_id: userId,
            college_id: collegeId,
            college_name: college.name,
            estimated_tuition: analysis.estimated_tuition,
            estimated_grants: analysis.estimated_grants,
            estimated_loans: analysis.estimated_loans,
            estimated_net_price: analysis.estimated_net_price,
            ai_analysis: analysis,
            recommendations: analysis.recommendations || [],
          });
        }
      }

      if (report) {
        reports.push(report);
      }
    }

    res.json({
      message: `Comparison data for ${reports.length} colleges`,
      reports,
      comparison: generateComparison(reports),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate comparison summary
 */
const generateComparison = (reports) => {
  if (reports.length === 0) return null;

  const mostAffordable = reports.reduce((prev, current) =>
    (prev.estimated_net_price || Infinity) <
    (current.estimated_net_price || Infinity)
      ? prev
      : current
  );

  const mostAid = reports.reduce((prev, current) =>
    (prev.estimated_grants || 0) > (current.estimated_grants || 0) ? prev : current
  );

  const averageNetPrice =
    reports.reduce((sum, r) => sum + (r.estimated_net_price || 0), 0) /
    reports.length;

  return {
    mostAffordable: {
      name: mostAffordable.college_name,
      netPrice: mostAffordable.estimated_net_price,
    },
    mostGrant: {
      name: mostAid.college_name,
      grants: mostAid.estimated_grants,
    },
    averageNetPrice: Math.round(averageNetPrice),
  };
};
