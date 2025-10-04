import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  const activeLinkClass = 'bg-sky-600 text-white';
  const defaultLinkClass = 'bg-slate-700 hover:bg-slate-600';

  return (
    <header className="bg-slate-800 shadow-lg">
      <nav className="container mx-auto flex justify-between items-center p-3">
        <h1 className="text-2xl font-bold text-sky-200">رماية التوقيت</h1>
        <div className="flex gap-2">
          <NavLink
            to="/"
            className={({ isActive }) => `${isActive ? activeLinkClass : defaultLinkClass} px-3 py-2 rounded-md text-sm font-small transition-colors`}
          >
            تسجيل النتائج
          </NavLink>
          <NavLink
            to="/results"
            className={({ isActive }) => `${isActive ? activeLinkClass : defaultLinkClass} px-3 py-2 rounded-md text-sm font-small transition-colors`}
          >
            النتائج المحفوظة
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Header;