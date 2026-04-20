import { useState } from 'react';

const POLICY_COLORS = {
  Diamond: 'badge-purple',
  Platinum: 'badge-blue',
  Gold: 'badge-yellow',
  Silver: 'badge-gray',
  Bronze: 'badge-orange',
};

export default function ProtectionRule({ data, onBack }) {
  const [expandedId, setExpandedId] = useState(data[0]?.id);

  return (
    <>
      <div className="screen-header">
        <h1>Protection Rules</h1>
        <p>Define automated protection rules that map workloads to backup policies based on classification criteria.</p>
      </div>

      {data.map(rule => {
        const expanded = expandedId === rule.id;
        return (
          <div
            key={rule.id}
            className={`card`}
            style={{ cursor: 'pointer', borderColor: expanded ? '#58a6ff' : undefined }}
            onClick={() => setExpandedId(expanded ? null : rule.id)}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="badge badge-blue">{rule.rule_priority}</span>
                <span className="card-title" style={{ marginBottom: 0 }}>{rule.rule_name}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${POLICY_COLORS[rule.policy.name] || 'badge-gray'}`}>
                  {rule.policy.name}
                </span>
                <div className={`toggle ${rule.enable_now ? 'on' : ''}`} />
              </div>
            </div>

            {expanded && (
              <div style={{ marginTop: 16 }}>
                {/* Conditions */}
                <div className="card-subtitle" style={{ fontWeight: 600, color: '#c9d1d9', marginBottom: 8 }}>
                  Protect If
                </div>
                <div className="condition-row">
                  <span className="condition-field">Agent Type</span>
                  <span className="condition-op">is</span>
                  <span className="condition-value">{rule.conditions.agent_type}</span>
                </div>
                <div className="condition-row">
                  <span className="condition-join">AND</span>
                  <span className="condition-field">Data Sensitivity Type</span>
                  <span className="condition-op">is</span>
                  <span className="condition-value">{rule.conditions.data_sensitivity_type}</span>
                </div>
                <div className="condition-row">
                  <span className="condition-join">AND</span>
                  <span className="condition-field">Data Categories</span>
                  <span className="condition-op">is</span>
                  <span className="condition-value">{rule.conditions.data_categories}</span>
                </div>

                <div className="raw-expr">{rule.raw_expression}</div>

                {/* Policy */}
                <div style={{ marginTop: 16 }}>
                  <div className="card-subtitle" style={{ fontWeight: 600, color: '#c9d1d9', marginBottom: 8 }}>
                    Policy: <span className={`badge ${POLICY_COLORS[rule.policy.name] || 'badge-gray'}`}>{rule.policy.name}</span> ✏️
                  </div>
                  <div className="badge-row">
                    <span className="badge badge-blue">{rule.policy.backup_frequency}</span>
                    <span className="badge badge-gray">Retain {rule.policy.retention_days} days</span>
                    <span className="badge badge-purple">DataLock {rule.policy.datalock_days} days</span>
                  </div>
                </div>

                {/* Enable toggle */}
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#c9d1d9' }}>Enable Now</span>
                  <div className={`toggle ${rule.enable_now ? 'on' : ''}`} />
                </div>

                {/* Actions */}
                <div className="btn-group">
                  <button className="btn btn-primary">Create Rule</button>
                  <button className="btn btn-secondary">Cancel</button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="btn-group">
        <button className="btn btn-secondary" onClick={onBack}>Back</button>
      </div>
    </>
  );
}
