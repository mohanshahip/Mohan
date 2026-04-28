import React, { memo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Image,
  Code,
  User,
  Mail,
  Users,
  Settings,
  LogOut,
  Shield,
  Loader2,
  Globe
} from "lucide-react";
import logo from "../../assets/images/mohan-logo.png";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../context/UIContext";
import { adminNavGroups } from "../../config/adminNavigation";
import "../../styles/Sidebar.css";

/**
 * SidebarBrand component
 */
const SidebarBrand = memo(({ collapsed, isMobile, onBrandClick, t }) => (
  <div
    className="sidebar-brand"
    onClick={onBrandClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onBrandClick(e)}
    aria-label={t("navigation.go-to-dashboard")}
  >
    <div className="brand-logo" aria-hidden="true">
      <img src={logo} alt={t("navigation.logo")} className="sidebar-logo-img" />
    </div>
    {(!collapsed || isMobile) && (
      <div className="brand-text">
        <h2 className="sidebar-brand-title">{t("admin.panel")}</h2>
        <p className="sidebar-brand-subtitle">{t("hero.full-name")}</p>
      </div>
    )}
  </div>
));

/**
 * NavItem component
 */
const NavItem = memo(({ item, collapsed, isMobile, onItemClick, t }) => {
  const Icon = item.icon;
  const translationKey = item.translationKey;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => 
        `nav-item ${isActive ? "active" : ""}`
      }
      onClick={onItemClick}
      end={item.path === "/admin"}
      title={collapsed && !isMobile ? t(translationKey) : undefined}
    >
      <span className="nav-item-icon" aria-hidden="true">
        <Icon size={20} />
      </span>
      {(!collapsed || isMobile) && (
        <span className="nav-item-text">{t(translationKey)}</span>
      )}
    </NavLink>
  );
});

/**
 * Sidebar component
 */
const Sidebar = ({
  collapsed = false,
  toggleCollapse,
  isMobile = false,
  isOpen = false,
  toggleSidebar,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout, isLoggingOut, user } = useAuth();
  const confirm = useConfirm();

  const filteredGroups = React.useMemo(() => {
    return adminNavGroups.map(group => ({
      ...group,
      items: group.items.filter(item => !item.role || item.role === user?.role)
    })).filter(group => group.items.length > 0);
  }, [user]);

  const handleBrandClick = () => {
    if (isLoggingOut) return;
    if (isMobile && toggleSidebar) toggleSidebar();
    navigate("/admin");
  };

  const handleNavItemClick = () => {
    if (isLoggingOut) return;
    if (isMobile && toggleSidebar) toggleSidebar();
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    const ok = await confirm({
      title: t("admin.logout"),
      message: t("common.confirm-logout"),
      type: "warning",
      confirmText: t("admin.logout"),
      cancelText: t("common.cancel"),
    });
    
    if (ok) {
      try {
        await logout();
        navigate("/login", { replace: true });
      } catch (_err) {
        window.location.href = "/login";
      }
    }
  };

  const sidebarClasses = `sidebar ${isMobile ? 'mobile' : 'desktop'} ${collapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`;

  return (
    <>
      <aside className={sidebarClasses} aria-label={t("navigation.sidebar")}>
        <header className="sidebar-header">
          <SidebarBrand
            collapsed={collapsed}
            isMobile={isMobile}
            onBrandClick={handleBrandClick}
            t={t}
          />
        </header>

        <nav className="sidebar-nav">
          {filteredGroups.map((group) => (
            <section key={group.title} className="nav-group">
              {(!collapsed || isMobile) && (
                <h3 className="nav-group-title">
                  {t(group.title)}
                </h3>
              )}
              <div className="nav-items-wrapper">
                {group.items.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    collapsed={collapsed}
                    isMobile={isMobile}
                    onItemClick={handleNavItemClick}
                    t={t}
                  />
                ))}
              </div>
              {collapsed && !isMobile && <div className="nav-group-divider" aria-hidden="true" />}
            </section>
          ))}
        </nav>

        <footer className="sidebar-footer">
          <button
            className={`logout-btn ${isLoggingOut ? "loading" : ""}`}
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label={t("admin.logout")}
            title={collapsed && !isMobile ? t("admin.logout") : undefined}
          >
            <div className="logout-icon-wrapper">
              {isLoggingOut ? (
                <Loader2 size={20} className="animate-spin" aria-hidden="true" />
              ) : (
                <LogOut size={20} strokeWidth={2} aria-hidden="true" />
              )}
            </div>
            {(!collapsed || isMobile) && (
              <span className="logout-text">
                {isLoggingOut ? t("common.loggingOut") : t("admin.logout")}
              </span>
            )}
          </button>
        </footer>
      </aside>
    </>
  );
};
Sidebar.displayName = "Sidebar";

export default memo(Sidebar);
