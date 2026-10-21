import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaHeart, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="mt-auto border-top border-secondary border-opacity-25 pt-5 pb-4 bg-body-tertiary">
      <div className="container">
        <div className="row g-4">
          
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-3">
              <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '36px', height: '36px' }}>
                <FaGraduationCap className="fs-5" />
              </div>
              <span className="fw-extrabold fs-5 tracking-tight text-primary">Smart<span className="text-body fw-bold">Jobs</span></span>
            </Link>
            <p className="text-body-secondary small mb-3">
              Empowering college students in Tamil Nadu with flexible, verified part-time jobs, internships, and skill-building opportunities while studying.
            </p>
            <div className="d-flex gap-3 text-body-secondary small">
              <span className="d-flex align-items-center gap-1"><FaMapMarkerAlt className="text-primary" /> Edappadi , Salem</span>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3">Popular Categories</h6>
            <ul className="list-unstyled text-body-secondary small d-flex flex-column gap-2">
              <li><Link to="/jobs?category=Bakery" className="text-decoration-none text-body-secondary opacity-75 opacity-100-hover">Bakery Jobs</Link></li>
              <li><Link to="/jobs?category=Medical" className="text-decoration-none text-body-secondary opacity-75 opacity-100-hover">Pharmacy & Medical</Link></li>
              <li><Link to="/jobs?category=Grocery Store" className="text-decoration-none text-body-secondary opacity-75 opacity-100-hover">Grocery Stores</Link></li>
              <li><Link to="/jobs?category=Hotel & Restaurant" className="text-decoration-none text-body-secondary opacity-75 opacity-100-hover">Restaurants & Hotels</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3">Quick Navigation</h6>
            <ul className="list-unstyled text-body-secondary small d-flex flex-column gap-2">
              <li><Link to="/" className="text-decoration-none text-body-secondary opacity-75 opacity-100-hover">Home</Link></li>
              <li><Link to="/jobs" className="text-decoration-none text-body-secondary opacity-75 opacity-100-hover">Search Jobs</Link></li>
              <li><Link to="/login" className="text-decoration-none text-body-secondary opacity-75 opacity-100-hover">Student Login</Link></li>
              <li><Link to="/admin/login" className="text-decoration-none text-body-secondary opacity-75 opacity-100-hover text-warning">Admin Access</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3">Contact & Support</h6>
            <div className="text-body-secondary small d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2">
                <FaEnvelope className="text-primary" /> sivamanivijaya04@gmail.com
              </div>
              <div className="d-flex align-items-center gap-2">
                <FaPhone className="text-primary" /> +91 6369842955
              </div>
               <div className="d-flex align-items-center gap-2">
                <FaPhone className="text-primary" /> 
                <Link  className='text-white' to="https://www.instagram.com/rx_killar_04">Instagram</Link>
              </div>
           
            </div>
          </div>

        </div>

        <hr className="my-4 opacity-25" />

        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between text-body-secondary small gap-2">
          <p className="mb-0 text-gradient-primary">© {new Date().getFullYear()} Smart Student Part-Time Job Management System.</p>
          <p className="mb-0 text-gradient-primary">Built with <FaHeart className="text-danger mx-1" /> for Salem , Edappadi Student</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
