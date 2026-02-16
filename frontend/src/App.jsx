import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Trash2, CheckCircle, Plus, Sparkles, User, Briefcase, Mail, FileText, Server, TrendingUp, Users, Zap, Wand2, X, Copy, Search, Download, LayoutGrid, List as ListIcon, ArrowRight, DollarSign } from "lucide-react";
import "./App.css";

// Register ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({ name: "", company: "", email: "", notes: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'board'
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API_URL}/leads/`);
      setLeads(response.data);
    } catch (error) { console.error("Error:", error); }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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

  // ADVANCED STATUS UPDATE (Pipeline)
  const handleStageChange = async (id, currentStatus, direction) => {
    const stages = ["New", "Contacted", "Negotiation", "Closed"];
    const currentIndex = stages.indexOf(currentStatus) === -1 ? 0 : stages.indexOf(currentStatus);
    
    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= stages.length) newIndex = stages.length - 1;

    const newStatus = stages[newIndex];
    
    try {
      await axios.patch(`${API_URL}/leads/${id}`, { status: newStatus });
      fetchLeads();
    } catch (error) { console.error("Error:", error); }
  };

  const handleGenerateEmail = async (lead) => {
    setGeneratedEmail("Generating AI draft...");
    setModalOpen(true);
    try {
      const response = await axios.get(`${API_URL}/leads/${lead.id}/email`);
      setGeneratedEmail(response.data.email);
    } catch (error) { setGeneratedEmail("Error generating email."); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    alert("Email copied!");
  };

  // --- DERIVED DATA ---
  const totalLeads = leads.length;
  // Calculate "Deal Value" based on AI Score (Simulation: Score * $150)
  const pipelineValue = leads.reduce((acc, lead) => acc + (lead.ai_score * 150), 0);
  
  const chartData = {
    labels: ['Hot', 'Warm', 'Cold'],
    datasets: [{
      data: [
        leads.filter(l => l.ai_score > 80).length,
        leads.filter(l => l.ai_score > 50 && l.ai_score <= 80).length,
        leads.filter(l => l.ai_score <= 50).length,
      ],
      backgroundColor: ['#10b981', '#facc15', '#94a3b8'],
      borderWidth: 0,
    }],
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      <motion.h1 initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="title">
        <span className="gradient-text">Nexus</span> AI
      </motion.h1>

      <div className="main-grid">
        {/* LEFT: FORM & CHART */}
        <div className="left-column">
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

          {/* NEW: REVENUE CHART */}
          <motion.div className="glass-card chart-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3>Pipeline Health</h3>
            <div className="chart-wrapper">
              <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'white' } } } }} />
            </div>
          </motion.div>
        </div>

        {/* RIGHT: DASHBOARD */}
        <div className="right-section">
          <div className="stats-grid">
            <div className="stat-card"><Users size={20} color="#94a3b8" /><div><span className="stat-label">Total Leads</span><span className="stat-value">{totalLeads}</span></div></div>
            <div className="stat-card"><Zap size={20} color="#10b981" /><div><span className="stat-label">Hot Leads</span><span className="stat-value">{leads.filter(l => l.ai_score > 80).length}</span></div></div>
            <div className="stat-card"><DollarSign size={20} color="#facc15" /><div><span className="stat-label">Est. Value</span><span className="stat-value">${pipelineValue.toLocaleString()}</span></div></div>
          </div>

          <div className="toolbar glass-card">
            <div className="search-wrapper">
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder="Search pipeline..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="view-toggles">
              <button onClick={() => setViewMode("list")} className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}><ListIcon size={18}/></button>
              <button onClick={() => setViewMode("board")} className={`toggle-btn ${viewMode === 'board' ? 'active' : ''}`}><LayoutGrid size={18}/></button>
            </div>
          </div>

          {/* VIEW SWITCHER */}
          {viewMode === "list" ? (
            <div className="list-container">
              <AnimatePresence>
                {filteredLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onDelete={handleDelete} onEmail={handleGenerateEmail} onStageChange={handleStageChange} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="kanban-board">
              {["New", "Contacted", "Negotiation", "Closed"].map(stage => (
                <div key={stage} className="kanban-column">
                  <h4 className="column-title">{stage} <span className="count">{leads.filter(l => (l.status || "New") === stage).length}</span></h4>
                  <div className="kanban-drop-area">
                    {filteredLeads.filter(l => (l.status || "New") === stage).map(lead => (
                      <LeadCard key={lead.id} lead={lead} onDelete={handleDelete} onEmail={handleGenerateEmail} onStageChange={handleStageChange} isBoard={true} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="modal-overlay">
            <motion.div className="modal-content glass-card" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <div className="modal-header"><h3>AI Email Draft</h3><button onClick={() => setModalOpen(false)}><X size={20}/></button></div>
              <div className="email-preview"><pre>{generatedEmail}</pre></div>
              <button onClick={copyToClipboard} className="copy-btn"><Copy size={18}/> Copy</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-Component for cleanliness
const LeadCard = ({ lead, onDelete, onEmail, onStageChange, isBoard }) => (
  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`glass-card lead-card ${lead.ai_score > 80 ? "hot-lead" : ""} ${isBoard ? "board-card" : ""}`}>
    <div className="lead-content">
      <div className="card-top">
        <h3>{lead.name}</h3>
        {!isBoard && <span className="company-tag">{lead.company}</span>}
      </div>
      {isBoard && <span className="company-tag-board">{lead.company}</span>}
      {!isBoard && <p className="lead-notes">{lead.notes}</p>}
      
      <div className="lead-meta">
        <div className={`score-badge ${lead.ai_score > 50 ? "high" : "low"}`}>
          <span>${(lead.ai_score * 150).toLocaleString()}</span>
        </div>
        {!isBoard && <span>{lead.ai_category}</span>}
      </div>
    </div>
    <div className="lead-actions">
      <button onClick={() => onEmail(lead)} className="icon-btn magic" title="Draft Email"><Wand2 size={16} /></button>
      <button onClick={() => onStageChange(lead.id, lead.status || "New", "next")} className="icon-btn next-stage" title="Move to Next Stage"><ArrowRight size={16} /></button>
      <button onClick={() => onDelete(lead.id)} className="icon-btn delete"><Trash2 size={16} /></button>
    </div>
  </motion.div>
);

export default App;