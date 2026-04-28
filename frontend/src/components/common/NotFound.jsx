// src/components/common/NotFound.jsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

const NotFound = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">{t('common.notFound.title')}</p>
        <p className="text-gray-500 mb-8">
          {t('common.notFound.message')}
        </p>
        
        <div className="space-x-4">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('common.go-home')}
          </Link>
          
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t('common.go-to-dashboard')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;