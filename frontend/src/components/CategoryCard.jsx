import React from 'react';
import { 
  FaCookieBite, 
  FaClinicMedical, 
  FaShoppingBasket, 
  FaUtensils, 
  FaCoffee, 
  FaStore, 
  FaLaptopCode, 
  FaGraduationCap, 
  FaBriefcase 
} from 'react-icons/fa';

const iconMap = {
  FaCookieBite,
  FaClinicMedical,
  FaShoppingBasket,
  FaUtensils,
  FaCoffee,
  FaStore,
  FaLaptopCode,
  FaGraduationCap,
  FaBriefcase
};

const CategoryCard = ({ category, onClick }) => {
  const IconComponent = iconMap[category.icon] || FaBriefcase;

  return (
    <div 
      onClick={() => onClick(category.name)}
      className="glass-card p-4 text-center cursor-pointer h-100 d-flex flex-column align-items-center justify-content-center transition-all hover-lift"
      style={{ cursor: 'pointer' }}
    >
      <div className="bg-primary-subtle text-primary p-3 rounded-circle mb-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
        <IconComponent className="fs-3" />
      </div>
      <h6 className="fw-bold mb-1 text-body">{category.name}</h6>
      <span className="badge bg-secondary-subtle text-body-secondary rounded-pill extra-small px-2.5 py-1">
        {category.count || 0} Open Jobs
      </span>
    </div>
  );
};

export default CategoryCard;
