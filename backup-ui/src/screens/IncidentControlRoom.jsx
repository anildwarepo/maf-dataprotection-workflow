const RTO_STATUS_BADGE = {
  'RTO Met': 'badge-green',
  'RTO At Risk': 'badge-yellow',
  'RTO Breached': 'badge-red',
};

export default function IncidentControlRoom({ data, onNext, onBack }) {
  const inc = data.incident;
  const stages = data.response_stages;
  const appStatus = data.application_status;
  const apps = data.applications;
  const copilot = data.copilot_activity;

  return (
    <>
      <div className="breadcrumb">
        Security Center &gt; <span>Cyber Incident Control Room</span>
      </div>

      <div className="screen-header">
        <h1>Cyber Incident Control Room</h1>
      </div>

      {/* Alert banner */}
      <div style={{
        background: 'rgba(218,54,51,.1)',
        border: '1px solid rgba(218,54,51,.4)',
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>🚨</span>
        <div>
          <div style={{ fontWeight: 600, color: '#f85149', fontSize: 13 }}>{inc.alert}</div>
          <div style={{ fontSize: 12, color: '#8b949e' }}>
            Severity: <span className="badge badge-red">{inc.severity}</span>
            &nbsp; Detected: {new Date(inc.detected_at).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stages Pipeline */}
      <div className="stage-pipeline">
        {stages.map((s, i) => (
          <div key={i} className="stage-box">
            <h4>{s.stage}. {s.name}</h4>
            <p>{s.description}</p>
            <div className={`stage-status ${s.status === 'Completed' ? 'stage-complete' : 'stage-progress'}`}>
              {s.status === 'Completed'
                ? `✓ Completed ${s.completed} of ${s.total}`
                : `⟳ Completed ${s.completed} of ${s.total} | In Progress ${s.in_progress || 0}`
              }
            </div>
          </div>
        ))}
      </div>

      <div className="split-layout">
        <div className="split-left">
          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-value">{appStatus.objects_of_interest}</div>
              <div className="stat-label">Objects of Interest</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{appStatus.applications_orchestrated}</div>
              <div className="stat-label">Apps Orchestrated</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ fontSize: 16, color: '#d29922' }}>
                {appStatus.orchestration_status}
              </div>
              <div className="stat-label">Status</div>
            </div>
          </div>

          {/* Application Table */}
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Objects</th>
                  <th>Blueprint Progress</th>
                  <th>Desired RTO</th>
                  <th>Last 5 Runs</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app, i) => {
                  const bp = app.blueprint_progress;
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{app.application_name}</td>
                      <td>{app.num_objects} Objects</td>
                      <td>
                        <div className="progress-row">
                          <div className="progress-bar">
                            <div
                              className={`progress-fill ${bp.percentage >= 80 ? 'green' : bp.percentage >= 40 ? 'yellow' : 'red'}`}
                              style={{ width: `${bp.percentage}%` }}
                            />
                          </div>
                          <span className="progress-value">{bp.percentage}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${RTO_STATUS_BADGE[app.rto_status] || 'badge-gray'}`}>
                          {app.rto_status}: {app.desired_rto}
                        </span>
                      </td>
                      <td>
                        <div className="run-indicators">
                          {app.last_5_runs.map((r, j) => (
                            <div key={j} className={`run-dot ${r}`} title={r} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right — Copilot */}
        <div className="split-right">
          <div className="copilot-panel">
            <div className="copilot-header">
              <div className="icon">🤖</div>
              <h3>Copilot — Incident Response</h3>
            </div>

            <div className="copilot-message" style={{ borderLeft: '3px solid #f85149' }}>
              <strong>🚨 {inc.alert}</strong>
            </div>

            <div className="copilot-message">
              {copilot.message}
            </div>

            <div className="copilot-message">
              <strong>Blueprint:</strong> {copilot.blueprint_in_progress}
              <div style={{ marginTop: 8 }}>
                {copilot.recovered_objects.map((obj, i) => (
                  <div key={i} style={{ marginBottom: 4, fontSize: 12 }}>
                    <span className={`badge ${obj.status === 'recovered' ? 'badge-green' : obj.status === 'in-progress' ? 'badge-blue' : 'badge-gray'}`}>
                      {obj.status}
                    </span>
                    {' '}{obj.object_name} → {obj.recovered_to}
                  </div>
                ))}
              </div>
            </div>

            <div className="copilot-input">
              <input placeholder="Ask anything..." />
              <button className="btn btn-primary btn-sm">↑</button>
            </div>
          </div>
        </div>
      </div>

      <div className="btn-group">
        <button className="btn btn-secondary" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={onNext}>Continue</button>
      </div>
    </>
  );
}
