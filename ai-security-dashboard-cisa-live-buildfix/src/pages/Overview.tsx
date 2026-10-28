/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Server,
  Activity,
  Crosshair,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Filter,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { DataCard } from '../components/common/DataCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { NoticeBanner } from '../components/common/NoticeBanner';
import { SeverityLevel } from '../types';

export const Overview: React.FC = () => {
  const { alerts, assets, scans, activityLogs, openAlertModal } = useSecurity();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('all');

  // Key metrics
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status !== 'resolved').length;
  const highCount = alerts.filter((a) => a.severity === 'high' && a.status !== 'resolved').length;
  const openIncidents = alerts.filter((a) => a.status === 'new' || a.status === 'investigating').length;
  const compromisedAssets = assets.filter((a) => a.status === 'compromised' || a.status === 'quarantined').length;
  const avgRiskScore = scans.length > 0
    ? Math.round(scans.reduce((acc, s) => acc + s.riskScore, 0) / scans.length)
    : 0;

  // Filtered alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (selectedSeverityFilter === 'all') return true;
    return alert.severity === selectedSeverityFilter;
  });

  // Time-series mock data representing hourly alert spikes based on selected range
  const timeSeriesPoints = {
    '1h': [
      { label: '10:00', critical: 0, high: 1, medium: 2 },
      { label: '10:15', critical: 1, high: 2, medium: 1 },
      { label: '10:30', critical: 2, high: 3, medium: 2 },
      { label: '10:45', critical: 1, high: 1, medium: 4 },
      { label: '11:00', critical: 2, high: 2, medium: 3 },
    ],
    '24h': [
      { label: '00:00', critical: 0, high: 1, medium: 3 },
      { label: '04:00', critical: 1, high: 0, medium: 2 },
      { label: '08:00', critical: 2, high: 3, medium: 5 },
      { label: '12:00', critical: 3, high: 4, medium: 6 },
      { label: '16:00', critical: 1, high: 2, medium: 4 },
      { label: '20:00', critical: 2, high: 2, medium: 3 },
    ],
    '7d': [
      { label: 'Mon', critical: 4, high: 8, medium: 14 },
      { label: 'Tue', critical: 6, high: 11, medium: 19 },
      { label: 'Wed', critical: 2, high: 7, medium: 12 },
      { label: 'Thu', critical: 5, high: 9, medium: 16 },
      { label: 'Fri', critical: 8, high: 14, medium: 22 },
      { label: 'Sat', critical: 3, high: 5, medium: 8 },
      { label: 'Sun', critical: 1, high: 4, medium: 7 },
    ],
    '30d': [
      { label: 'W1', critical: 18, high: 34, medium: 62 },
      { label: 'W2', critical: 24, high: 41, medium: 78 },
      { label: 'W3', critical: 14, high: 29, medium: 55 },
      { label: 'W4', critical: 21, high: 38, medium: 70 },
    ],
  }[timeRange];

  // Severity category distribution
  const severityCounts: Record<SeverityLevel, number> = {
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
    medium: alerts.filter((a) => a.severity === 'medium').length,
    low: alerts.filter((a) => a.severity === 'low').length,
    info: alerts.filter((a) => a.severity === 'info').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <NoticeBanner
        type="demo"
        customMessage="Sample dashboard records are shown for demonstration. They are not live device or network telemetry."
      />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DataCard
          title="Active Critical Threats"
          value={criticalCount}
          subtitle="Sample records; verify in a connected security tool"
          accentColor="red"
          icon={<ShieldAlert className="w-5 h-5 text-red-400" />}
          trend={{ direction: 'neutral', text: 'Sample data', isPositive: true }}
          onClick={() => {
            setSelectedSeverityFilter('critical');
          }}
        />

        <DataCard
          title="Open Incidents"
          value={openIncidents}
          subtitle={`${alerts.length} sample and session records`}
          accentColor="amber"
          icon={<Activity className="w-5 h-5 text-amber-400" />}
          trend={{ direction: 'neutral', text: 'No live feed', isPositive: true }}
          onClick={() => navigate('/alerts')}
        />

        <DataCard
          title="Compromised Assets"
          value={compromisedAssets}
          subtitle="No device integration connected"
          accentColor="blue"
          icon={<Server className="w-5 h-5 text-blue-400" />}
          trend={{ direction: 'neutral', text: 'No live source', isPositive: true }}
          onClick={() => navigate('/assets')}
        />

        <DataCard
          title="Avg Threat Risk Score"
          value={`${avgRiskScore}/100`}
          subtitle="Calculated via explainable heuristics"
          accentColor={avgRiskScore >= 70 ? 'red' : 'amber'}
          icon={<Crosshair className="w-5 h-5 text-cyan-400" />}
          trend={{ direction: 'neutral', text: scans.length ? 'Sample scan data' : 'No scan data', isPositive: true }}
          onClick={() => navigate('/scanners')}
        />
      </div>

      {/* Main Charts & Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time-series Threat Chart (2 cols) */}
        <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800 rounded-lg p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                Threat Activity (Sample Trend)
              </h2>
              <p className="text-xs text-zinc-400">
                Illustrative chart data only; it does not show live events.
              </p>
            </div>

            {/* Time range picker */}
            <div className="inline-flex rounded-md bg-zinc-950 p-1 border border-zinc-800 self-start sm:self-auto">
              {(['1h', '24h', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                    timeRange === range
                      ? 'bg-zinc-800 text-cyan-400 font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Accessible, clean SVG Bar / Line Representation */}
          <div className="h-64 w-full flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-zinc-800">
            {timeSeriesPoints.map((pt, i) => {
              const maxVal = Math.max(...timeSeriesPoints.map((p) => p.critical + p.high + p.medium), 10);
              const critHeight = (pt.critical / maxVal) * 100;
              const highHeight = (pt.high / maxVal) * 100;
              const medHeight = (pt.medium / maxVal) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full max-w-[36px] flex flex-col-reverse rounded-t overflow-hidden bg-zinc-800/40">
                    <div
                      style={{ height: `${critHeight}%` }}
                      className="w-full bg-red-600 transition-all duration-300 group-hover:brightness-125"
                      title={`Critical: ${pt.critical}`}
                    />
                    <div
                      style={{ height: `${highHeight}%` }}
                      className="w-full bg-rose-500/80 transition-all duration-300 group-hover:brightness-125"
                      title={`High: ${pt.high}`}
                    />
                    <div
                      style={{ height: `${medHeight}%` }}
                      className="w-full bg-amber-500/80 transition-all duration-300 group-hover:brightness-125"
                      title={`Medium: ${pt.medium}`}
                    />
                  </div>
                  <span className="mt-2 text-[11px] font-mono text-zinc-400 group-hover:text-zinc-200">
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-2 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-red-600" /> Critical Severity
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> High Severity
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> Medium Severity
              </span>
            </div>
            <span className="font-mono text-[11px] text-zinc-400">Sample chart only • no events per second feed connected</span>
          </div>
        </div>

        {/* Severity & Threat Breakdown (1 col) */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-1">
              Active Severity Distribution
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Incident count partitioned by classification tier
            </p>

            <div className="space-y-3">
              {(
                [
                  { key: 'critical', label: 'Critical Severity', color: 'bg-red-500', text: 'text-red-400' },
                  { key: 'high', label: 'High Severity', color: 'bg-rose-500', text: 'text-rose-400' },
                  { key: 'medium', label: 'Medium Severity', color: 'bg-amber-500', text: 'text-amber-400' },
                  { key: 'low', label: 'Low Severity', color: 'bg-blue-500', text: 'text-blue-400' },
                  { key: 'info', label: 'Informational', color: 'bg-emerald-500', text: 'text-emerald-400' },
                ] as const
              ).map((tier) => {
                const count = severityCounts[tier.key];
                const percentage = alerts.length > 0 ? Math.round((count / alerts.length) * 100) : 0;
                return (
                  <div key={tier.key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-300 font-medium">{tier.label}</span>
                      <span className={`font-mono font-semibold ${tier.text}`}>
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-full ${tier.color} transition-all duration-300`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-xs">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-2">
              Top MITRE Tactic Vectors
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[11px]">
                TA0011: C2 (40%)
              </span>
              <span className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[11px]">
                TA0006: Cred Access (30%)
              </span>
              <span className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[11px]">
                TA0010: Exfiltration (20%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts & Incident Queue */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              Recent Alerts & Incidents
            </h2>
            <p className="text-xs text-zinc-400">
              Click any incident to inspect forensics timeline and launch containment actions
            </p>
          </div>

          {/* Quick Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={selectedSeverityFilter}
              onChange={(e) => setSelectedSeverityFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Severities ({alerts.length})</option>
              <option value="critical">Critical Only ({severityCounts.critical})</option>
              <option value="high">High Only ({severityCounts.high})</option>
              <option value="medium">Medium Only ({severityCounts.medium})</option>
              <option value="low">Low Only ({severityCounts.low})</option>
            </select>

            <button
              onClick={() => navigate('/alerts')}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded border border-zinc-700 transition-colors inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="overflow-x-auto border border-zinc-800 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Severity</th>
                <th className="py-2.5 px-4 font-medium">Incident Title</th>
                <th className="py-2.5 px-4 font-medium">Affected Asset</th>
                <th className="py-2.5 px-4 font-medium">Detection Source</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 bg-zinc-900/40">
              {filteredAlerts.slice(0, 5).map((alert) => (
                <tr
                  key={alert.id}
                  className="hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                  onClick={() => openAlertModal(alert)}
                >
                  <td className="py-3 px-4">
                    <SeverityBadge severity={alert.severity} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-medium text-zinc-200">
                    <div className="font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors">
                      {alert.title}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      ID: {alert.id} • {alert.mitreTechnique || 'Unmapped'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-zinc-300 font-mono">
                      <Server className="w-3 h-3 text-cyan-400" />
                      <span>{alert.affectedAsset}</span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">{alert.assetIp}</div>
                  </td>
                  <td className="py-3 px-4 text-zinc-400 truncate max-w-xs">{alert.source}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={alert.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAlertModal(alert);
                      }}
                      className="px-2.5 py-1 rounded bg-zinc-800 group-hover:bg-cyan-950 group-hover:text-cyan-300 group-hover:border-cyan-700 text-zinc-300 border border-zinc-700 text-xs font-medium transition-colors"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 2-Column: Recent Scans & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scans Panel */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                Recent Scanner Artifacts
              </h2>
              <p className="text-xs text-zinc-400">
                Latest payload and network findings with explainable scoring
              </p>
            </div>
            <button
              onClick={() => navigate('/scanners')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center gap-1"
            >
              <span>Open Scanners</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {scans.slice(0, 3).map((scan) => (
              <div
                key={scan.id}
                className="p-3 rounded bg-zinc-950 border border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {scan.scannerType}
                    </span>
                    <SeverityBadge severity={scan.severity} size="sm" />
                    <span className="font-mono text-zinc-400 text-[11px]">
                      Risk: <strong className="text-zinc-200">{scan.riskScore}/100</strong>
                    </span>
                  </div>
                  <p className="font-mono text-zinc-200 truncate">{scan.input}</p>
                  <p className="text-zinc-400 text-[11px] truncate">{scan.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Analyst Activity Log */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                Local Activity Log
              </h2>
              <p className="text-xs text-zinc-400">Local activity log (demo activity is not live system telemetry)</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LOCAL DEMO LOG
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {activityLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 flex items-start gap-2.5"
              >
                <span className="text-zinc-500 text-[11px] shrink-0">{log.timestamp}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-zinc-300 font-medium truncate">{log.action}</div>
                  <div className="text-[11px] text-zinc-400">
                    By <span className="text-zinc-300">{log.analyst}</span> in{' '}
                    <span className="text-cyan-400">{log.module}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
