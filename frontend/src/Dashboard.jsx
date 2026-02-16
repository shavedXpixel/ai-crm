import { motion } from "framer-motion";
import { Users, Zap, DollarSign, TrendingUp } from "lucide-react";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ leads }) => {
  const totalLeads = leads.length;
  const pipelineValue = leads.reduce((acc, lead) => acc + (lead.ai_score * 150), 0);
  const hotLeads = leads.filter(l => l.ai_score > 80).length;
  const conversionRate = totalLeads === 0 ? 0 : Math.round((leads.filter(l => l.status === "Closed").length / totalLeads) * 100);

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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-content">
      <h1 className="page-title">Dashboard Overview</h1>

      {/* STATS ROW */}
      <div className="stats-grid-large">
        <div className="stat-card-large">
          <div className="stat-icon bg-blue"><Users size={24} color="#6366f1" /></div>
          <div><span className="label">Total Leads</span><span className="value">{totalLeads}</span></div>
        </div>
        <div className="stat-card-large">
          <div className="stat-icon bg-green"><DollarSign size={24} color="#10b981" /></div>
          <div><span className="label">Pipeline Value</span><span className="value">${pipelineValue.toLocaleString()}</span></div>
        </div>
        <div className="stat-card-large">
          <div className="stat-icon bg-yellow"><Zap size={24} color="#facc15" /></div>
          <div><span className="label">Hot Opportunities</span><span className="value">{hotLeads}</span></div>
        </div>
        <div className="stat-card-large">
          <div className="stat-icon bg-purple"><TrendingUp size={24} color="#a855f7" /></div>
          <div><span className="label">Conversion Rate</span><span className="value">{conversionRate}%</span></div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="charts-grid">
        <div className="glass-card chart-card">
          <h3>Lead Quality Distribution</h3>
          <div className="chart-container">
            <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'white' } } } }} />
          </div>
        </div>
        
        <div className="glass-card recent-activity">
          <h3>Recent Intelligence</h3>
          <div className="activity-list">
            {leads.slice(0, 4).map(lead => (
              <div key={lead.id} className="activity-item">
                <div className={`status-dot ${lead.ai_score > 80 ? 'hot' : 'warm'}`}></div>
                <div>
                  <p className="act-main">New lead <strong>{lead.name}</strong> detected.</p>
                  <p className="act-sub">{lead.company} • Score: {lead.ai_score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;