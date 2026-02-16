import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { X, Copy, Wand2 } from "lucide-react";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Pipeline from "./Pipeline";
import "./App.css";
import Settings from "./Settings";

function App() {
  const [leads, setLeads] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    try { const res = await axios.get(`${API_URL}/leads/`); setLeads(res.data); } 
    catch (error) { console.error(error); }
  };

  const createLead = async (data) => {
    await axios.post(`${API_URL}/leads/`, data);
    fetchLeads();
  };

  const deleteLead = async (id) => {
    await axios.delete(`${API_URL}/leads/${id}`);
    fetchLeads();
  };

  const updateStatus = async (id, currentStatus, direction) => {
    const stages = ["New", "Contacted", "Negotiation", "Closed"];
    let idx = stages.indexOf(currentStatus || "New");
    if (direction === "next") idx = Math.min(idx + 1, stages.length - 1);
    await axios.patch(`${API_URL}/leads/${id}`, { status: stages[idx] });
    fetchLeads();
  };

  const generateEmail = async (lead) => {
    setGeneratedEmail("Thinking...");
    setModalOpen(true);
    try {
      const res = await axios.get(`${API_URL}/leads/${lead.id}/email`);
      setGeneratedEmail(res.data.email);
    } catch { setGeneratedEmail("Error."); }
  };

  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard leads={leads} />} />
            <Route path="/leads" element={
              <Pipeline 
                leads={leads} 
                onCreate={createLead} 
                onDelete={deleteLead} 
                onUpdateStatus={updateStatus} 
                onGenerateEmail={generateEmail} 
              />
            } />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>

        {/* EMAIL MODAL (Global) */}
        <AnimatePresence>
          {modalOpen && (
            <div className="modal-overlay">
              <motion.div className="modal-content glass-card" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                <div className="modal-header"><h3><Wand2 size={18}/> AI Draft</h3><button onClick={() => setModalOpen(false)}><X size={18}/></button></div>
                <div className="email-preview"><pre>{generatedEmail}</pre></div>
                <button onClick={() => navigator.clipboard.writeText(generatedEmail)} className="copy-btn"><Copy size={16}/> Copy</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;