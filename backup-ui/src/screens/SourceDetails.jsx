export default function SourceDetails({ data, onSubmit }) {
  const opts = data.import_options;

  return (
    <>
      <div className="screen-header">
        <h1>Select Source — Details</h1>
        <p>Provide source credentials and configure discovery options.</p>
      </div>

      <div className="card">
        <div className="card-title">Source Details</div>

        <div className="form-group">
          <label>Source Type</label>
          <select className="form-select" defaultValue={data.source_type || 'Azure Subscription'}>
            <option>Azure Subscription</option>
            <option>Azure Management Group</option>
            <option>Azure Tenant</option>
          </select>
        </div>

        <div className="form-group">
          <label>Azure Subscription ID</label>
          <input className="form-input" defaultValue={data.organization_id} />
        </div>
      </div>

      <div className="card">
        <div className="card-title">Import Context and Tags</div>

        <div className="checkbox-group" style={{ marginTop: 12 }}>
          <label className="checkbox-item">
            <input type="checkbox" defaultChecked={opts.application_and_workload_discovery} />
            Application and workload discovery
          </label>
          <label className="checkbox-item">
            <input type="checkbox" defaultChecked={opts.import_existing_tags} />
            Import existing tags from cloud providers
          </label>
          <label className="checkbox-item">
            <input type="checkbox" defaultChecked={opts.import_resource_metadata} />
            Import resource metadata
          </label>
          <label className="checkbox-item">
            <input type="checkbox" defaultChecked={opts.enable_identity_and_access_discovery} />
            Enable identity and access discovery
          </label>
        </div>
      </div>

      <div className="btn-group">
        <button className="btn btn-secondary">Cancel</button>
        <button className="btn btn-primary" onClick={() => onSubmit({ action: 'start_discovery' })}>Start Discovery</button>
      </div>
    </>
  );
}
