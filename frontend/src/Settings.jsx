import { motion } from "framer-motion";
import { User, Bell, Shield, Download, Trash2, Save, Moon, Volume2 } from "lucide-react";

const Settings = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="page-content"
    >
      <h1 className="page-title">System Settings</h1>

      <div className="settings-grid" style={{ display: 'grid', gap: '24px', maxWidth: '800px' }}>
        
        {/* PROFILE SECTION */}
        <div className="glass-card">
          <div className="settings-header" style={{display:'flex', gap:'15px', marginBottom:'20px', alignItems:'center'}}>
            <div className="avatar-large" style={{width:'60px', height:'60px', borderRadius:'50%', background:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:'bold'}}>PD</div>
            <div>
              <h3 style={{margin:0}}>Priyansu Dash</h3>
              <p style={{margin:0, color:'#94a3b8', fontSize:'0.9rem'}}>Administrator • Nexus AI</p>
            </div>
            <button className="primary-btn" style={{marginLeft:'auto'}}>Edit Profile</button>
          </div>
          
          <div className="form-row">
            <div className="input-group"><User size={16}/><input defaultValue="Priyansu Dash" /></div>
            <div className="input-group"><Shield size={16}/><input defaultValue="pupuhari123@gmail.com" disabled style={{opacity:0.7}} /></div>
          </div>
        </div>

        {/* PREFERENCES */}
        <div className="glass-card">
          <h3 style={{marginTop:0, marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px'}}>
            <Bell size={18} color="#facc15"/> Preferences
          </h3>
          
          <div className="toggle-row" style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <Moon size={18} color="#94a3b8"/> <span>Dark Mode</span>
            </div>
            <div className="toggle-switch on" style={{width:'40px', height:'20px', background:'#10b981', borderRadius:'20px', position:'relative'}}><div style={{width:'16px', height:'16px', background:'white', borderRadius:'50%', position:'absolute', right:'2px', top:'2px'}}></div></div>
          </div>

          <div className="toggle-row" style={{display:'flex', justifyContent:'space-between', padding:'12px 0'}}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <Volume2 size={18} color="#94a3b8"/> <span>Sound Effects</span>
            </div>
            <div className="toggle-switch on" style={{width:'40px', height:'20px', background:'#10b981', borderRadius:'20px', position:'relative'}}><div style={{width:'16px', height:'16px', background:'white', borderRadius:'50%', position:'absolute', right:'2px', top:'2px'}}></div></div>
          </div>
        </div>

        {/* DATA MANAGEMENT */}
        <div className="glass-card" style={{borderColor: 'rgba(244, 63, 94, 0.3)'}}>
          <h3 style={{marginTop:0, marginBottom:'20px', color:'#f43f5e', display:'flex', alignItems:'center', gap:'10px'}}>
            <Shield size={18}/> Danger Zone
          </h3>
          
          <div style={{display:'flex', gap:'15px'}}>
            <button className="icon-btn" style={{width:'auto', padding:'0 20px', gap:'10px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)'}}>
              <Download size={18}/> Export All Data
            </button>
            <button className="icon-btn" style={{width:'auto', padding:'0 20px', gap:'10px', borderRadius:'8px', background:'rgba(244, 63, 94, 0.1)', color:'#f43f5e', border:'1px solid #f43f5e'}}>
              <Trash2 size={18}/> Reset Database
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Settings;