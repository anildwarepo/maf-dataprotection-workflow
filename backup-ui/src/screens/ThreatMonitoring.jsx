export default function ThreatMonitoring({ data, onNext, onBack }) {
  const tm = data.threat_monitoring;
  const ro = data.resilience_orchestration;

  return (
    <>
      <div className="screen-header">
        <h1>Threat Monitoring &amp; Resilience Orchestration</h1>
        <p>Configure always-on threat scanning and automated recovery workflows.</p>
      </div>

      {/* Threat Monitoring */}
      <div className="card">
        <div className="card-title">🔍 Always-On Threat Monitoring</div>

        <div className="config-section">
          <div className="config-row">
            <span className="label">Status</span>
            <span className="value">
              <span className={`badge ${tm.enabled ? 'badge-green' : 'badge-red'}`}>
                {tm.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </span>
          </div>
          <div className="config-row">
            <span className="label">Scan Engine</span>
            <span className="value">{tm.scan_engine}</span>
          </div>
          <div className="config-row">
            <span className="label">Libraries</span>
            <span className="value">
              <div className="badge-row">
                {tm.libraries.map(l => <span key={l} className="badge badge-blue">{l}</span>)}
              </div>
            </span>
          </div>
          <div className="config-row">
            <span className="label">Scan Frequency</span>
            <span className="value">{tm.scan_frequency}</span>
          </div>
          <div className="config-row">
            <span className="label">IoC Detection Target</span>
            <span className="value">{tm.ioc_detection_target_minutes} minutes</span>
          </div>
          <div className="config-row">
            <span className="label">Alert Channels</span>
            <span className="value">
              <div className="badge-row">
                {tm.alerting.channels.map(c => <span key={c} className="badge badge-purple">{c}</span>)}
              </div>
            </span>
          </div>
          <div className="config-row">
            <span className="label">Severity Threshold</span>
            <span className="value">
              <span className={`badge ${tm.alerting.severity_threshold === 'Critical' ? 'badge-red' : tm.alerting.severity_threshold === 'High' ? 'badge-orange' : 'badge-yellow'}`}>
                {tm.alerting.severity_threshold}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Resilience Orchestration */}
      <div className="card">
        <div className="card-title">🛡️ Application Resilience Orchestration</div>

        <div className="config-section">
          <div className="config-row">
            <span className="label">Status</span>
            <span className="value">
              <span className={`badge ${ro.enabled ? 'badge-green' : 'badge-red'}`}>
                {ro.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </span>
          </div>
          <div className="config-row">
            <span className="label">Auto Containment</span>
            <span className="value">
              <span className={`badge ${ro.auto_containment ? 'badge-green' : 'badge-gray'}`}>
                {ro.auto_containment ? 'Yes' : 'No'}
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
          <div className="config-row">
            <span className="label">Chain of Custody</span>
            <span className="value">
              <span className={`badge ${ro.chain_of_custody ? 'badge-green' : 'badge-gray'}`}>
                {ro.chain_of_custody ? 'Enabled' : 'Disabled'}
              </span>
            </span>
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
