import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, CheckCircle, Plus, Sparkles, User, Briefcase, Mail, FileText, Server, TrendingUp, Users, Zap } from "lucide-react";
import "./App.css";

function App() {
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    notes: "",
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/leads/");
      setLeads(response.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/leads/", formData);
      fetchLeads();
      setFormData({ name: "", company: "", email: "", notes: "" });
    } catch (error) {
      console.error("Error adding lead:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/leads/${id}`);
      fetchLeads();
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "New" ? "Contacted" : "New";
      await axios.patch(`http://127.0.0.1:8000/leads/${id}`, {
        status: newStatus,
      });
      fetchLeads();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // --- ANALYTICS CALCULATIONS ---
  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.ai_score > 80).length;
  const contactedRate = totalLeads === 0 ? 0 : Math.round((leads.filter(l => l.status === "Contacted").length / totalLeads) * 100);

  return (
    <div className="app-container">
      <motion.h1 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="title"
      >
        <span className="gradient-text">Nexus</span> AI
      </motion.h1>

      <div className="main-grid">
        {/* LEFT: FORM SECTION */}
        <motion.div 
          className="glass-card form-section"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-header">
            <Sparkles className="icon-spin" size={24} color="#818cf8" />
            <h2>New Intelligence</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <User size={18} />
              <input type="text" name="name" placeholder="Target Name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <Briefcase size={18} />
              <input type="text" name="company" placeholder="Organization" value={formData.company} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <Mail size={18} />
              <input type="email" name="email" placeholder="Comms Channel" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="input-group">
              <FileText size={18} />
              <textarea name="notes" placeholder="Intel (e.g. 'Budget verified, ready to acquire')" value={formData.notes} onChange={handleInputChange} required />
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              className="submit-btn"
            >
              <Plus size={20} /> Process Data
            </motion.button>
          </form>
        </motion.div>

        {/* RIGHT: LIST SECTION */}
        <div className="right-section">
          
          {/* --- NEW STATS DASHBOARD --- */}
          <div className="stats-grid">
            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Users size={20} color="#94a3b8" />
              <div>
                <span className="stat-label">Total Leads</span>
                <span className="stat-value">{totalLeads}</span>
              </div>
            </motion.div>

            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Zap size={20} color="#facc15" />
              <div>
                <span className="stat-label">Hot Leads</span>
                <span className="stat-value">{hotLeads}</span>
              </div>
            </motion.div>

            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <TrendingUp size={20} color="#10b981" />
              <div>
                <span className="stat-label">Success Rate</span>
                <span className="stat-value">{contactedRate}%</span>
              </div>
            </motion.div>
          </div>

          {/* LIST */}
          <div className="list-container">
            <AnimatePresence mode="popLayout">
              {leads.map((lead, index) => (
                <motion.div
                  layout
                  key={lead.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`glass-card lead-card ${lead.ai_score > 80 ? "hot-lead" : ""}`}
                >
                  <div className="lead-content">
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                      <h3>{lead.name}</h3>
                      <span className="company-tag">{lead.company}</span>
                    </div>
                    <p className="lead-notes">{lead.notes}</p>
                    
                    <div className="lead-meta">
                      <div className={`score-badge ${lead.ai_score > 50 ? "high" : "low"}`}>
                        <span>AI Score:</span>
                        <strong>{lead.ai_score}</strong>
                      </div>
                      <span style={{opacity:0.5}}>|</span>
                      <span style={{color: '#a855f7', fontSize:'0.9rem'}}>{lead.ai_category}</span>
                    </div>
                  </div>

                  <div className="lead-actions">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleStatusUpdate(lead.id, lead.status)}
                      className={`icon-btn ${lead.status === "New" ? "pending" : "done"}`}
                      title="Mark Status"
                    >
                      <CheckCircle size={20} />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(lead.id)}
                      className="icon-btn delete"
                      title="Delete Record"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {leads.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card empty-state"
                style={{ display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'200px'}}
              >
                <Server size={48} style={{marginBottom:'20px', opacity:0.5}} />
                <p>System Idle. Awaiting Data Input.</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;