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

export default function ResiliencyPlanScreen({ data, onSubmit }) {
  const inv = data.inventory || {};
  const plan = data.resiliency_plan || {};
  const policy = data.protection_policy || {};
  const cyber = data.cyber_recoverability || {};
  const objects = inv.objects || [];
  const apps = inv.application_groups || [];
  const [expandedApp, setExpandedApp] = useState(apps[0]);
  const [activeTab, setActiveTab] = useState('plan');

  const objectsByApp = {};
  objects.forEach(obj => {
    if (!objectsByApp[obj.application_group]) objectsByApp[obj.application_group] = [];
    objectsByApp[obj.application_group].push(obj);
  });

  const allBlueprints = [...(cyber.core_blueprints || []), ...(cyber.additional_blueprints || [])];

  return (
    <>
      <div className="breadcrumb">Security Center &gt; <span>Inventory</span></div>
      <div className="screen-header">
        <h1>🤖 AI Resiliency Plan</h1>
        <p>{inv.organization} — {inv.source_id}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid #30363d' }}>
        {[
          { key: 'plan', label: 'Resiliency Plan' },
          { key: 'policy', label: 'Protection Policy' },
          { key: 'cyber', label: 'Cyber Recoverability' },
          { key: 'inventory', label: 'Inventory' },
        ].map(tab => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              color: activeTab === tab.key ? '#58a6ff' : '#8b949e',
              borderBottom: activeTab === tab.key ? '2px solid #58a6ff' : '2px solid transparent',
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Tab: Resiliency Plan */}
      {activeTab === 'plan' && (
        <div className="split-layout">
          <div className="split-left">
            {/* Coverage */}
            {inv.resiliency_coverage && (
              <div className="card">
                <div className="card-title">Resiliency Coverage</div>
                <div className="coverage-grid">
                  {Object.entries(inv.resiliency_coverage).map(([key, pct]) => (
                    <div key={key} className="coverage-item">
                      <div className="coverage-ring" style={{ borderColor: coverageColor(pct), color: coverageColor(pct) }}>
                        {pct}%
                      </div>
                      <div className="coverage-label">{key.replace(/_/g, ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="split-right">
            <div className="copilot-panel">
              <div className="copilot-header">
                <div className="icon">🤖</div>
                <h3>Copilot</h3>
              </div>
              <div className="copilot-message">
                <strong>Application Resiliency Plan</strong> for <strong>{plan.application}</strong>
              </div>

              {(plan.key_highlights || []).map((h, i) => (
                <div key={i} className="highlight-card">
                  <h4>{i + 1}. {h.area}</h4>
                  <p>{h.summary}</p>
                </div>
              ))}

              {plan.suggested_actions && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#c9d1d9', marginBottom: 8 }}>Suggested Actions</div>
                  <div className="highlight-card">
                    <h4>Protection Policy</h4>
                    <p>
                      {plan.suggested_actions.protection_policy?.backup_frequency} · Retain: {plan.suggested_actions.protection_policy?.retention_days}d
                      · Replicate {plan.suggested_actions.protection_policy?.replicate} · Vault {plan.suggested_actions.protection_policy?.vault}
                    </p>
                  </div>
                  <div className="highlight-card">
                    <h4>Threat Monitoring</h4>
                    <p>{plan.suggested_actions.threat_monitoring?.scan_frequency} — {(plan.suggested_actions.threat_monitoring?.libraries || []).join(', ')}</p>
                  </div>
                  <div className="highlight-card">
                    <h4>Cyber Recoverability</h4>
                    <p>{(plan.suggested_actions.cyber_recoverability?.blueprints || []).join(' · ')}</p>
                  </div>
                </div>
              )}

              <div className="copilot-message" style={{ marginTop: 12, textAlign: 'center' }}>
                Looks good?
                <div className="copilot-actions" style={{ justifyContent: 'center' }}>
                  <button className="btn btn-success btn-sm" onClick={() => onSubmit({ action: 'approve' })}>Yes</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => onSubmit({ action: 'reject', feedback: 'Needs revision' })}>No</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Protection Policy */}
      {activeTab === 'policy' && policy.rule_name && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Rule: {policy.rule_name} ✏️</div>
            <span className="badge badge-yellow">{policy.policy_tier}</span>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div className="card-subtitle" style={{ marginBottom: 8 }}>If:</div>
            <div className="condition-row">
              <span className="condition-field">application</span>
              <span className="condition-op">:</span>
              <span className="condition-value">{policy.condition?.application}</span>
              <span className="condition-join">AND</span>
              <span className="condition-value">{policy.condition?.data_sensitivity}</span>
            </div>
          </div>

          <div style={{ fontWeight: 600, fontSize: 13, color: '#c9d1d9', marginBottom: 12 }}>Multi-Cluster Replication Chain</div>
          <div className="replication-chain">
            {(policy.replication_chain || []).map((node, i) => (
              <div key={i}>
                <div className="chain-node">
                  <div className="chain-connector">
                    <div className="chain-dot" />
                    {i < policy.replication_chain.length - 1 && <div className="chain-line" />}
                  </div>
                  <div className="chain-content">
                    <h5>{node.target}</h5>
                    <p>
                      {node.tier}
                      {node.backup_frequency && <> · {node.backup_frequency}</>}
                      {node.replication && <> · Replicate {node.replication}</>}
                      {node.vault && <> · Vault {node.vault}</>}
                      {node.retention && <> · Retain: {node.retention}</>}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: '10px 14px', background: '#0d1117', borderRadius: 6, border: '1px solid #30363d' }}>
            <span style={{ fontSize: 12, color: '#8b949e' }}>
              ALLOW: <span style={{ color: '#58a6ff' }}>{policy.allow_condition}</span>
            </span>
          </div>
        </div>
      )}

      {/* Tab: Cyber Recoverability */}
      {activeTab === 'cyber' && (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-value">{allBlueprints.length}</div>
              <div className="stat-label">Blueprints</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{allBlueprints.filter(b => b.last_run_status === 'success').length}</div>
              <div className="stat-label">Last Run Success</div>
            </div>
          </div>
          {allBlueprints.map(bp => (
            <div key={bp.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="card-title" style={{ marginBottom: 0 }}>📋 {bp.blueprint_name}</div>
                <span className={`badge ${bp.last_run_status === 'success' ? 'badge-green' : bp.last_run_status === 'warning' ? 'badge-yellow' : 'badge-red'}`}>
                  {bp.last_run_status}
                </span>
              </div>
              <div className="workflow-steps">
                {bp.workflow_steps.map((step, i) => (
                  <div key={i} className="workflow-step">
                    <div className={`step-box ${step.type}`}>{step.name}</div>
                    {i < bp.workflow_steps.length - 1 && <span className="arrow">→</span>}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
                <span style={{ fontSize: 12, color: '#8b949e' }}>Frequency: <span className="badge badge-blue">{bp.frequency}</span></span>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Tab: Inventory */}
      {activeTab === 'inventory' && (
        <div className="card">
          <div className="card-title">Group By: Application Groups</div>
          {apps.map(app => (
            <div key={app} style={{ marginBottom: 8 }}>
              <div
                style={{
                  padding: '8px 12px', background: expandedApp === app ? '#1c2128' : 'transparent',
                  borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  color: expandedApp === app ? '#58a6ff' : '#c9d1d9',
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
                    <tr><th>Object Name</th><th>SLA</th><th>Protection</th><th>Data Classes</th><th>Sensitivity</th></tr>
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
                          <span className={`badge ${obj.data_sensitivity === 'Confidential' ? 'badge-red' : obj.data_sensitivity === 'Restricted' ? 'badge-orange' : 'badge-yellow'}`}>
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
      )}

      {/* Bottom action (visible on all tabs) */}
      {activeTab !== 'plan' && (
        <div className="btn-group" style={{ marginTop: 20 }}>
          <button className="btn btn-success" onClick={() => onSubmit({ action: 'approve' })}>Approve Plan</button>
          <button className="btn btn-secondary" onClick={() => onSubmit({ action: 'reject', feedback: 'Needs revision' })}>Reject &amp; Revise</button>
        </div>
      )}
    </>
  );
}
