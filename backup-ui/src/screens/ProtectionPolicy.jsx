export default function ProtectionPolicy({ data, onNext, onBack }) {
  return (
    <>
      <div className="screen-header">
        <h1>Protection Policy Detail</h1>
        <p>3-2-1 multi-cluster replication and vaulting configuration.</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>
            Rule: {data.rule_name} ✏️
          </div>
          <span className="badge badge-yellow">{data.policy_tier}</span>
        </div>

        {/* Condition */}
        <div style={{ marginBottom: 20 }}>
          <div className="card-subtitle" style={{ marginBottom: 8 }}>If:</div>
          <div className="condition-row">
            <span className="condition-field">application</span>
            <span className="condition-op">:</span>
            <span className="condition-value">{data.condition.application}</span>
            <span className="condition-join">AND</span>
            <span className="condition-value">{data.condition.data_sensitivity}</span>
          </div>
          <div className="card-subtitle" style={{ marginTop: 12, marginBottom: 8 }}>Then: <span className="badge badge-yellow">{data.policy_tier}</span></div>
        </div>

        {/* Replication Chain */}
        <div className="card-subtitle" style={{ marginBottom: 12, fontWeight: 600, color: '#c9d1d9' }}>
          Multi-Cluster Replication Chain
        </div>
        <div className="replication-chain">
          {data.replication_chain.map((node, i) => (
            <div key={i}>
              <div className="chain-node">
                <div className="chain-connector">
                  <div className="chain-dot" />
                  {i < data.replication_chain.length - 1 && <div className="chain-line" />}
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
            ALLOW: <span style={{ color: '#58a6ff' }}>{data.allow_condition}</span>
          </span>
        </div>
      </div>

      <div className="btn-group">
        <button className="btn btn-secondary" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={onNext}>Continue</button>
      </div>
    </>
  );
}
