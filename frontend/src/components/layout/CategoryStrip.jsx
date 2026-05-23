import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchCategories } from '../../api/categories.js';

export default function CategoryStrip() {
  const [categories, setCategories] = useState([]);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <nav className="sticky top-[57px] z-30 border-b border-flipBorder bg-white shadow-card">
      <div className="no-scrollbar mx-auto flex max-w-7xl gap-8 overflow-x-auto px-4 py-2">
        <Link
          to="/"
          className={`flex-shrink-0 text-sm font-semibold ${location.pathname === '/' && !location.search ? 'text-flipBlue' : 'text-flipText'} hover:text-flipBlue`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/c/${c.slug}`}
            className={`flex-shrink-0 text-sm font-semibold ${location.pathname === `/c/${c.slug}` ? 'text-flipBlue' : 'text-flipText'} hover:text-flipBlue`}
          >
            {c.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
