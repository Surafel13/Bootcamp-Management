import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Award, ArrowLeft, PlayCircle } from 'lucide-react';

const bootcamps = {
  101: {
    id: 101,
    title: "Full-Stack Web Development Bootcamp",
    category: "Web Development",
    status: "Open",
    startDate: "May 5, 2026",
    duration: "12 Weeks",
    schedule: "Monday - Friday, 9:00 AM - 4:00 PM (GMT+3)",
    seats: 28,
    enrolled: 12,
    instructor: "Abebe Kebede",
    description: `
      Become a job-ready full-stack developer in just 12 weeks. 
      This intensive bootcamp covers everything from modern frontend to scalable backend development.
    `,
    whatYouWillLearn: [
      "Modern React with Hooks, Context & Redux",
      "Node.js, Express & RESTful APIs",
      "MongoDB & PostgreSQL databases",
      "Authentication, Authorization & Security",
      "TypeScript fundamentals",
      "Deployment with Vercel & Render",
      "Git & collaborative development"
    ],
    requirements: [
      "Basic understanding of HTML, CSS & JavaScript",
      "Laptop with stable internet connection",
      "Dedication to 40+ hours per week",
      "No prior backend experience required"
    ]
  },
  102: {
    id: 102,
    title: "Advanced AI & Machine Learning",
    category: "Artificial Intelligence",
    status: "Waitlist",
    startDate: "June 12, 2026",
    duration: "16 Weeks",
    schedule: "Tue, Thu, Sat: 6:00 PM - 9:00 PM",
    seats: 20,
    enrolled: 20,
    instructor: "Dr. Selamawit T.",
    description: `
      Dive deep into the world of Artificial Intelligence. This course covers everything from basic statistics to advanced neural networks and LLMs.
    `,
    whatYouWillLearn: [
      "Python for Data Science & ML",
      "Supervised & Unsupervised Learning",
      "Neural Networks with PyTorch",
      "Natural Language Processing (NLP)",
      "Computer Vision basics",
      "Deploying ML models to production"
    ],
    requirements: [
      "Intermediate Python knowledge",
      "Understanding of Basic Linear Algebra",
      "Strong analytical skills"
    ]
  }
};

export default function BootcampDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bootcamp = bootcamps[id];

  if (!bootcamp) {
    return (
      <div className="page-content" style={{
        textAlign: 'center',
        padding: '100px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <div className="card" style={{ padding: '40px', maxWidth: '500px', width: '100%' }}>
          <PlayCircle size={64} color="var(--text-muted)" style={{ marginBottom: '24px', opacity: 0.5 }} />
          <h2 style={{ marginBottom: '16px' }}>Bootcamp Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            We couldn't find the bootcamp details you're looking for. It may have been expired or removed.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/notifications')}
            style={{ padding: '12px 32px' }}
          >
            Back to Notifications
          </button>
        </div>
      </div>
    );
  }

  const isOpen = bootcamp.status === "Open";

  return (
    <div className="page-content">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary"
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}
      >
        <ArrowLeft size={20} />
        Back to Notifications
      </button>

      <div className="card" style={{ padding: '40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {bootcamp.category}
              </div>
              <div style={{
                background: isOpen ? '#22c55e20' : '#ef444420',
                color: isOpen ? '#22c55e' : '#ef4444',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                {bootcamp.status}
              </div>
            </div>

            <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{bootcamp.title}</h1>

            <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '1.02rem' }}>
              <span><Calendar size={18} style={{ verticalAlign: 'middle' }} /> Starts {bootcamp.startDate}</span>
              <span><Clock size={18} style={{ verticalAlign: 'middle' }} /> {bootcamp.duration}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '16px' }}>About This Bootcamp</h3>
          <p style={{ lineHeight: '1.75', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
            {bootcamp.description}
          </p>
        </div>

        {/* What You'll Learn */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '18px' }}>What You Will Learn</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {bootcamp.whatYouWillLearn.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px',
                background: 'var(--bg-hover)',
                borderRadius: '10px'
              }}>
                <Award size={22} color="var(--success)" style={{ marginTop: '2px' }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '16px' }}>Requirements</h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            {bootcamp.requirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>

        {/* Instructor & Schedule */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
          <div>
            <h4>Instructor</h4>
            <p style={{ fontSize: '1.1rem', marginTop: '8px' }}>{bootcamp.instructor}</p>
          </div>
          <div>
            <h4>Schedule</h4>
            <p style={{ marginTop: '8px', lineHeight: '1.6' }}>{bootcamp.schedule}</p>
          </div>
        </div>

        {/* Action Section */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '32px',
          textAlign: 'center'
        }}>
          <button
            className="btn btn-primary"
            style={{
              padding: '16px 48px',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}
            disabled={!isOpen}
            onClick={() => alert('Enrollment flow would start here')}
          >
            {isOpen ? 'Enroll Now - Limited Seats' : 'Enrollment Closed'}
          </button>

          <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Applications close 3 days before start date
          </p>
        </div>
      </div>
    </div>
  );
}