import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, CheckCircle, Plus, Sparkles, User, Briefcase, Mail, FileText, Server, TrendingUp, Users, Zap, Wand2, X, Copy } from "lucide-react";
import "./App.css";

function App() {
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({ name: "", company: "", email: "", notes: "" });
  
  // --- NEW: MODAL STATE ---
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API_URL}/leads/`);
      setLeads(response.data);
    } catch (error) { console.error("Error:", error); }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/leads/`, formData);
      fetchLeads();
      setFormData({ name: "", company: "", email: "", notes: "" });
    } catch (error) { console.error("Error:", error); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/leads/${id}`);
      fetchLeads();
    } catch (error) { console.error("Error:", error); }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "New" ? "Contacted" : "New";
      await axios.patch(`${API_URL}/leads/${id}`, { status: newStatus });
      fetchLeads();
    } catch (error) { console.error("Error:", error); }
  };

  // --- NEW: GENERATE EMAIL FUNCTION ---
  const handleGenerateEmail = async (lead) => {
    setSelectedLead(lead);
    setGeneratedEmail("Generating AI draft...");
    setModalOpen(true);
    
    try {
      const response = await axios.get(`${API_URL}/leads/${lead.id}/email`);
      setGeneratedEmail(response.data.email);
    } catch (error) {
      setGeneratedEmail("Error generating email.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    alert("Email copied to clipboard!");
  };

  // Stats
  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.ai_score > 80).length;
  const contactedRate = totalLeads === 0 ? 0 : Math.round((leads.filter(l => l.status === "Contacted").length / totalLeads) * 100);

  return (
    <div className="app-container">
      <motion.h1 
        initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="title"
      >
        <span className="gradient-text">Nexus</span> AI
      </motion.h1>

      <div className="main-grid">
        {/* FORM */}
        <motion.div className="glass-card form-section" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
          <div className="card-header">
            <Sparkles className="icon-spin" size={24} color="#818cf8" />
            <h2>New Intelligence</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-group"><User size={18} /><input type="text" name="name" placeholder="Target Name" value={formData.name} onChange={handleInputChange} required /></div>
            <div className="input-group"><Briefcase size={18} /><input type="text" name="company" placeholder="Organization" value={formData.company} onChange={handleInputChange} required /></div>
            <div className="input-group"><Mail size={18} /><input type="email" name="email" placeholder="Comms Channel" value={formData.email} onChange={handleInputChange} required /></div>
            <div className="input-group"><FileText size={18} /><textarea name="notes" placeholder="Intel" value={formData.notes} onChange={handleInputChange} required /></div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} type="submit" className="submit-btn"><Plus size={20} /> Process Data</motion.button>
          </form>
        </motion.div>

        {/* RIGHT SIDE */}
        <div className="right-section">
          {/* STATS */}
          <div className="stats-grid">
            <div className="stat-card"><Users size={20} color="#94a3b8" /><div><span className="stat-label">Total Leads</span><span className="stat-value">{totalLeads}</span></div></div>
            <div className="stat-card"><Zap size={20} color="#facc15" /><div><span className="stat-label">Hot Leads</span><span className="stat-value">{hotLeads}</span></div></div>
            <div className="stat-card"><TrendingUp size={20} color="#10b981" /><div><span className="stat-label">Success Rate</span><span className="stat-value">{contactedRate}%</span></div></div>
          </div>

          {/* LIST */}
          <div className="list-container">
            <AnimatePresence mode="popLayout">
              {leads.map((lead, index) => (
                <motion.div layout key={lead.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5 }} className={`glass-card lead-card ${lead.ai_score > 80 ? "hot-lead" : ""}`}>
                  <div className="lead-content">
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                      <h3>{lead.name}</h3>
                      <span className="company-tag">{lead.company}</span>
                    </div>
                    <p className="lead-notes">{lead.notes}</p>
                    <div className="lead-meta">
                      <div className={`score-badge ${lead.ai_score > 50 ? "high" : "low"}`}><span>AI Score:</span><strong>{lead.ai_score}</strong></div>
                      <span style={{opacity:0.5}}>|</span>
                      <span style={{color: '#a855f7', fontSize:'0.9rem'}}>{lead.ai_category}</span>
                    </div>
                  </div>
                  <div className="lead-actions">
                    {/* THIS IS THE MISSING BUTTON */}
                    <motion.button onClick={() => handleGenerateEmail(lead)} className="icon-btn magic" whileHover={{ scale: 1.1 }} title="Draft AI Email">
                      <Wand2 size={20} />
                    </motion.button>
                    {/* ------------------------- */}
                    <motion.button onClick={() => handleStatusUpdate(lead.id, lead.status)} className={`icon-btn ${lead.status === "New" ? "pending" : "done"}`} whileHover={{ scale: 1.1 }}>
                      <CheckCircle size={20} />
                    </motion.button>
                    <motion.button onClick={() => handleDelete(lead.id)} className="icon-btn delete" whileHover={{ scale: 1.1 }}>
                      <Trash2 size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {leads.length === 0 && <div className="glass-card empty-state"><Server size={48} /><p>System Idle.</p></div>}
          </div>
        </div>
      </div>

      {/* --- EMAIL MODAL --- */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content glass-card" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <div className="modal-header">
                <h3><Wand2 size={20} style={{marginRight:'10px', color:'#818cf8'}}/> AI Email Draft</h3>
                <button onClick={() => setModalOpen(false)} className="close-btn"><X size={20}/></button>
              </div>
              <div className="email-preview">
                <pre>{generatedEmail}</pre>
              </div>
              <div className="modal-footer">
                <button onClick={copyToClipboard} className="copy-btn"><Copy size={18}/> Copy to Clipboard</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;