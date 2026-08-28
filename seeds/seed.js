require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Career = require('../models/Career');
const Major = require('../models/Major');
const University = require('../models/University');
const Scholarship = require('../models/Scholarship');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🌱 Clearing old data...');
  await User.deleteMany({});
  await Career.deleteMany({});
  await Major.deleteMany({});
  await University.deleteMany({});
  await Scholarship.deleteMany({});

  console.log('🌱 Adding sample data...');

  await User.create([
    { name: 'Demo Student', email: 'student@test.com', password: 'password123', role: 'student' }
  ]);

  await Career.create([
    { title: 'Software Engineer', category: 'Technology', description: 'Builds web and software systems.', averageSalary: '$95,000' },
    { title: 'Data Analyst', category: 'Analytics', description: 'Translates data into business insights.', averageSalary: '$80,000' }
  ]);

  await Major.create([
    { name: 'Computer Science', field: 'Technology', description: 'Study of software, algorithms, and computers.', duration: '4 Years' },
    { name: 'Business Administration', field: 'Business', description: 'Study of management and finance.', duration: '4 Years' }
  ]);

  await University.create([
    { name: 'Stanford University', country: 'USA', description: 'Top-tier research university in Silicon Valley.', website: 'https://www.stanford.edu' },
    { name: 'University of Cambridge', country: 'UK', description: 'Historic world-leading institution in Cambridge, England.', website: 'https://www.cam.ac.uk' }
  ]);

  await Scholarship.create([
    {
      title: 'Global Tech Excellence Scholarship',
      provider: 'Tech Education Foundation',
      description: 'Full tuition coverage for international students in Computer Science.',
      amount: '$40,000 / year',
      coverage: 'Tuition + Living',
      eligibility: ['GPA > 3.5', 'Computer Science major'],
      source: 'Tech Foundation Official Portal',
      sourceUrl: 'https://example.com/scholarship',
      sourceType: 'official',
      verifiedStatus: 'verified',
      safetyWarnings: []
    },
    {
      title: '🚩 100% Free Study Abroad + Free iPhone!',
      provider: 'Social Media Promo Page',
      description: 'Guaranteed scholarship for anyone! Must pay $50 processing fee via telegram link.',
      amount: 'Full Free Everything',
      coverage: 'All expenses',
      eligibility: ['Anyone with internet'],
      source: 'Instagram Ad #8234',
      sourceUrl: 'https://suspicious-link-fake.xyz',
      sourceType: 'social_media',
      verifiedStatus: 'flagged',
      safetyWarnings: ['Requires $50 upfront fee', 'Unofficial social media link', 'Excessive personal data request']
    }
  ]);

  console.log('🎉 Seeding complete! Database ready.');
  process.exit(0);
};

seed();