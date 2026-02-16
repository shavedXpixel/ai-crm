import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
// We keep these for the UI, but we won't use them for the buttons anymore
import { Search, Plus, List as ListIcon, LayoutGrid, User, Briefcase, Mail, FileText } from "lucide-react";

const Pipeline = ({ leads, onCreate, onDelete, onUpdateStatus, onGenerateEmail }) => {
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", company: "", email: "", notes: "" });

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    setFormData({ name: "", company: "", email: "", notes: "" });
    setShowForm(false);
  };

  const filteredLeads = useMemo(() => leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.company.toLowerCase().includes(searchQuery.toLowerCase())
  ), [leads, searchQuery]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-content">
      <div className="page-header">
        <h1 className="page-title">Pipeline Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="primary-btn">
          <Plus size={18} /> Add New Lead
        </button>
      </div>

      {/* COLLAPSIBLE FORM */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="form-wrapper">
            <div className="glass-card form-inner" style={{padding: '20px', borderColor: '#6366f1'}}>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="input-group"><User size={16}/><input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required /></div>
                  <div className="input-group"><Briefcase size={16}/><input name="company" placeholder="Company" value={formData.company} onChange={handleInputChange} required /></div>
                  <div className="input-group"><Mail size={16}/><input name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required /></div>
                </div>
                <div className="input-group"><FileText size={16}/><textarea name="notes" placeholder="Notes..." value={formData.notes} onChange={handleInputChange} required /></div>
                <button type="submit" className="submit-btn-small">Process Data</button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOOLBAR */}
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

      {/* VIEW CONTENT */}
      {viewMode === "list" ? (
        <div className="list-container">
          {filteredLeads.map(lead => (
            <LeadCard key={lead.id} lead={lead} onDelete={onDelete} onEmail={onGenerateEmail} onUpdate={onUpdateStatus} />
          ))}
        </div>
      ) : (
        <div className="kanban-board">
          {["New", "Contacted", "Negotiation", "Closed"].map(stage => (
            <div key={stage} className="kanban-column">
              <h4 className="column-title">{stage} <span className="count">{filteredLeads.filter(l => (l.status || "New") === stage).length}</span></h4>
              <div className="kanban-drop-area">
                {filteredLeads.filter(l => (l.status || "New") === stage).map(lead => (
                  <LeadCard key={lead.id} lead={lead} onDelete={onDelete} onEmail={onGenerateEmail} onUpdate={onUpdateStatus} isBoard={true} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// --- SUB-COMPONENT WITH EMOJIS (Guaranteed to work) ---
const LeadCard = ({ lead, onDelete, onEmail, onUpdate, isBoard }) => {
  const btnStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.2rem',
    border: 'none',
    transition: 'transform 0.2s',
    fontWeight: 'bold'
  };

  return (
    <motion.div layout className={`glass-card lead-card ${lead.ai_score > 80 ? "hot-lead" : ""} ${isBoard ? "board-card" : ""}`}>
      <div className="lead-content">
        <div className="card-top">
          <h3 style={{margin: 0}}>{lead.name}</h3>
          {!isBoard && <span className="company-tag">{lead.company}</span>}
        </div>
        {isBoard && <span className="company-tag" style={{display:'inline-block', marginTop:'5px'}}>{lead.company}</span>}
        {!isBoard && <p className="lead-notes">{lead.notes}</p>}
        
        <div className="lead-meta" style={{marginTop:'10px'}}>
          <span style={{color: lead.ai_score > 80 ? '#10b981' : '#94a3b8', fontWeight:'bold', fontSize:'0.85rem'}}>
            Score: {lead.ai_score}
          </span>
        </div>
      </div>
      
      {/* EMOJI BUTTONS */}
      <div className="lead-actions" style={{display:'flex', gap:'8px', marginTop: isBoard ? '15px' : '0', width: isBoard ? '100%' : 'auto', justifyContent: isBoard ? 'flex-end' : 'flex-start'}}>
        
        {/* Magic Wand */}
        <button 
          onClick={() => onEmail(lead)} 
          title="Draft Email"
          style={{...btnStyle, background: 'rgba(129, 140, 248, 0.2)', color: '#818cf8'}}
        >
          🪄
        </button>

        {/* Next Stage */}
        <button 
          onClick={() => onUpdate(lead.id, lead.status, "next")} 
          title="Move to Next Stage"
          style={{...btnStyle, background: 'rgba(250, 204, 21, 0.2)', color: '#facc15'}}
        >
          ➡️
        </button>

        {/* Delete */}
        <button 
          onClick={() => onDelete(lead.id)} 
          title="Delete"
          style={{...btnStyle, background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e'}}
        >
          🗑️
        </button>

      </div>
    </motion.div>
  );
};

export default Pipeline;