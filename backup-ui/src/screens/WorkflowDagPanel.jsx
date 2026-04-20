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

// Dimmed version for inactive nodes
const INACTIVE_OPACITY = '0.35';

// CSS for animated flowing edges and active node glow
const ANIMATED_EDGE_CSS = `
@keyframes flowdash {
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
}
@keyframes glow-pulse {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(88,166,255,0.5)); }
  50% { filter: drop-shadow(0 0 12px rgba(88,166,255,0.9)); }
}
.active-node > rect, .active-node > polygon, .active-node > circle {
  animation: glow-pulse 1.5s ease-in-out infinite;
}
`;

// DAG edge definitions with index: source → target (matches workflow DAG & Mermaid link order)
const EDGES = [
  ['source_selector', 'source_configurator'],       // linkStyle 0
  ['source_configurator', 'discovery_runner'],       // linkStyle 1
  ['discovery_runner', 'protection_advisor'],        // linkStyle 2
  ['protection_advisor', 'resiliency_planner'],      // linkStyle 3
  ['resiliency_planner', 'approval_gateway'],        // linkStyle 4
  ['approval_gateway', 'protection_advisor'],        // linkStyle 5
];

function buildStyledMermaid(mermaidStr, activeExecutor, completedExecutors) {
  const lines = [mermaidStr.trimEnd()];

  // Node styles
  for (const [node, colors] of Object.entries(NODE_COLORS)) {
    const isActive = node === activeExecutor;
    const isCompleted = completedExecutors?.includes(node);
    const opacity = (isActive || isCompleted || !activeExecutor) ? '1' : INACTIVE_OPACITY;
    const strokeWidth = isActive ? '3px' : '2px';
    lines.push(`  style ${node} fill:${colors.fill},stroke:${colors.stroke},color:${colors.text},stroke-width:${strokeWidth},opacity:${opacity}`);
  }

  // Animate edges leading INTO the active executor using linkStyle
  if (activeExecutor) {
    EDGES.forEach(([src, tgt], idx) => {
      if (tgt === activeExecutor) {
        lines.push(`  linkStyle ${idx} stroke:#58a6ff,stroke-width:3px,stroke-dasharray:8 4`);
      }
    });
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
    fontSize: '11px',
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

/**
 * Inline DAG visualization panel for the AgentPanel sidebar.
 * Shows the workflow graph with the active executor highlighted and animated arrows.
 */
export default function WorkflowDagPanel({ activeExecutor, completedExecutors }) {
  const [mermaidCode, setMermaidCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const renderCounter = useRef(0);

  useEffect(() => {
    const fetchDiagram = async () => {
      try {
        const res = await fetch(`${API_URL}/api/workflow/visualization`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMermaidCode(data.mermaid);
      } catch (e) {
        setError(`Failed to load: ${e.message}`);
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
      renderCounter.current += 1;
      const id = `dag-${renderCounter.current}-${Date.now()}`;
      const styled = buildStyledMermaid(mermaidCode, activeExecutor, completedExecutors);
      const { svg } = await mermaid.render(id, styled);
      containerRef.current.innerHTML = svg;

      // Inject animated edge CSS
      const svgEl = containerRef.current.querySelector('svg');
      if (svgEl) {
        svgEl.style.maxWidth = '100%';
        svgEl.style.height = 'auto';
        svgEl.style.width = 'auto';

        // Add animation stylesheet
        const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleEl.textContent = ANIMATED_EDGE_CSS;
        svgEl.prepend(styleEl);

        if (activeExecutor) {
          // Find edge indices: incoming to active node + outgoing from active node
          const activeEdgeIndices = [];
          EDGES.forEach(([src, tgt], idx) => {
            if (tgt === activeExecutor || src === activeExecutor) {
              activeEdgeIndices.push(idx);
            }
          });

          // Collect all arrow paths — Mermaid uses marker-end for arrowheads
          const pathList = Array.from(svgEl.querySelectorAll('path[marker-end]'));

          activeEdgeIndices.forEach(idx => {
            const path = pathList[idx];
            if (path) {
              path.setAttribute('stroke', '#58a6ff');
              path.setAttribute('stroke-width', '3');
              path.setAttribute('stroke-dasharray', '10 5');
              path.style.animation = 'flowdash 0.5s linear infinite';
            }
          });

          // Add glow to active node
          svgEl.querySelectorAll('.node').forEach(node => {
            const label = node.textContent || '';
            if (label.includes(activeExecutor)) {
              node.classList.add('active-node');
            }
          });
        }
      }
    } catch (e) {
      setError(`Render failed: ${e.message}`);
    }
  }, [mermaidCode, activeExecutor, completedExecutors]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#8b949e' }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>⟳</div>
        <p style={{ fontSize: 12 }}>Loading DAG...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center', padding: 20, color: '#f85149',
        background: 'rgba(218,54,51,.1)', borderRadius: 6, margin: 8,
        fontSize: 11,
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        ref={containerRef}
        style={{
          flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
          padding: 8, overflow: 'auto',
        }}
      />
      {/* Legend */}
      <div style={{
        padding: '8px 12px', borderTop: '1px solid #21262d',
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {activeExecutor && (
          <span style={{ fontSize: 10, color: '#58a6ff' }}>
            ● {activeExecutor.replace(/_/g, ' ')}
          </span>
        )}
        <span style={{ fontSize: 9, color: '#484f58' }}>
          WorkflowViz · Mermaid
        </span>
      </div>
    </div>
  );
}
