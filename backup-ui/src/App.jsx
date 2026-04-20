import { useState, useEffect, useRef } from 'react';
import SelectSource from './screens/SelectSource';
import SourceDetails from './screens/SourceDetails';
import DataDiscovered from './screens/DataDiscovered';
import ProtectionAdvisorScreen from './screens/ProtectionAdvisorScreen';
import ResiliencyPlanScreen from './screens/ResiliencyPlanScreen';
import FinalApprovalScreen from './screens/FinalApprovalScreen';
import WorkflowDagPanel from './screens/WorkflowDagPanel';

const API_URL = 'http://localhost:8000';

const SCREEN_COMPONENTS = {
  select_source: SelectSource,
  source_details: SourceDetails,
  data_discovered: DataDiscovered,
  protection_advisor: ProtectionAdvisorScreen,
  resiliency_plan: ResiliencyPlanScreen,
  final_approval: FinalApprovalScreen,
};

const SCREEN_LABELS = {
  select_source: 'Select Source',
  source_details: 'Source Details',
  data_discovered: 'Data Discovery',
  protection_advisor: 'Protection Advisor',
  resiliency_plan: 'Resiliency Plan',
  final_approval: 'Final Approval',
};

const SCREEN_ICONS = {
  select_source: '☁️',
  source_details: '⚙️',
  data_discovered: '🔍',
  protection_advisor: '🤖',
  resiliency_plan: '🛡️',
  final_approval: '✅',
};

// Map screen names to executor IDs for DAG highlighting
const SCREEN_TO_EXECUTOR = {
  select_source: 'source_selector',
  source_details: 'source_configurator',
  data_discovered: 'discovery_runner',
  protection_advisor: 'protection_advisor',
  resiliency_plan: 'resiliency_planner',
  final_approval: 'approval_gateway',
};

function parseState(s) {
  if (!s || typeof s !== 'string') return null;
  const m = s.match(/state=(\w+)/);
  return m ? m[1] : null;
}

