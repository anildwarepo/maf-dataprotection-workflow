const POLICY_COLORS = {
  Diamond: 'badge-purple', Platinum: 'badge-blue', Gold: 'badge-yellow',
  Silver: 'badge-gray', Bronze: 'badge-orange',
};

const PROTECTION_COLORS = {
  Unprotected: 'badge-red',
  Protected: 'badge-green',
  'Partially Protected': 'badge-yellow',
};

export default function ProtectionAdvisorScreen({ data, onSubmit }) {
  const rules = data.smartprotect_rules || [];
  const tm = data.threat_monitoring?.threat_monitoring || data.threat_monitoring || {};
  const ro = data.resilience_orchestration || data.threat_monitoring?.resilience_orchestration || {};
  const apps = data.inventory_applications || [];
  const caps = data.enabled_capabilities || [];
  const showSmartProtect = rules.length > 0;
  const showThreat = Object.keys(tm).length > 0 && tm.scan_engine;
  const showResilience = ro.enabled !== undefined;
  const showApps = apps.length > 0;

  return (
    <>
      <div className="screen-header">
        <div className="breadcrumb">Protection Advisor &gt; <span>AI Recommendations</span></div>
        <h1>🤖 Protection Advisor</h1>
        <p>AI recommendations based on your selected capabilities{caps.length > 0 && `: ${caps.join(', ')}`}.</p>
      </div>

      {/* SmartProtect Rules */}
      {showSmartProtect && (
      <div className="card">
        <div className="card-title">SmartProtect Rules</div>
        <div className="card-subtitle">The following rules will be enabled based on data classification.</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Rule Name</th>
              <th>Data Class</th>
              <th>Sensitivity</th>
              <th>Policy</th>
              <th>Objects</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(rule => (
              <tr key={rule.id}>
                <td><span className="badge badge-blue">{rule.priority}</span></td>
                <td>{rule.rule_name}</td>
                <td>{rule.conditions?.data_class}</td>
                <td>{rule.conditions?.data_sensitivity}</td>
                <td>
                  <span className={`badge ${POLICY_COLORS[rule.assigned_policy] || 'badge-gray'}`}>
                    {rule.assigned_policy}
                  </span>
                </td>
                <td>{rule.objects_matched?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Threat Monitoring */}
      {showThreat && (
      <div className="card">
        <div className="card-title">🔍 Threat Monitoring Configuration</div>
        <div className="config-section">
          <div className="config-row">
            <span className="label">Scan Engine</span>
            <span className="value">{tm.scan_engine || 'YARA + HASH'}</span>
          </div>
          <div className="config-row">
            <span className="label">Libraries</span>
            <span className="value">
              <div className="badge-row">
                {(tm.libraries || []).map(l => <span key={l} className="badge badge-blue">{l}</span>)}
              </div>
            </span>
          </div>
          <div className="config-row">
            <span className="label">Scan Frequency</span>
            <span className="value">{tm.scan_frequency || 'Every snapshot'}</span>
          </div>
          <div className="config-row">
            <span className="label">IoC Detection Target</span>
            <span className="value">{tm.ioc_detection_target_minutes || 10} minutes</span>
          </div>
        </div>
      </div>
      )}

      {/* Resilience Orchestration */}
      {showResilience && (
        <div className="card">
          <div className="card-title">🛡️ Resilience Orchestration</div>
          <div className="config-section">
            <div className="config-row">
              <span className="label">Auto Containment</span>
              <span className="value">
                <span className={`badge ${ro.auto_containment ? 'badge-green' : 'badge-gray'}`}>
                  {ro.auto_containment ? 'Enabled' : 'Disabled'}
                </span>
              </span>
            </div>
            <div className="config-row">
              <span className="label">Cleanroom Provider</span>
              <span className="value">{ro.cleanroom_provider}</span>
            </div>
            <div className="config-row">
              <span className="label">Evidence Preservation</span>
              <span className="value">
                <span className={`badge ${ro.evidence_preservation ? 'badge-green' : 'badge-gray'}`}>
                  {ro.evidence_preservation ? 'Enabled' : 'Disabled'}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Applications (from MCP server) */}
      {showApps && (
        <div className="card">
          <div className="card-title">📦 Discovered Applications</div>
          <div className="card-subtitle">Applications discovered from the inventory via MCP server.</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Application Group</th>
                <th>Objects</th>
                <th>Data Classes</th>
                <th>Protection Status</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => {
                const breakdown = app.protection_breakdown || {};
                return (
                  <tr key={app.application_group}>
                    <td style={{ fontWeight: 600 }}>🔧 {app.application_group}</td>
                    <td>{app.object_count}</td>
                    <td>
                      <div className="badge-row">
                        {(app.data_classes || []).map(c => (
                          <span key={c} className="badge badge-blue" style={{ fontSize: 10 }}>{c}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="badge-row">
                        {Object.entries(breakdown).map(([status, count]) => (
                          <span key={status} className={`badge ${PROTECTION_COLORS[status] || 'badge-gray'}`} style={{ fontSize: 10 }}>
                            {status}: {count}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="btn-group">
        <button className="btn btn-primary" onClick={() => onSubmit({ action: 'continue' })}>
          Confirm &amp; Continue
        </button>
      </div>
    </>
  );
}
