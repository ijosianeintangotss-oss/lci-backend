const MentorshipApplication = require('../models/mentorshipModel');
const path = require('path');
const fs = require('fs');

// Create new mentorship application
const createMentorshipApplication = async (req, res) => {
  try {
    console.log('Mentorship application request received:', req.body);
    console.log('Uploaded files:', req.files);

    const {
      fullName,
      email,
      phone,
      location,
      linkedin,
      portfolio,
      languages,
      tools,
      experience,
      availability,
      motivation,
      consent
    } = req.body;

    // Input validation
    if (!fullName || !email || !phone || !location || !experience || !availability || !motivation) {
      return res.status(400).json({
        message: 'All required fields must be filled'
      });
    }

    if (!consent || consent === 'false') {
      return res.status(400).json({
        message: 'You must consent to the data processing'
      });
    }

    // Parse languages and tools
    let parsedLanguages = [];
    let parsedTools = [];

    try {
      if (languages) {
        parsedLanguages = typeof languages === 'string' ? JSON.parse(languages) : languages;
      }
      if (tools) {
        parsedTools = typeof tools === 'string' ? JSON.parse(tools) : tools;
      }
    } catch (parseError) {
      console.error('Error parsing data:', parseError);
      return res.status(400).json({
        message: 'Invalid data format for languages or tools'
      });
    }

    // Check for required files
    if (!req.files || !req.files.cv || !req.files.coverLetter) {
      return res.status(400).json({
        message: 'CV and Cover Letter are required'
      });
    }

    // Create application data
    const applicationData = {
      fullName,
      email,
      phone,
      location,
      linkedin: linkedin || '',
      portfolio: portfolio || '',
      languages: parsedLanguages,
      tools: parsedTools,
      experience,
      availability,
      motivation,
      status: 'pending'
    };

    // Handle file uploads
    if (req.files.cv) {
      const cvFile = req.files.cv[0];
      applicationData.cv = {
        filename: cvFile.filename,
        path: cvFile.path,
        originalName: cvFile.originalname
      };
    }

    if (req.files.coverLetter) {
      const coverLetterFile = req.files.coverLetter[0];
      applicationData.coverLetter = {
        filename: coverLetterFile.filename,
        path: coverLetterFile.path,
        originalName: coverLetterFile.originalname
      };
    }

    // Create new application
    const application = new MentorshipApplication(applicationData);
    await application.save();

    console.log('Mentorship application created successfully for:', email);

    res.status(201).json({
      message: 'Mentorship application submitted successfully! We will review your application and get back to you soon.',
      applicationId: application._id
    });

  } catch (error) {
    console.error('Mentorship application error:', error);
    res.status(500).json({
      message: 'Server error during application submission',
      error: error.message
    });
  }
};

// Get all mentorship applications (for admin)
const getMentorshipApplications = async (req, res) => {
  try {
    const applications = await MentorshipApplication.find().sort({ createdAt: -1 });

    // Build full URLs for ALL files (client-uploaded and admin-replied)
    const applicationsWithUrls = applications.map(app => {
      const appObj = app.toObject();
      
      // Build CV URL - FIXED: Use full URL
      if (appObj.cv && appObj.cv.filename) {
        appObj.cv.downloadUrl = `${process.env.BASE_URL || 'https://apis.translatenexus.com'}/uploads/${appObj.cv.filename}`;
      }
      
      // Build Cover Letter URL - FIXED: Use full URL
      if (appObj.coverLetter && appObj.coverLetter.filename) {
        appObj.coverLetter.downloadUrl = `${process.env.BASE_URL || 'https://apis.translatenexus.com'}/uploads/${appObj.coverLetter.filename}`;
      }
      
      // Build reply files URLs - FIXED: Use full URL
      if (appObj.replyFiles && appObj.replyFiles.length > 0) {
        appObj.replyFiles = appObj.replyFiles.map(file => ({
          ...file,
          downloadUrl: `${process.env.BASE_URL || 'https://apis.translatenexus.com'}/uploads/${file.filename}`
        }));
      }
      
      return {
        ...appObj,
        id: app._id.toString(),
        submittedAt: app.createdAt
      };
    });

    res.json(applicationsWithUrls);
  } catch (error) {
    console.error('Get mentorship applications error:', error);
    res.status(500).json({
      message: 'Failed to fetch mentorship applications',
      error: error.message
    });
  }
};

