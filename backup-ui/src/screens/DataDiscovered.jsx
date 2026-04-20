import { useState } from 'react';

const CATEGORY_COLORS = {
  Personal: 'badge-blue',
  Financial: 'badge-green',
  'Business & IP': 'badge-purple',
  'IT & Security': 'badge-yellow',
  Health: 'badge-red',
};

const EXPOSURE_COLORS = {
  Confidential: 'badge-red',
  Internal: 'badge-yellow',
  Public: 'badge-green',
};

function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

export default function DataDiscovered({ data, onSubmit }) {
  if (!data || !data.classified_sensitive_data) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <p style={{ color: '#8b949e' }}>No discovery data available. Ensure the MCP server is running.</p>
      </div>
    );
  }
  const cls = data.classified_sensitive_data;
  const [selected, setSelected] = useState(() =>
    (data.next_steps || []).reduce((acc, ns) => ({ ...acc, [ns.step]: true }), {})
  );

  const toggle = (step) => setSelected(s => ({ ...s, [step]: !s[step] }));
  const anySelected = Object.values(selected).some(Boolean);

  return (
    <>
      <div className="screen-header">
        <h1>Data Discovered</h1>
        <p>Summary of objects and applications found during the cloud source scan.</p>
      </div>

      <div className="discovery-hero">
        <div className="hex-icon">⬡</div>
        <div className="discovery-nums">
          <h2>{data.total_objects.toLocaleString()}</h2>
          <span>Total Objects</span>
        </div>
        <div className="discovery-nums" style={{ marginLeft: 24 }}>
          <h2>{data.applications_discovered}</h2>
          <span>Applications Discovered</span>
        </div>
      </div>

      {/* Data Categories */}
      <div className="card">
        <div className="card-title">Classified Sensitive Data</div>
        <div className="card-subtitle">Data Categories</div>
        <div className="badge-row">
          {Object.entries(cls.data_categories).map(([cat, count]) => (
            <span key={cat} className={`badge ${CATEGORY_COLORS[cat] || 'badge-gray'}`}>
              {cat}: {fmt(count)}
            </span>
          ))}
        </div>
      </div>

      {/* Data Context */}
      <div className="card">
        <div className="card-title">Data Context</div>
        <div className="badge-row">
          {cls.data_context.types.map(t => (
            <span key={t} className="badge badge-blue">{t}</span>
          ))}
          <span className="badge badge-gray">{cls.data_context.region}</span>
          <span className="badge badge-gray">{cls.data_context.identifiability}</span>
        </div>
      </div>

      {/* File Extensions */}
      <div className="card">
        <div className="card-title">File Extensions</div>
        <div className="ext-grid">
          {Object.entries(cls.file_extensions).map(([ext, count]) => (
            <div key={ext} className="ext-badge">
              {ext}<strong>{count}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Exposure & Access */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title">Exposure</div>
          <div className="badge-row">
            {Object.entries(cls.exposure).map(([level, count]) => (
              <span key={level} className={`badge ${EXPOSURE_COLORS[level] || 'badge-gray'}`}>
                {level}: {fmt(count)}
              </span>
            ))}
          </div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title">Access</div>
          <div className="badge-row">
            <span className="badge badge-blue">Agents: {cls.access.agents}</span>
            <span className="badge badge-purple">Users: {cls.access.users}</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="card">
        <div className="card-title">Next Steps</div>
        <div className="card-subtitle">Select the capabilities you want to enable.</div>
        <div className="next-steps">
          {data.next_steps.map(ns => (
            <div
              key={ns.step}
              className="next-step"
              style={{
                borderColor: selected[ns.step] ? '#1f6feb' : undefined,
                background: selected[ns.step] ? 'rgba(31,111,235,.06)' : undefined,
              }}
              onClick={() => toggle(ns.step)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
                <input
                  type="checkbox"
                  checked={!!selected[ns.step]}
                  onChange={() => toggle(ns.step)}
                  onClick={e => e.stopPropagation()}
                  style={{ accentColor: '#58a6ff', width: 16, height: 16 }}
                />
                <div className="step-circle">{ns.step}</div>
              </div>
              <div>
                <h4>{ns.title}</h4>
                <p>{ns.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="btn-group">
        <button
          className="btn btn-primary"
          disabled={!anySelected}
          onClick={() => onSubmit({
            action: 'continue',
            capabilities: data.next_steps.filter(ns => selected[ns.step]).map(ns => ns.title),
          })}
        >
          Continue with {Object.values(selected).filter(Boolean).length} selected
        </button>
      </div>
    </>
  );
}