function AgentPanel({ agentLog, message, step, loading, activeExecutor, completedExecutors }) {
  const logEndRef = useRef(null);
  const [tab, setTab] = useState('dag');
  useEffect(() => { if (tab === 'logs') logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [agentLog, tab]);

  const tabStyle = (active) => ({
    flex: 1, padding: '8px 0', fontSize: 11, fontWeight: 600, cursor: 'pointer',
    background: 'transparent', border: 'none', borderBottom: active ? '2px solid #58a6ff' : '2px solid transparent',
    color: active ? '#58a6ff' : '#6e7681', transition: 'all 0.15s',
  });

  return (
    <aside className="agent-panel">
      <div className="agent-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🤖</span>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', margin: 0 }}>Agent Orchestration</h3>
        </div>
        {loading && <span className="badge badge-blue" style={{ fontSize: 10 }}>● Live</span>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #21262d' }}>
        <button style={tabStyle(tab === 'dag')} onClick={() => setTab('dag')}>🔀 DAG</button>
        <button style={tabStyle(tab === 'logs')} onClick={() => setTab('logs')}>📋 Logs</button>
      </div>

      {/* DAG Tab */}
      {tab === 'dag' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <WorkflowDagPanel activeExecutor={activeExecutor} completedExecutors={completedExecutors} />
        </div>
      )}

      {/* Logs Tab */}
      {tab === 'logs' && (
        <>
          {message && (
            <div className="agent-msg-card">
              <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>Current Step {step}/6</div>
              <div style={{ fontSize: 13, color: '#58a6ff', lineHeight: 1.5 }}>{message}</div>
            </div>
          )}
          <div className="agent-log-list">
            {agentLog.map((entry, i) => (
              <div key={i} className="agent-log-entry">
                <div className="agent-log-icon">
                  {entry.kind === 'screen' ? '📺' : entry.kind === 'submit' ? '↑' : entry.kind === 'complete' ? '✅' : entry.kind === 'mcp' ? '🔌' : entry.kind === 'executor' ? '⚙️' : '⚡'}
                </div>
                <div className="agent-log-body">
                  <div className="agent-log-title">{entry.title}</div>
                  {entry.detail && <div className="agent-log-detail">{entry.detail}</div>}
                  <div className="agent-log-time">{entry.time}</div>
                </div>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </>
      )}
    </aside>
  );
}

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [currentScreen, setCurrentScreen] = useState(null);
  const [screenData, setScreenData] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [agentLog, setAgentLog] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeExecutor, setActiveExecutor] = useState(null);
  const [completedExecutors, setCompletedExecutors] = useState([]);
  const eventSourceRef = useRef(null);

  const ts = () => new Date().toLocaleTimeString();

  const addLog = (entry) => setAgentLog(log => [...log, { ...entry, time: ts() }]);

  const [resumeSource, setResumeSource] = useState(null);

  // Check for active session on mount (in-memory or persisted checkpoint)
  useEffect(() => {
    const checkActive = async () => {
      try {
        const res = await fetch(`${API_URL}/api/sessions/active`);
        if (res.ok) {
          const data = await res.json();
          if (data.has_active) {
            setActiveSession(data.session_id);
            setResumeSource(data.source); // 'memory' or 'checkpoint'
          }
        }
      } catch {}
      setCheckingSession(false);
    };
    checkActive();
  }, []);

  const resumeWorkflow = async () => {
    setLoading(true);
    setError(null);
    // Close any existing SSE connection from a previous attempt
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    addLog({ kind: 'status', title: 'Resuming workflow', detail: `Source: ${resumeSource || 'auto'}` });
    try {
      let res;
      if (activeSession) {
        // Try in-memory session first (server still running, tab was closed)
        res = await fetch(`${API_URL}/api/sessions/${activeSession}/resume`, { method: 'POST' });
      }
      if (!activeSession || (res && !res.ok)) {
        // Fall back to checkpoint-based resume (survives server restart)
        res = await fetch(`${API_URL}/api/sessions/resume`, { method: 'POST' });
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { session_id } = await res.json();
      setSessionId(session_id);
      connectSSE(session_id);
    } catch (err) {
      setError('Failed to resume workflow.');
      setLoading(false);
    }
  };

  const startWorkflow = async () => {
    setLoading(true);
    setError(null);
    console.log('[APP] Starting workflow...');
    addLog({ kind: 'status', title: 'Workflow started', detail: 'Initializing session...' });
    try {
      const res = await fetch(`${API_URL}/api/sessions`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { session_id } = await res.json();
      console.log('[APP] Session created:', session_id);
      setSessionId(session_id);
      addLog({ kind: 'status', title: 'Session created', detail: `ID: ${session_id.slice(0,8)}…` });
      connectSSE(session_id);
    } catch (err) {
      setError('Failed to start workflow. Is the backend running on port 8000?');
      setLoading(false);
    }
  };

  const connectSSE = (sid) => {
    // Close any existing SSE connection before opening a new one
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    console.log('[SSE] Connecting to', `${API_URL}/api/sessions/${sid}/events`);
    const es = new EventSource(`${API_URL}/api/sessions/${sid}/events`);
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log('[SSE] Connection opened');
    };

    es.onmessage = (e) => {
      const event = JSON.parse(e.data);
      console.log('[SSE] Event received:', event.type, event.screen || '');
      if (event.type === 'heartbeat') return;
      if (event.type === 'screen') {
        setCurrentScreen(event.screen);
        setScreenData(event.data);
        setRequestId(event.request_id);
        setMessage(event.message || '');
        setStep(event.step || 0);
        setLoading(false);
        // Track active executor from screen name
        const executor = SCREEN_TO_EXECUTOR[event.screen];
        if (executor) {
          setActiveExecutor(executor);
        }
        setHistory(h => {
          const last = h[h.length - 1];
          if (last === event.screen) return h;
          return [...h, event.screen];
        });
        addLog({
          kind: 'screen',
          title: `Screen: ${SCREEN_LABELS[event.screen] || event.screen}`,
          detail: event.message,
        });
      } else if (event.type === 'tool_call') {
        const icon = event.status === 'calling' ? '→' : event.status === 'success' ? '✓' : '✗';
        addLog({
          kind: 'mcp',
          title: `MCP Tool: ${event.tool}`,
          detail: `${icon} ${event.server} — ${event.status}${event.error ? ` (${event.error})` : ''}`,
        });
      } else if (event.type === 'status') {
        const executor = event.executor;
        const state = event.state || parseState(event.data);
        if (executor) {
          const label = executor.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          addLog({
            kind: 'executor',
            title: `Executor: ${label}`,
            detail: state ? state.replace(/_/g, ' ') : null,
          });
        } else if (state) {
          addLog({
            kind: 'status',
            title: `Workflow ${state.replace(/_/g, ' ').toLowerCase()}`,
            detail: null,
          });
        }
      } else if (event.type === 'completed') {
        setCompleted(true);
        setResult(event.data);
        setLoading(false);
        addLog({ kind: 'complete', title: 'Workflow completed', detail: 'Policy created successfully' });
        es.close();
      } else if (event.type === 'error') {
        setError(event.data);
        setLoading(false);
        addLog({ kind: 'status', title: 'Error', detail: event.data });
        es.close();
      }
    };

    es.onerror = (err) => {
      console.error('[SSE] Error:', err, 'readyState:', es.readyState);
      if (!completed) {
        setError('Lost connection to server.');
      }
      setLoading(false);
    };
  };

  const submitResponse = async (responseData) => {
    if (!sessionId || !requestId) return;
    setLoading(true);
    setError(null);
    addLog({
      kind: 'submit',
      title: `User response sent`,
      detail: responseData.action || 'continue',
    });
    // Mark the current executor as completed when user submits
    if (activeExecutor) {
      setCompletedExecutors(prev => prev.includes(activeExecutor) ? prev : [...prev, activeExecutor]);
      setActiveExecutor(null);
    }
    try {
      const res = await fetch(`${API_URL}/api/sessions/${sessionId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          response: JSON.stringify(responseData),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      setError('Failed to send response to server.');
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  // ── Landing screen ──
  if (!sessionId) {
    return (
      <div className="app-layout">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⛨</div>
            <h1 style={{ fontSize: 28, marginBottom: 8, color: '#e6edf3' }}>Backup &amp; Resiliency</h1>
            <p style={{ color: '#8b949e', marginBottom: 8, lineHeight: 1.6 }}>
              AI-Powered Backup Policy Configuration Wizard
            </p>
            <p style={{ color: '#6e7681', marginBottom: 32, fontSize: 13 }}>
              This workflow uses Microsoft Agent Framework with human-in-the-loop
              to guide you through configuring a backup protection policy with
              AI-recommended protection rules and resiliency plans.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ fontSize: 16, padding: '14px 40px' }}
                onClick={startWorkflow}
                disabled={loading || checkingSession}
              >
                {loading ? '⟳ Starting...' : 'Start Workflow'}
              </button>
              {(activeSession || resumeSource === 'checkpoint') && (
                <button
                  className="btn"
                  style={{
                    fontSize: 16, padding: '14px 40px',
                    background: '#238636', border: '1px solid #2ea043', color: '#fff',
                    borderRadius: 8, cursor: 'pointer',
                  }}
                  onClick={resumeWorkflow}
                  disabled={loading}
                >
                  Resume In-Progress
                </button>
              )}
            </div>
            {error && <p style={{ color: '#f85149', marginTop: 16 }}>{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ── Completed screen ──
  if (completed) {
    let parsedResult = result;
    try { parsedResult = JSON.parse(result); } catch {}

    return (
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>⛨ Backup &amp; Resiliency</h2>
            <p>Configuration Complete</p>
          </div>
          <nav className="sidebar-nav">
            {history.map((s, i) => (
              <div key={i} className="sidebar-item completed">
                <span className="step-num">✓</span>
                {SCREEN_LABELS[s] || s}
              </div>
            ))}
          </nav>
        </aside>
        <main className="main-content">
          <div className="screen-header">
            <h1>✅ Backup Policy Created</h1>
            <p>The backup protection policy has been successfully created and applied.</p>
          </div>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-value">{parsedResult?.rules?.length || 0}</div>
              <div className="stat-label">Protection Rules</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{parsedResult?.backup_policies?.length || 0}</div>
              <div className="stat-label">Backup Policies</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{parsedResult?.iteration || 1}</div>
              <div className="stat-label">Iterations</div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">Final Policy (JSON)</div>
            <pre style={{
              background: '#0d1117', padding: 16, borderRadius: 8, overflow: 'auto',
              color: '#c9d1d9', fontSize: 12, border: '1px solid #30363d', maxHeight: 500,
            }}>
              {JSON.stringify(parsedResult, null, 2)}
            </pre>
          </div>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Start New Workflow
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Active workflow ──
  const Component = SCREEN_COMPONENTS[currentScreen];
  const screenKeys = Object.keys(SCREEN_LABELS);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>⛨ Backup &amp; Resiliency</h2>
          <p>Configuration Wizard</p>
        </div>
        <nav className="sidebar-nav">
          {screenKeys.map((key, i) => {
            const isActive = key === currentScreen;
            const isCompleted = history.includes(key) && !isActive;
            return (
              <div
                key={key}
                className={`sidebar-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <span className="step-num">
                  {isCompleted ? '✓' : SCREEN_ICONS[key] || i + 1}
                </span>
                {SCREEN_LABELS[key]}
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="main-content">
        {loading && !Component && (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⟳</div>
            <p style={{ color: '#8b949e', fontSize: 15 }}>Agent is processing...</p>
          </div>
        )}

        {Component && <Component data={screenData} onSubmit={submitResponse} />}

        {loading && Component && (
          <div style={{
            position: 'fixed', bottom: 20, right: 340,
            background: '#161b22', border: '1px solid #30363d', borderRadius: 8,
            padding: '10px 20px', fontSize: 13, color: '#58a6ff', zIndex: 10,
          }}>
            ⟳ Agent is processing...
          </div>
        )}

        {error && (
          <div style={{
            position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(218,54,51,.15)', border: '1px solid rgba(218,54,51,.4)',
            borderRadius: 8, padding: '10px 20px', fontSize: 13, color: '#f85149', zIndex: 10,
          }}>
            {error}
          </div>
        )}
      </main>

      <AgentPanel
        agentLog={agentLog} message={message} step={step} loading={loading}
        activeExecutor={activeExecutor} completedExecutors={completedExecutors}
      />
    </div>
  );
}
