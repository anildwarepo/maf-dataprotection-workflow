import { useState } from 'react';

const ICONS = {
  AWS: '☁️', Azure: '🔷', GCP: '🟡',
  'Microsoft 365': '📧', 'Google Workspace': '📊', Others: '🔌',
};

export default function SelectSource({ data, onSubmit }) {
  const [sources, setSources] = useState(data?.sources || data);

  const select = (id) => {
    setSources(sources.map(s => ({ ...s, selected: s.id === id })));
  };

  const selected = sources.find(s => s.selected);
  const cloud = sources.filter(s => s.category === 'Cloud Platform');
  const saas = sources.filter(s => s.category === 'SaaS Source');

  return (
    <>
      <div className="screen-header">
        <h1>Select Source</h1>
        <p>Choose the cloud platform or SaaS source you want to protect.</p>
      </div>

      <div className="card">
        <div className="card-title">SaaS Sources</div>
        <div className="tile-grid">
          {saas.map(s => (
            <div key={s.id} className={`tile ${s.selected ? 'selected' : ''}`} onClick={() => select(s.id)}>
              <div className="tile-icon">{ICONS[s.name] || '📦'}</div>
              <div className="tile-name">{s.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Cloud Platforms</div>
        <div className="tile-grid">
          {cloud.map(s => (
            <div key={s.id} className={`tile ${s.selected ? 'selected' : ''}`} onClick={() => select(s.id)}>
              <div className="tile-icon">{ICONS[s.name] || '☁️'}</div>
              <div className="tile-name">{s.name}</div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="info-panel">
          <h4>To register a {selected.name} source, you need:</h4>
          <ul>
            <li>{selected.requires.credentials}</li>
            {selected.requires.template && <li>{selected.requires.template} to execute in your {selected.name} account</li>}
          </ul>
          <a href="#">Learn more</a>
        </div>
      )}

      <div className="btn-group">
        <button className="btn btn-secondary">Cancel</button>
        <button className="btn btn-primary" onClick={() => onSubmit({ platform: selected?.name || 'AWS' })}>Continue</button>
      </div>
    </>
  );
}
