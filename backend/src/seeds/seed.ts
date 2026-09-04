import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/db';
import User from '../models/User';
import Career from '../models/Career';
import Major from '../models/Major';
import University from '../models/University';
import Scholarship from '../models/Scholarship';

const seed = async () => {
  console.log("🌱 Creating tables if they don't exist...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      role TEXT NOT NULL DEFAULT 'student',
      auth_provider TEXT NOT NULL DEFAULT 'local',
      google_id TEXT UNIQUE,
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scholarships (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_type TEXT NOT NULL,
      description TEXT NOT NULL,
      amount TEXT NOT NULL,
      coverage TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      deadline TIMESTAMPTZ,
      application_link TEXT NOT NULL,
      country TEXT NOT NULL,
      source TEXT NOT NULL,
      source_url TEXT NOT NULL,
      source_type TEXT NOT NULL,
      verified_status TEXT NOT NULL,
      safety_warnings TEXT[] NOT NULL DEFAULT '{}'
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS careers (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      average_salary TEXT NOT NULL,
      growth_outlook TEXT NOT NULL,
      required_skills TEXT[] NOT NULL DEFAULT '{}',
      related_majors TEXT[] NOT NULL DEFAULT '{}',
      source TEXT NOT NULL,
      source_url TEXT NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS majors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      field TEXT NOT NULL,
      description TEXT NOT NULL,
      duration TEXT NOT NULL,
      degree_type TEXT NOT NULL,
      related_careers TEXT[] NOT NULL DEFAULT '{}',
      source TEXT NOT NULL,
      source_url TEXT NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS universities (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      ranking INTEGER,
      description TEXT NOT NULL,
      website TEXT NOT NULL,
      tuition_range TEXT NOT NULL,
      acceptance_rate TEXT NOT NULL,
      programs TEXT[] NOT NULL DEFAULT '{}',
      source TEXT NOT NULL,
      source_url TEXT NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_opportunities (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      scholarship_id INTEGER NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
      saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, scholarship_id)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      scholarship_id INTEGER NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
      reason TEXT NOT NULL
    )
  `);

  console.log('🌱 Clearing old data...');
  await pool.query('DELETE FROM saved_opportunities');
  await pool.query('DELETE FROM reports');
  await pool.query('DELETE FROM scholarships');
  await pool.query('DELETE FROM universities');
  await pool.query('DELETE FROM majors');
  await pool.query('DELETE FROM careers');
  await pool.query('DELETE FROM users');

  console.log('🌱 Adding sample data...');

  await User.create({ name: 'Demo Student', email: 'student@test.com', password: 'password123', role: 'student' });

  await Career.create({
    title: 'Software Engineer',
    category: 'Technology',
    description: 'Builds web and software systems.',
    average_salary: '$95,000',
    growth_outlook: 'High',
    required_skills: ['JavaScript', 'TypeScript', 'SQL'],
    related_majors: ['Computer Science'],
    source: 'Bureau of Labor Statistics',
    source_url: 'https://www.bls.gov'
  });

  await Career.create({
    title: 'Data Analyst',
    category: 'Analytics',
    description: 'Translates data into business insights.',
    average_salary: '$80,000',
    growth_outlook: 'Medium',
    required_skills: ['SQL', 'Python', 'Excel'],
    related_majors: ['Data Science', 'Statistics'],
    source: 'Bureau of Labor Statistics',
    source_url: 'https://www.bls.gov'
  });

  await Major.create({
    name: 'Computer Science',
    field: 'Technology',
    description: 'Study of software, algorithms, and computers.',
    duration: '4 Years',
    degree_type: 'Bachelor',
    related_careers: ['Software Engineer', 'Data Analyst'],
    source: 'US News',
    source_url: 'https://www.usnews.com'
  });

  await Major.create({
    name: 'Business Administration',
    field: 'Business',
    description: 'Study of management and finance.',
    duration: '4 Years',
    degree_type: 'Bachelor',
    related_careers: ['Business Analyst', 'Manager'],
    source: 'US News',
    source_url: 'https://www.usnews.com'
  });

  await University.create({
    name: 'Stanford University',
    country: 'USA',
    city: 'Stanford',
    ranking: 1,
    description: 'Top-tier research university in Silicon Valley.',
    website: 'https://www.stanford.edu',
    tuition_range: '$55,000/year',
    acceptance_rate: '4%',
    programs: ['Computer Science', 'Engineering', 'Business'],
    source: 'US News',
    source_url: 'https://www.usnews.com'
  });

  await University.create({
    name: 'University of Cambridge',
    country: 'UK',
    city: 'Cambridge',
    ranking: 2,
    description: 'Historic world-leading institution in Cambridge, England.',
    website: 'https://www.cam.ac.uk',
    tuition_range: '£25,000/year',
    acceptance_rate: '21%',
    programs: ['Mathematics', 'Science', 'Engineering'],
    source: 'QS Rankings',
    source_url: 'https://www.topuniversities.com'
  });

  await Scholarship.create({
    title: 'Global Tech Excellence Scholarship',
    provider: 'Tech Education Foundation',
    provider_type: 'foundation',
    description: 'Full tuition coverage for international students in Computer Science.',
    amount: '$40,000 / year',
    coverage: 'Tuition + Living',
    eligibility: 'GPA > 3.5, Computer Science major',
    deadline: new Date('2026-12-01'),
    application_link: 'https://example.com/apply',
    country: 'USA',
    source: 'Tech Foundation Official Portal',
    source_url: 'https://example.com/scholarship',
    source_type: 'official',
    verified_status: 'verified',
    safety_warnings: []
  });

  await Scholarship.create({
    title: '100% Free Study Abroad + Free iPhone!',
    provider: 'Social Media Promo Page',
    provider_type: 'unknown',
    description: 'Guaranteed scholarship for anyone! Must pay $50 processing fee via telegram link.',
    amount: 'Full Free Everything',
    coverage: 'All expenses',
    eligibility: 'Anyone with internet',
    deadline: new Date('2026-06-01'),
    application_link: 'https://suspicious-link-fake.xyz',
    country: 'Unknown',
    source: 'Instagram Ad #8234',
    source_url: 'https://suspicious-link-fake.xyz',
    source_type: 'social_media',
    verified_status: 'flagged',
    safety_warnings: ['Requires $50 upfront fee', 'Unofficial social media link', 'Excessive personal data request']
  });

  console.log('🎉 Seeding complete! Database ready.');
  process.exit(0);
};

seed();