// Get mentorship applications for specific client
const getClientMentorshipApplications = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('Fetching mentorship applications for email:', email);
    const applications = await MentorshipApplication.find({ email }).sort({ createdAt: -1 });

    // Build full URLs for ALL files (client-uploaded and admin-replied)
    const applicationsWithUrls = applications.map(app => {
      const appObj = app.toObject();
      
      // Build CV URL - FIXED: Use full URL
      if (appObj.cv && appObj.cv.filename) {
        appObj.cv.downloadUrl = `${process.env.BASE_URL || 'https://apis.translatenexus.com'}/uploads/${appObj.cv.filename}`;
      }
      
      // Build Cover Letter URL - FIXED: Use full URL
      if (appObj.coverLetter && appObj.coverLetter.filename) {
        appObj.coverLetter.downloadUrl = `${process.env.BASE_URL || 'https://apis.translatenexus.com'}/uploads/${appObj.coverLetter.filename}`;
      }
      
      // Build reply files URLs - FIXED: Use full URL
      if (appObj.replyFiles && appObj.replyFiles.length > 0) {
        appObj.replyFiles = appObj.replyFiles.map(file => ({
          ...file,
          downloadUrl: `${process.env.BASE_URL || 'https://apis.translatenexus.com'}/uploads/${file.filename}`
        }));
      }
      
      return {
        ...appObj,
        id: app._id.toString(),
        submittedAt: app.createdAt
      };
    });

    res.json(applicationsWithUrls);
  } catch (error) {
    console.error('Get client mentorship applications error:', error);
    res.status(500).json({
      message: 'Failed to fetch client mentorship applications',
      error: error.message
    });
  }
};

// Update mentorship application with admin reply
const updateMentorshipApplicationReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply, status, estimatedTime, nextSteps } = req.body;

    console.log('Updating mentorship application:', id);
    console.log('Uploaded files:', req.files);

    const updateData = {
      adminReply,
      status: status || 'under_review',
      repliedAt: new Date()
    };

    if (estimatedTime) updateData.estimatedTime = estimatedTime;
    if (nextSteps) updateData.nextSteps = nextSteps;

    // Handle file uploads for reply
    if (req.files && req.files.replyFiles) {
      updateData.replyFiles = req.files.replyFiles.map(file => ({
        filename: file.filename,
        path: file.path,
        originalName: file.originalname
      }));
    }

    const updatedApplication = await MentorshipApplication.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Mentorship application not found' });
    }

    // Build URLs for response - including client files
    const responseApplication = updatedApplication.toObject();
    
    // Build URLs for client-uploaded files
    if (responseApplication.cv && responseApplication.cv.filename) {
      responseApplication.cv.downloadUrl = `${process.env.BASE_URL || 'https://apis.translatenexus.com'}/uploads/${responseApplication.cv.filename}`;
    }
    
    if (responseApplication.coverLetter && responseApplication.coverLetter.filename) {
      responseApplication.coverLetter.downloadUrl = `${process.env.BASE_URL || 'https://apis.translatenexus.com'}/uploads/${responseApplication.coverLetter.filename}`;
    }
    
    // Build URLs for admin reply files
    if (responseApplication.replyFiles && responseApplication.replyFiles.length > 0) {
      responseApplication.replyFiles = responseApplication.replyFiles.map(file => ({
        ...file,
        downloadUrl: `${process.env.BASE_URL || 'https://apis.translatenexus.com'}/uploads/${file.filename}`
      }));
    }

    res.json({
      message: 'Reply sent successfully',
      application: {
        ...responseApplication,
        id: updatedApplication._id.toString()
      }
    });
  } catch (error) {
    console.error('Update mentorship application reply error:', error);
    res.status(500).json({
      message: error.message
    });
  }
};

// Update mentorship application status
const updateMentorshipApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedApplication = await MentorshipApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Mentorship application not found' });
    }

    // Build URLs for response
    const responseApplication = updatedApplication.toObject();
    
    // Build URLs for client files
    if (responseApplication.cv && responseApplication.cv.filename) {
      responseApplication.cv.downloadUrl = `${process.env.BASE_URL || 'https://apis.translatenexus.com'}/uploads/${responseApplication.cv.filename}`;
    }
    
    if (responseApplication.coverLetter && responseApplication.coverLetter.filename) {
      responseApplication.coverLetter.downloadUrl = `${process.env.BASE_URL || 'https://apis.translatenexus.com'}/uploads/${responseApplication.coverLetter.filename}`;
    }

    res.json({
      message: 'Status updated successfully',
      application: {
        ...responseApplication,
        id: updatedApplication._id.toString()
      }
    });
  } catch (error) {
    console.error('Update mentorship application status error:', error);
    res.status(500).json({
      message: error.message
    });
  }
};

// Get mentorship application statistics
const getMentorshipStats = async (req, res) => {
  try {
    const total = await MentorshipApplication.countDocuments();
    const pending = await MentorshipApplication.countDocuments({ status: 'pending' });
    const underReview = await MentorshipApplication.countDocuments({ status: 'under_review' });
    const accepted = await MentorshipApplication.countDocuments({ status: 'accepted' });
    const rejected = await MentorshipApplication.countDocuments({ status: 'rejected' });
    const interviewScheduled = await MentorshipApplication.countDocuments({ status: 'interview_scheduled' });

    // Today's applications
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayApplications = await MentorshipApplication.countDocuments({
      createdAt: { $gte: today }
    });

    res.json({
      total,
      pending,
      underReview,
      accepted,
      rejected,
      interviewScheduled,
      todayApplications
    });
  } catch (error) {
    console.error('Get mentorship stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch mentorship statistics',
      error: error.message
    });
  }
};

module.exports = {
  createMentorshipApplication,
  getMentorshipApplications,
  getClientMentorshipApplications,
  updateMentorshipApplicationReply,
  updateMentorshipApplicationStatus,
  getMentorshipStats
};