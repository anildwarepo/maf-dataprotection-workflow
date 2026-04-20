import { useState } from 'react';

const POLICY_COLORS = {
  Diamond: 'badge-purple', Platinum: 'badge-blue', Gold: 'badge-yellow',
  Silver: 'badge-gray', Bronze: 'badge-orange',
};

export default function FinalApprovalScreen({ data, onSubmit }) {
  const rules = data.rules || [];
  const policies = data.backup_policies || [];
  const [expandedId, setExpandedId] = useState(rules[0]?.id);
  const [feedback, setFeedback] = useState('');

  return (
    <>
      <div className="screen-header">
        <h1>Final Review &amp; Approval</h1>
        <p>Review the protection rules below. Approve to create the backup policy or reject to revise.</p>
      </div>

      {data.iteration > 1 && (
        <div style={{
          background: 'rgba(31,111,235,.1)', border: '1px solid rgba(31,111,235,.4)',
          borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#58a6ff',
        }}>
          ⟳ Revision iteration #{data.iteration}
        </div>
      )}

      {/* Backup Policies summary */}
      <div className="card">
        <div className="card-title">Backup Policies</div>
        <table className="data-table">
          <thead>
            <tr><th>Policy</th><th>Frequency</th><th>Retention</th><th>DataLock</th><th>Replicate</th><th>Vault</th></tr>
          </thead>
          <tbody>
            {policies.map(p => (
              <tr key={p.id}>
                <td><span className={`badge ${POLICY_COLORS[p.policy_name] || 'badge-gray'}`}>{p.policy_name}</span></td>
                <td>{p.backup_frequency}</td>
                <td>{p.retention_days} days</td>
                <td>{p.datalock_days} days</td>
                <td>{p.replicate_every_run ? '✓' : '—'}</td>
                <td>{p.vault_every_run ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Protection Rules */}
      <div className="card">
        <div className="card-title">Protection Rules</div>
        {rules.map(rule => {
          const expanded = expandedId === rule.id;
          return (
            <div
              key={rule.id}
              className="card"
              style={{ cursor: 'pointer', borderColor: expanded ? '#58a6ff' : undefined }}
              onClick={() => setExpandedId(expanded ? null : rule.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="badge badge-blue">{rule.rule_priority}</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#e6edf3' }}>{rule.rule_name}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge ${POLICY_COLORS[rule.policy?.name] || 'badge-gray'}`}>{rule.policy?.name}</span>
                  <div className={`toggle ${rule.enable_now ? 'on' : ''}`} />
                </div>
              </div>

              {expanded && (
                <div style={{ marginTop: 16 }} onClick={e => e.stopPropagation()}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: '#c9d1d9', marginBottom: 8 }}>Protect If</div>
                  <div className="condition-row">
                    <span className="condition-field">Agent Type</span>
                    <span className="condition-op">is</span>
                    <span className="condition-value">{rule.conditions?.agent_type}</span>
                  </div>
                  <div className="condition-row">
                    <span className="condition-join">AND</span>
                    <span className="condition-field">Data Sensitivity</span>
                    <span className="condition-op">is</span>
                    <span className="condition-value">{rule.conditions?.data_sensitivity_type}</span>
                  </div>
                  <div className="condition-row">
                    <span className="condition-join">AND</span>
                    <span className="condition-field">Data Categories</span>
                    <span className="condition-op">is</span>
                    <span className="condition-value">{rule.conditions?.data_categories}</span>
                  </div>
                  <div className="raw-expr">{rule.raw_expression}</div>
                  <div style={{ marginTop: 12 }}>
                    <div className="badge-row">
                      <span className="badge badge-blue">{rule.policy?.backup_frequency}</span>
                      <span className="badge badge-gray">Retain {rule.policy?.retention_days} days</span>
                      <span className="badge badge-purple">DataLock {rule.policy?.datalock_days} days</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Approval actions */}
      <div className="card" style={{ borderColor: '#238636' }}>
        <div className="card-title">Decision</div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#8b949e', display: 'block', marginBottom: 6 }}>
            Feedback (optional, used if rejecting)
          </label>
          <input
            className="form-input"
            placeholder="Enter revision guidance..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
          />
        </div>
        <div className="btn-group">
          <button className="btn btn-success" onClick={() => onSubmit({ action: 'approve' })}>
            ✓ Approve &amp; Create Policy
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onSubmit({ action: 'reject', feedback: feedback || 'Needs revision' })}
          >
            ✕ Reject &amp; Revise
          </button>
        </div>
      </div>
    </>
  );
}
