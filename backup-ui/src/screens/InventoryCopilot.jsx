import { useState } from 'react';

const STATUS_CLASS = {
  Protected: 'status-protected',
  Unprotected: 'status-unprotected',
  'Partially Protected': 'status-partial',
};

function coverageColor(pct) {
  if (pct >= 70) return '#3fb950';
  if (pct >= 40) return '#d29922';
  return '#f85149';
}

export default function InventoryCopilot({ data, onNext, onBack }) {
  const inv = data.inventory;
  const plan = data.resiliency_plan;
  const [expandedApp, setExpandedApp] = useState(inv.application_groups[0]);

  const objectsByApp = {};
  inv.objects.forEach(obj => {
    if (!objectsByApp[obj.application_group]) objectsByApp[obj.application_group] = [];
    objectsByApp[obj.application_group].push(obj);
  });

  return (
    <>
      <div className="breadcrumb">
        Security Center &gt; <span>Inventory</span>
      </div>
      <div className="screen-header">
        <h1>Security Center Inventory</h1>
        <p>{inv.organization} — {inv.source_id}</p>
      </div>

      <div className="split-layout">
        {/* Left — Inventory */}
        <div className="split-left">
          {/* Resiliency Coverage */}
          <div className="card">
            <div className="card-title">Resiliency Coverage</div>
            <div className="coverage-grid">
              {Object.entries(inv.resiliency_coverage).map(([key, pct]) => (
                <div key={key} className="coverage-item">
                  <div
                    className="coverage-ring"
                    style={{ borderColor: coverageColor(pct), color: coverageColor(pct) }}
                  >
                    {pct}%
                  </div>
                  <div className="coverage-label">{key.replace(/_/g, ' ')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Objects Table */}
          <div className="card">
            <div className="card-title">
              Group By: Application Groups
            </div>
            {inv.application_groups.map(app => (
              <div key={app} style={{ marginBottom: 8 }}>
                <div
                  style={{
                    padding: '8px 12px',
                    background: expandedApp === app ? '#1c2128' : 'transparent',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    color: expandedApp === app ? '#58a6ff' : '#c9d1d9',
                    marginBottom: 4,
                  }}
                  onClick={() => setExpandedApp(expandedApp === app ? null : app)}
                >
                  {expandedApp === app ? '▾' : '▸'} {app}
                  <span style={{ color: '#8b949e', fontWeight: 400, marginLeft: 8 }}>
                    ({(objectsByApp[app] || []).length} objects)
                  </span>
                </div>
                {expandedApp === app && objectsByApp[app] && (
                  <table className="data-table" style={{ marginLeft: 16 }}>
                    <thead>
                      <tr>
                        <th>Object Name</th>
                        <th>SLA</th>
                        <th>Protection</th>
                        <th>Data Classes</th>
                        <th>Sensitivity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {objectsByApp[app].map(obj => (
                        <tr key={obj.id}>
                          <td>{obj.object_name}</td>
                          <td><span className="badge badge-gray">{obj.sla}</span></td>
                          <td>
                            <span className={`status-dot ${STATUS_CLASS[obj.protection_status] || ''}`} />
                            {obj.protection_status}
                          </td>
                          <td>{obj.data_classes}</td>
                          <td>
                            <span className={`badge ${obj.data_sensitivity === 'Confidential' ? 'badge-red' : obj.data_sensitivity === 'Restricted' ? 'badge-orange' : obj.data_sensitivity === 'Internal' ? 'badge-yellow' : 'badge-green'}`}>
                              {obj.data_sensitivity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Copilot */}
        <div className="split-right">
          <div className="copilot-panel">
            <div className="copilot-header">
              <div className="icon">🤖</div>
              <h3>Copilot</h3>
            </div>

            <div className="copilot-message">
              <strong>Application Resiliency Plan</strong> for <strong>{plan.application}</strong>
            </div>

            {plan.key_highlights.map((h, i) => (
              <div key={i} className="highlight-card">
                <h4>{i + 1}. {h.area}</h4>
                <p>{h.summary}</p>
              </div>
            ))}

            <div style={{ marginTop: 16 }}>
              <div className="card-subtitle" style={{ marginBottom: 8, fontWeight: 600, color: '#c9d1d9' }}>Suggested Actions</div>
              <div className="highlight-card">
                <h4>Protection Policy</h4>
                <p>
                  {plan.suggested_actions.protection_policy.backup_frequency} · Retain: {plan.suggested_actions.protection_policy.retention_days}d
                  · Replicate {plan.suggested_actions.protection_policy.replicate} · Vault {plan.suggested_actions.protection_policy.vault}
                </p>
              </div>
              <div className="highlight-card">
                <h4>Threat Monitoring</h4>
                <p>
                  {plan.suggested_actions.threat_monitoring.scan_frequency} scanned with {plan.suggested_actions.threat_monitoring.libraries.join(' and ')}
                </p>
              </div>
              <div className="highlight-card">
                <h4>Cyber Recoverability</h4>
                <p>{plan.suggested_actions.cyber_recoverability.blueprints.join(' · ')}</p>
              </div>
            </div>

            <div className="copilot-message" style={{ marginTop: 12, textAlign: 'center' }}>
              Looks good?
              <div className="copilot-actions" style={{ justifyContent: 'center' }}>
                <button className="btn btn-success btn-sm" onClick={onNext}>Yes</button>
                <button className="btn btn-secondary btn-sm">No</button>
              </div>
            </div>

            <div className="copilot-input">
              <input placeholder="Ask anything..." />
              <button className="btn btn-primary btn-sm">↑</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
