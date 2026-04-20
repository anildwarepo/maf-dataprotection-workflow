const STATUS_BADGE = {
  success: 'badge-green',
  failure: 'badge-red',
  warning: 'badge-yellow',
  'in-progress': 'badge-blue',
};

function BlueprintCard({ bp }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 0 }}>
          📋 {bp.blueprint_name} ✏️
        </div>
        <span className={`badge ${STATUS_BADGE[bp.last_run_status] || 'badge-gray'}`}>
          {bp.last_run_status}
        </span>
      </div>

      {/* Workflow steps */}
      <div className="card-subtitle">Workflow</div>
      <div className="workflow-steps">
        {bp.workflow_steps.map((step, i) => (
          <div key={i} className="workflow-step">
            <div className={`step-box ${step.type}`}>{step.name}</div>
            {i < bp.workflow_steps.length - 1 && <span className="arrow">→</span>}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
        <div>
          <span style={{ fontSize: 12, color: '#8b949e' }}>Frequency: </span>
          <span className="badge badge-blue">{bp.frequency}</span>
        </div>
        <div>
          <span style={{ fontSize: 12, color: '#8b949e' }}>Last Run: </span>
          <span style={{ fontSize: 12, color: '#c9d1d9' }}>
            {new Date(bp.last_run).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CyberRecoverability({ data, onNext, onBack }) {
  const all = [...data.core_blueprints, ...data.additional_blueprints];

  return (
    <>
      <div className="screen-header">
        <h1>Cyber Recoverability</h1>
        <p>Blueprint-based recovery workflows for automated incident response.</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{all.length}</div>
          <div className="stat-label">Blueprints</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{all.filter(b => b.last_run_status === 'success').length}</div>
          <div className="stat-label">Last Run Success</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.core_blueprints.length}</div>
          <div className="stat-label">Core Blueprints</div>
        </div>
      </div>

      {all.map(bp => (
        <BlueprintCard key={bp.id} bp={bp} />
      ))}

      <div className="btn-group">
        <button className="btn btn-secondary" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={onNext}>Continue</button>
      </div>
    </>
  );
}
