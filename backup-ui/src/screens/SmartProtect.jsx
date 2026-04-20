const POLICY_COLORS = {
  Diamond: 'badge-purple',
  Platinum: 'badge-blue',
  Gold: 'badge-yellow',
  Silver: 'badge-gray',
  Bronze: 'badge-orange',
};

export default function SmartProtect({ data, onNext, onBack }) {
  return (
    <>
      <div className="screen-header">
        <h1>SmartProtect Configuration</h1>
        <p>Automated, policy-driven backup protection based on data classification.</p>
      </div>

      <div className="card">
        <div className="card-title">Protection Rules</div>
        <div className="card-subtitle">
          SmartProtect maps data classifications to appropriate backup policies automatically.
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Rule Name</th>
              <th>Data Class</th>
              <th>Sensitivity</th>
              <th>Exposure</th>
              <th>Policy</th>
              <th>Objects</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map(rule => (
              <tr key={rule.id}>
                <td><span className="badge badge-blue">{rule.priority}</span></td>
                <td>{rule.rule_name}</td>
                <td>{rule.conditions.data_class}</td>
                <td>{rule.conditions.data_sensitivity}</td>
                <td>{rule.conditions.exposure}</td>
                <td>
                  <span className={`badge ${POLICY_COLORS[rule.assigned_policy] || 'badge-gray'}`}>
                    {rule.assigned_policy}
                  </span>
                </td>
                <td>{rule.objects_matched.toLocaleString()}</td>
                <td>
                  <span className={`badge ${rule.enabled ? 'badge-green' : 'badge-red'}`}>
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="btn-group">
        <button className="btn btn-secondary" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={onNext}>Continue</button>
      </div>
    </>
  );
}
