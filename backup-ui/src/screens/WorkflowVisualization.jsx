import { useState, useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';

const API_URL = 'http://localhost:8000';

// Consistent color per executor node
const NODE_COLORS = {
  source_selector:    { fill: '#2563EB', stroke: '#1d4ed8', text: '#fff' },
  source_configurator:{ fill: '#7C3AED', stroke: '#6d28d9', text: '#fff' },
  discovery_runner:   { fill: '#059669', stroke: '#047857', text: '#fff' },
  protection_advisor: { fill: '#D97706', stroke: '#b45309', text: '#fff' },
  resiliency_planner: { fill: '#DC2626', stroke: '#b91c1c', text: '#fff' },
  approval_gateway:   { fill: '#0891B2', stroke: '#0e7490', text: '#fff' },
};

function addNodeStyles(mermaidStr) {
  // Append style directives for each known node
  const lines = [mermaidStr.trimEnd()];
  for (const [node, colors] of Object.entries(NODE_COLORS)) {
    lines.push(`  style ${node} fill:${colors.fill},stroke:${colors.stroke},color:${colors.text},stroke-width:2px`);
  }
  return lines.join('\n');
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#2563EB',
    primaryTextColor: '#e6edf3',
    primaryBorderColor: '#3b82f6',
    lineColor: '#58a6ff',
    secondaryColor: '#7C3AED',
    tertiaryColor: '#1e293b',
    fontFamily: 'Segoe UI, Arial, sans-serif',
    fontSize: '12px',
    nodeBorder: '#3b82f6',
    mainBkg: '#2563EB',
    clusterBkg: '#161b2211',
    clusterBorder: '#30363d',
    edgeLabelBackground: '#0d1117',
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    padding: 8,
    nodeSpacing: 20,
    rankSpacing: 30,
    useMaxWidth: true,
  },
});

export default function WorkflowVisualization({ onClose }) {
  const [mermaidCode, setMermaidCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchDiagram = async () => {
      try {
        const res = await fetch(`${API_URL}/api/workflow/visualization`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMermaidCode(data.mermaid);
      } catch (e) {
        setError(`Failed to load workflow diagram: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDiagram();
  }, []);

  const renderDiagram = useCallback(async () => {
    if (!mermaidCode || !containerRef.current) return;
    try {
      containerRef.current.innerHTML = '';
      const id = `mermaid-${Date.now()}`;
      const styled = addNodeStyles(mermaidCode);
      const { svg } = await mermaid.render(id, styled);
      containerRef.current.innerHTML = svg;

      // Make the rendered SVG responsive and fit within the modal
      const svgEl = containerRef.current.querySelector('svg');
      if (svgEl) {
        svgEl.style.maxWidth = '100%';
        svgEl.style.maxHeight = '60vh';
        svgEl.style.height = 'auto';
        svgEl.style.width = 'auto';
      }
    } catch (e) {
      setError(`Failed to render diagram: ${e.message}`);
    }
  }, [mermaidCode]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#0d1117', border: '1px solid #30363d', borderRadius: 12,
        width: '90vw', maxWidth: 1200, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid #30363d',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔀</span>
            <h2 style={{ margin: 0, fontSize: 16, color: '#e6edf3', fontWeight: 600 }}>
              Workflow DAG Visualization
            </h2>
            <span style={{
              fontSize: 11, background: '#1f6feb22', color: '#58a6ff',
              padding: '2px 8px', borderRadius: 10, border: '1px solid #1f6feb44',
            }}>
              WorkflowViz · Mermaid
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowCode(c => !c)}
              style={{
                background: showCode ? '#1f6feb' : '#21262d', border: '1px solid #30363d',
                color: '#e6edf3', borderRadius: 6, padding: '6px 14px',
                cursor: 'pointer', fontSize: 12,
              }}
            >
              {showCode ? '🎨 Diagram' : '{ } Code'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#21262d', border: '1px solid #30363d',
                color: '#e6edf3', borderRadius: 6, padding: '6px 14px',
                cursor: 'pointer', fontSize: 14,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 60, color: '#8b949e' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⟳</div>
              <p>Loading workflow diagram...</p>
            </div>
          )}

          {error && (
            <div style={{
              textAlign: 'center', padding: 40, color: '#f85149',
              background: 'rgba(218,54,51,.1)', borderRadius: 8,
            }}>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && showCode && (
            <pre style={{
              background: '#161b22', padding: 20, borderRadius: 8,
              color: '#c9d1d9', fontSize: 12, overflow: 'auto',
              border: '1px solid #30363d', lineHeight: 1.6,
            }}>
              {mermaidCode}
            </pre>
          )}

          {!loading && !error && !showCode && (
            <div
              ref={containerRef}
              style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                minHeight: 300, padding: 16,
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px', borderTop: '1px solid #30363d',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, color: '#6e7681' }}>
            Generated by Microsoft Agent Framework · WorkflowViz.to_mermaid()
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                if (mermaidCode) {
                  navigator.clipboard.writeText(mermaidCode);
                }
              }}
              style={{
                background: '#21262d', border: '1px solid #30363d',
                color: '#8b949e', borderRadius: 6, padding: '6px 14px',
                cursor: 'pointer', fontSize: 11,
              }}
            >
              📋 Copy Mermaid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
