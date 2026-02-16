import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Kanban, Settings, LogOut, Ghost } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <div className="logo-container">
        <Ghost size={30} color="#818cf8" />
        <span className="logo-text">Nexus<span style={{color:'#818cf8'}}>AI</span></span>
      </div>

      <nav className="nav-links">
        <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </Link>
        
        <Link to="/leads" className={`nav-item ${isActive('/leads') ? 'active' : ''}`}>
          <Kanban size={20} />
          <span>Pipeline</span>
        </Link>
        
        <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="user-profile">
        <div className="avatar">PD</div>
        <div className="user-info">
          <span className="user-name">Priyansu D.</span>
          <span className="user-role">Admin</span>
        </div>
        <LogOut size={18} className="logout-icon" />
      </div>
    </div>
  );
};

export default Sidebar;