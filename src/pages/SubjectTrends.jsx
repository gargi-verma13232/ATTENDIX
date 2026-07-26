import { useMockData } from '../MockDataContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(11, 14, 20, 0.9)', border: '1px solid var(--panel-border)', padding: '12px', borderRadius: '8px', backdropFilter: 'blur(8px)' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }}></div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{entry.name}:</span>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: entry.value < 75 ? 'var(--status-critical)' : 'white' }}>{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SubjectTrends = () => {
  const { attendanceTrend } = useMockData();

  const colors = {
    'Data Structures': '#3B82F6',
    'Database Systems': '#8B5CF6',
    'Operating Systems': '#10B981',
    'Communication Skills': '#F59E0B'
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TrendingUp color="var(--accent-primary)" /> Subject-wise Attendance Trends
        </h1>
        <p className="page-subtitle">Track your weekly attendance trajectory to spot declining subjects early.</p>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel col-span-12">
          <div style={{ height: '400px', width: '100%', marginTop: '24px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" stroke="var(--text-muted)" />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" tickFormatter={(tick) => `${tick}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                
                {Object.keys(colors).map(subject => (
                  <Line 
                    key={subject}
                    type="monotone" 
                    dataKey={subject} 
                    stroke={colors[subject]} 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-color)' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}
                
                {/* 75% Threshold Line */}
                <Line 
                  type="step" 
                  dataKey={() => 75} 
                  stroke="var(--status-critical)" 
                  strokeDasharray="5 5" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={false}
                  name="75% Threshold"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {Object.keys(colors).map(subject => {
            const latest = attendanceTrend[attendanceTrend.length - 1][subject];
            const previous = attendanceTrend[attendanceTrend.length - 2][subject];
            const diff = latest - previous;
            
            return (
              <div key={subject} className="glass-panel" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>{subject}</h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{latest}%</span>
                  <span style={{ fontSize: '12px', color: diff >= 0 ? 'var(--status-safe)' : 'var(--status-critical)' }}>
                    {diff > 0 ? '+' : ''}{diff}% this week
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubjectTrends;
