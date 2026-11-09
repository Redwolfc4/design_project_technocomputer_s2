'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  WebhookConfig,
  WebhookHttpMethod,
  WebhookAuthType,
  WebhookBodyFormat,
  WebhookHeaderItem,
  WebhookParamItem,
} from '@/types';
import {
  CheckIcon,
  AlertTriangleIcon,
  PlusIcon,
  TrashIcon,
  CopyIcon,
  RotateCcwIcon,
  EyeIcon,
  EyeOffIcon,
  PlayIcon,
  CodeIcon,
} from '@/components/ui/icons';

interface WebhookConfigSectionProps {
  initialUrl?: string;
  onChange: (config: WebhookConfig) => void;
}

const DEFAULT_EVENTS = [
  'document.uploaded',
  'document.verified',
  'document.approved',
  'document.rejected',
  'document.updated',
  'document.deleted',
];

const DEFAULT_HEADERS: WebhookHeaderItem[] = [
  { id: 'h-1', key: 'Content-Type', value: 'application/json', enabled: true },
  { id: 'h-2', key: 'Accept', value: 'application/json', enabled: true },
  { id: 'h-3', key: 'X-Webhook-Event', value: 'document.approved', enabled: true },
];

const DEFAULT_PARAMS: WebhookParamItem[] = [
  { id: 'p-1', key: 'workspace_id', value: 'workspace_demo_001', enabled: true },
  { id: 'p-2', key: 'env', value: 'production', enabled: true },
];

export function WebhookConfigSection({ initialUrl, onChange }: WebhookConfigSectionProps) {
  // Main Webhook Configuration State
  const [url, setUrl] = useState(initialUrl || 'https://api.nusantara-tech.co.id/webhooks/dokumenai');
  const [method, setMethod] = useState<WebhookHttpMethod>('POST');
  const [events, setEvents] = useState<string[]>(['document.approved', 'document.verified']);
  const [headers, setHeaders] = useState<WebhookHeaderItem[]>(DEFAULT_HEADERS);
  const [params, setParams] = useState<WebhookParamItem[]>(DEFAULT_PARAMS);
  const [bodyFormat, setBodyFormat] = useState<WebhookBodyFormat>('json');
  const [authType, setAuthType] = useState<WebhookAuthType>('bearer');

  // Auth credential fields
  const [bearerToken, setBearerToken] = useState('eyJh...demo_token_sec_9941');
  const [showBearer, setShowBearer] = useState(false);
  const [apiKeyName, setApiKeyName] = useState('X-API-Key');
  const [apiKeyValue, setApiKeyValue] = useState('dok_live_sec_8849120');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyPlacement, setApiKeyPlacement] = useState<'header' | 'query'>('header');
  const [basicUser, setBasicUser] = useState('webhook_service_user');
  const [basicPass, setBasicPass] = useState('p@ssw0rd_demo_123');
  const [showBasicPass, setShowBasicPass] = useState(false);
  const [hmacSecret, setHmacSecret] = useState('whsec_nusantara_live_secret_key');
  const [showHmacSecret, setShowHmacSecret] = useState(false);
  const [hmacHeader, setHmacHeader] = useState('X-Hub-Signature-256');

  // Request Body
  const [rawBody, setRawBody] = useState<string>(
    JSON.stringify(
      {
        event: 'document.approved',
        event_id: 'evt_demo_001',
        timestamp: '2026-11-09T07:00:00+07:00',
        workspace: {
          id: 'workspace_demo_001',
          name: 'Nusantara Enterprise Cloud Workspace',
        },
        document: {
          id: 'doc_demo_001',
          type: 'tax_invoice',
          invoice_number: '010.002-26.00000089',
          vendor_npwp: '01.234.567.8-012.000',
          total_amount: 94350000,
          status: 'approved',
          verification_score: 98.4,
        },
      },
      null,
      2
    )
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Active UI Tabs
  const [activeConfigTab, setActiveConfigTab] = useState<'params' | 'headers' | 'body' | 'auth'>('body');
  const [activeInspectorTab, setActiveInspectorTab] = useState<'preview' | 'raw' | 'curl' | 'inspector'>('preview');

  // Testing & Simulation State
  const [simulatedStatusCode, setSimulatedStatusCode] = useState<number>(200);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    statusCode: number;
    statusText: string;
    durationMs: number;
    timestamp: string;
    responseHeaders: Record<string, string>;
    responseBody: any;
  } | null>(null);
  const [logs, setLogs] = useState<
    { id: string; timestamp: string; method: string; url: string; status: number; duration: number }[]
  >([]);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // URL Validation
  const isUrlValid = useMemo(() => {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }, [url]);

  // Construct Final URL with Query Params
  const finalUrl = useMemo(() => {
    try {
      const u = new URL(url);
      params.filter((p) => p.enabled && p.key.trim()).forEach((p) => {
        u.searchParams.set(p.key.trim(), p.value);
      });
      if (authType === 'api_key' && apiKeyPlacement === 'query' && apiKeyName.trim()) {
        u.searchParams.set(apiKeyName.trim(), apiKeyValue);
      }
      return u.toString();
    } catch {
      return url;
    }
  }, [url, params, authType, apiKeyPlacement, apiKeyName, apiKeyValue]);

  // Check for duplicate header keys
  const duplicateHeaderKeys = useMemo(() => {
    const keys = headers.filter((h) => h.enabled && h.key.trim()).map((h) => h.key.trim().toLowerCase());
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    keys.forEach((k) => {
      if (seen.has(k)) duplicates.add(k);
      seen.add(k);
    });
    return Array.from(duplicates);
  }, [headers]);

  // Real-time JSON validation
  useEffect(() => {
    if (bodyFormat === 'json') {
      try {
        JSON.parse(rawBody);
        setJsonError(null);
      } catch (err: any) {
        setJsonError(err.message || 'Format JSON tidak valid');
      }
    } else {
      setJsonError(null);
    }
  }, [rawBody, bodyFormat]);

  // Sync to Parent safely with ref
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onChangeRef.current({
      url,
      method,
      events,
      headers,
      params,
      bodyFormat,
      rawBody,
      auth: {
        type: authType,
        bearerToken,
        apiKeyName,
        apiKeyValue,
        apiKeyPlacement,
        basicUsername: basicUser,
        basicPassword: basicPass,
        hmacSecret,
        hmacHeader,
      },
    });
  }, [
    url,
    method,
    events,
    headers,
    params,
    bodyFormat,
    rawBody,
    authType,
    bearerToken,
    apiKeyName,
    apiKeyValue,
    apiKeyPlacement,
    basicUser,
    basicPass,
    hmacSecret,
    hmacHeader,
  ]);

  // Prettify JSON
  const handlePrettifyJson = () => {
    try {
      const parsed = JSON.parse(rawBody);
      setRawBody(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || 'JSON tidak valid untuk diformat');
    }
  };

  // Reset JSON to Default
  const handleResetJson = () => {
    const defaultData = {
      event: events[0] || 'document.approved',
      event_id: `evt_demo_${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      workspace: {
        id: 'workspace_demo_001',
        name: 'Nusantara Enterprise Cloud Workspace',
      },
      document: {
        id: 'doc_demo_001',
        type: 'tax_invoice',
        status: 'approved',
        verification_score: 98.4,
      },
    };
    setRawBody(JSON.stringify(defaultData, null, 2));
    setJsonError(null);
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate Raw HTTP Request string
  const rawHttpRequest = useMemo(() => {
    try {
      const u = new URL(finalUrl);
      const pathWithQuery = u.pathname + u.search;
      const lines = [`${method} ${pathWithQuery} HTTP/1.1`, `Host: ${u.host}`];

      headers.filter((h) => h.enabled && h.key.trim()).forEach((h) => {
        lines.push(`${h.key}: ${h.value}`);
      });

      if (authType === 'bearer') {
        lines.push(`Authorization: Bearer ${bearerToken}`);
      } else if (authType === 'basic') {
        lines.push(`Authorization: Basic ${btoa(`${basicUser}:${basicPass}`)}`);
      } else if (authType === 'api_key' && apiKeyPlacement === 'header') {
        lines.push(`${apiKeyName}: ${apiKeyValue}`);
      } else if (authType === 'hmac') {
        lines.push(`${hmacHeader}: sha256=3f81e...simulated_signature`);
      }

      if (method === 'POST') {
        lines.push('');
        lines.push(rawBody);
      }

      return lines.join('\n');
    } catch {
      return `${method} ${url} HTTP/1.1\n\n(URL tidak valid)`;
    }
  }, [
    finalUrl,
    method,
    headers,
    authType,
    bearerToken,
    basicUser,
    basicPass,
    apiKeyName,
    apiKeyValue,
    apiKeyPlacement,
    hmacHeader,
    rawBody,
    url,
  ]);

  // Generate cURL Command string
  const curlCommand = useMemo(() => {
    const lines = [`curl -X ${method} "${finalUrl}"`];

    headers.filter((h) => h.enabled && h.key.trim()).forEach((h) => {
      lines.push(`  -H "${h.key}: ${h.value}"`);
    });

    if (authType === 'bearer') {
      lines.push(`  -H "Authorization: Bearer ${bearerToken}"`);
    } else if (authType === 'basic') {
      lines.push(`  -u "${basicUser}:${basicPass}"`);
    } else if (authType === 'api_key' && apiKeyPlacement === 'header') {
      lines.push(`  -H "${apiKeyName}: ${apiKeyValue}"`);
    } else if (authType === 'hmac') {
      lines.push(`  -H "${hmacHeader}: sha256=3f81e...simulated_signature"`);
    }

    if (method === 'POST') {
      const sanitizedBody = rawBody.replace(/"/g, '\\"').replace(/\n/g, ' ');
      lines.push(`  -d "${sanitizedBody}"`);
    }

    return lines.join(' \\\n');
  }, [
    method,
    finalUrl,
    headers,
    authType,
    bearerToken,
    basicUser,
    basicPass,
    apiKeyName,
    apiKeyValue,
    apiKeyPlacement,
    hmacHeader,
    rawBody,
  ]);

  // Run Simulated Webhook Test
  const handleTestWebhook = () => {
    if (!isUrlValid) {
      alert('Harap masukkan URL endpoint webhook yang valid terlebih dahulu.');
      return;
    }
    if (method === 'POST' && jsonError) {
      alert(`Validasi JSON Gagal: ${jsonError}`);
      return;
    }

    setIsTesting(true);
    setActiveInspectorTab('inspector');

    setTimeout(() => {
      setIsTesting(false);
      const isSuccess = simulatedStatusCode >= 200 && simulatedStatusCode < 300;
      const duration = Math.floor(Math.random() * 120) + 65;

      const mockResponses: Record<number, any> = {
        200: {
          success: true,
          status: 200,
          message: 'Webhook payload received and queued for ERP sync',
          data: {
            event_id: 'evt_demo_001',
            received_at: new Date().toISOString(),
            status: 'acknowledged',
          },
        },
        201: {
          success: true,
          status: 201,
          message: 'Resource created successfully in downstream service',
          record_id: 'REC-9941-APPROVED',
        },
        400: {
          success: false,
          status: 400,
          error: 'Bad Request',
          message: 'Payload validation failed: missing required parameter `event_id`',
        },
        401: {
          success: false,
          status: 401,
          error: 'Unauthorized',
          message: 'Invalid or expired Authorization Bearer Token',
        },
        404: {
          success: false,
          status: 404,
          error: 'Not Found',
          message: 'Webhook receiver endpoint path `/webhooks/dokumenai` does not exist',
        },
        500: {
          success: false,
          status: 500,
          error: 'Internal Server Error',
          message: 'Downstream ERP database timeout during transaction lock',
        },
      };

      const result = {
        statusCode: simulatedStatusCode,
        statusText:
          simulatedStatusCode === 200
            ? 'OK'
            : simulatedStatusCode === 201
            ? 'Created'
            : simulatedStatusCode === 400
            ? 'Bad Request'
            : simulatedStatusCode === 401
            ? 'Unauthorized'
            : simulatedStatusCode === 404
            ? 'Not Found'
            : 'Internal Server Error',
        durationMs: duration,
        timestamp: new Date().toLocaleTimeString(),
        responseHeaders: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Powered-By': 'Nusantara-Webhook-Gateway/2.4',
          'X-RateLimit-Limit': '1000',
          'X-RateLimit-Remaining': '994',
          'X-Request-Id': `req-${Date.now().toString().slice(-6)}`,
        },
        responseBody: mockResponses[simulatedStatusCode] || { status: simulatedStatusCode },
      };

      setTestResult(result);

      // Add to logs
      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          method,
          url: finalUrl,
          status: simulatedStatusCode,
          duration,
        },
        ...prev.slice(0, 9),
      ]);
    }, 400);
  };

  return (
    <div className="space-y-6 pt-4 border-t border-[#E2E8F0]">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#0F172A]">Endpoint Webhook Realtime</h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-[#4F46E5] border border-indigo-200">
              Enterprise Console
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Konfigurasi protokol HTTP, parameter query, otentikasi, dan payload data otomatisasi dokumen.
          </p>
        </div>
      </div>

      {/* URL & Method Input Bar */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#475569] block">
          Webhook Endpoint URL & HTTP Method
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Method Select */}
          <select
            value={method}
            onChange={(e) => {
              const newMethod = e.target.value as WebhookHttpMethod;
              setMethod(newMethod);
              if (newMethod === 'GET') {
                setActiveConfigTab('params');
              }
            }}
            className={`text-xs font-bold px-3 py-2.5 rounded-lg border focus:outline-none transition-colors ${
              method === 'POST'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-black'
                : 'bg-blue-50 text-blue-700 border-blue-300 font-black'
            }`}
          >
            <option value="POST">POST (Event Payload)</option>
            <option value="GET">GET (Query Callback)</option>
          </select>

          {/* URL Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.perusahaan.co.id/webhooks/dokumenai"
              className={`w-full text-xs font-mono px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none transition-all ${
                isUrlValid
                  ? 'border-[#CBD5E1] text-[#0F172A] focus:border-[#4F46E5]'
                  : 'border-rose-400 text-rose-700 bg-rose-50/30'
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isUrlValid ? (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  VALID HTTPS
                </span>
              ) : (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  URL TIDAK VALID
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Informative Callout about POST vs GET */}
        <div className="p-3 rounded-lg bg-[#FAFAFF] border border-[#E2E8F0] text-xs text-[#64748B] flex items-start gap-2">
          <span className="text-indigo-600 font-bold shrink-0">ℹ️</span>
          <span>
            {method === 'POST' ? (
              <>
                <strong>Metode POST:</strong> Standar industri untuk webhook event. Seluruh metadata dan hasil ekstraksi dikirimkan melalui <strong>Request Body (JSON)</strong>.
              </>
            ) : (
              <>
                <strong>Metode GET:</strong> Disediakan khusus untuk pengujian callback berbasis query parameter. <em>Request Body otomatis dinonaktifkan</em> karena GET tidak membawa payload body.
              </>
            )}
          </span>
        </div>
      </div>

      {/* Event Trigger Selection (Multi-select) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#475569] block">
          Pemicu Peristiwa (Event Triggers) — Pilih event yang mengirim webhook:
        </label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_EVENTS.map((evt) => {
            const isSelected = events.includes(evt);
            return (
              <button
                key={evt}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    if (events.length > 1) {
                      setEvents(events.filter((e) => e !== evt));
                    }
                  } else {
                    setEvents([...events, evt]);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#EEF2FF] text-[#4F46E5] border-indigo-300 shadow-2xs font-bold'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{evt}</span>
                {isSelected && <CheckIcon className="w-3.5 h-3.5 text-[#4F46E5]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuration Tabs Bar */}
      <div className="border border-[#CBD5E1] rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="flex items-center border-b border-[#E2E8F0] bg-[#FAFAFF] px-3 pt-2 gap-1 overflow-x-auto select-none">
          {/* Tab 1: Params */}
          <button
            type="button"
            onClick={() => setActiveConfigTab('params')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
              activeConfigTab === 'params'
                ? 'bg-white text-[#4F46E5] border-[#4F46E5] shadow-xs'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <span>Query Params</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
              {params.filter((p) => p.enabled).length}
            </span>
          </button>

          {/* Tab 2: Headers */}
          <button
            type="button"
            onClick={() => setActiveConfigTab('headers')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
              activeConfigTab === 'headers'
                ? 'bg-white text-[#4F46E5] border-[#4F46E5] shadow-xs'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <span>Headers</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
              {headers.filter((h) => h.enabled).length}
            </span>
          </button>

          {/* Tab 3: Body (Disabled if GET) */}
          <button
            type="button"
            disabled={method === 'GET'}
            onClick={() => setActiveConfigTab('body')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
              method === 'GET'
                ? 'text-slate-300 border-transparent cursor-not-allowed'
                : activeConfigTab === 'body'
                ? 'bg-white text-[#4F46E5] border-[#4F46E5] shadow-xs'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <span>Request Body</span>
            {method === 'GET' ? (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-400 font-semibold">
                Disabled (GET)
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-[#4F46E5] font-bold">
                {bodyFormat.toUpperCase()}
              </span>
            )}
          </button>

          {/* Tab 4: Auth */}
          <button
            type="button"
            onClick={() => setActiveConfigTab('auth')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
              activeConfigTab === 'auth'
                ? 'bg-white text-[#4F46E5] border-[#4F46E5] shadow-xs'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <span>Autentikasi</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-[#4F46E5] font-bold">
              {authType.toUpperCase()}
            </span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="p-4 bg-white">
          {/* ======================================================= */}
          {/* PANE 1: PARAMS */}
          {/* ======================================================= */}
          {activeConfigTab === 'params' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">Parameter URL (Query String)</span>
                <button
                  type="button"
                  onClick={() =>
                    setParams([
                      ...params,
                      { id: `p-${Date.now()}`, key: '', value: '', enabled: true },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#4F46E5] hover:text-[#4338CA]"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Tambah Parameter</span>
                </button>
              </div>

              <div className="space-y-2">
                {params.map((param, index) => (
                  <div key={param.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={param.enabled}
                      onChange={(e) => {
                        const updated = [...params];
                        updated[index].enabled = e.target.checked;
                        setParams(updated);
                      }}
                      className="rounded border-[#CBD5E1] text-[#4F46E5] focus:ring-[#4F46E5]"
                    />
                    <input
                      type="text"
                      placeholder="Parameter Key"
                      value={param.key}
                      onChange={(e) => {
                        const updated = [...params];
                        updated[index].key = e.target.value;
                        setParams(updated);
                      }}
                      className="w-1/3 px-3 py-1.5 text-xs font-mono border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#4F46E5]"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={param.value}
                      onChange={(e) => {
                        const updated = [...params];
                        updated[index].value = e.target.value;
                        setParams(updated);
                      }}
                      className="flex-1 px-3 py-1.5 text-xs font-mono border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#4F46E5]"
                    />
                    <button
                      type="button"
                      onClick={() => setParams(params.filter((p) => p.id !== param.id))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Hapus Parameter"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Final URL Live Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Final URL Preview (Termasuk Query Parameters):
                </span>
                <p className="font-mono text-[#0F172A] break-all select-all font-semibold text-[11px]">
                  {finalUrl}
                </p>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* PANE 2: HEADERS */}
          {/* ======================================================= */}
          {activeConfigTab === 'headers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-700">Request Headers</span>
                  {duplicateHeaderKeys.length > 0 && (
                    <span className="text-xs text-rose-500 font-semibold ml-2">
                      (Peringatan: Duplikasi key: {duplicateHeaderKeys.join(', ')})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setHeaders([
                      ...headers,
                      { id: `h-${Date.now()}`, key: '', value: '', enabled: true },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#4F46E5] hover:text-[#4338CA]"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Tambah Header</span>
                </button>
              </div>

              <div className="space-y-2">
                {headers.map((header, index) => (
                  <div key={header.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={header.enabled}
                      onChange={(e) => {
                        const updated = [...headers];
                        updated[index].enabled = e.target.checked;
                        setHeaders(updated);
                      }}
                      className="rounded border-[#CBD5E1] text-[#4F46E5] focus:ring-[#4F46E5]"
                    />
                    <input
                      type="text"
                      placeholder="Header Name"
                      value={header.key}
                      onChange={(e) => {
                        const updated = [...headers];
                        updated[index].key = e.target.value;
                        setHeaders(updated);
                      }}
                      className="w-1/3 px-3 py-1.5 text-xs font-mono border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#4F46E5]"
                    />
                    <div className="relative flex-1">
                      <input
                        type={header.isSecret ? 'password' : 'text'}
                        placeholder="Value"
                        value={header.value}
                        onChange={(e) => {
                          const updated = [...headers];
                          updated[index].value = e.target.value;
                          setHeaders(updated);
                        }}
                        className="w-full px-3 py-1.5 pr-8 text-xs font-mono border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#4F46E5]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...headers];
                          updated[index].isSecret = !updated[index].isSecret;
                          setHeaders(updated);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        title={header.isSecret ? 'Tampilkan nilai' : 'Samarkan nilai sensitif'}
                      >
                        {header.isSecret ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHeaders(headers.filter((h) => h.id !== header.id))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Hapus Header"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* PANE 3: REQUEST BODY (POST only) */}
          {/* ======================================================= */}
          {activeConfigTab === 'body' && (
            <div className="space-y-4">
              {method === 'GET' ? (
                <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <AlertTriangleIcon className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Request Body Tidak Tersedia untuk Method GET</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Protokol HTTP GET tidak diperkenankan membawa body payload. Silakan beralih ke tab <strong>Query Params</strong> untuk menyertakan data, atau ubah method ke <strong>POST</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Sub-tabs Format & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Format Payload:</span>
                      <div className="inline-flex rounded-lg border border-[#CBD5E1] p-0.5 bg-slate-100 text-xs">
                        <button
                          type="button"
                          onClick={() => setBodyFormat('json')}
                          className={`px-2.5 py-1 rounded font-bold transition-all ${
                            bodyFormat === 'json' ? 'bg-white text-[#4F46E5] shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          JSON
                        </button>
                        <button
                          type="button"
                          onClick={() => setBodyFormat('form_data')}
                          className={`px-2.5 py-1 rounded font-bold transition-all ${
                            bodyFormat === 'form_data' ? 'bg-white text-[#4F46E5] shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          Form Data
                        </button>
                        <button
                          type="button"
                          onClick={() => setBodyFormat('raw')}
                          className={`px-2.5 py-1 rounded font-bold transition-all ${
                            bodyFormat === 'raw' ? 'bg-white text-[#4F46E5] shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          Raw Text
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {bodyFormat === 'json' && (
                        <button
                          type="button"
                          onClick={handlePrettifyJson}
                          className="px-2.5 py-1 rounded border border-[#CBD5E1] bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Prettify JSON
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopy(rawBody, 'body_copy')}
                        className="px-2.5 py-1 rounded border border-[#CBD5E1] bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                      >
                        <CopyIcon className="w-3 h-3 text-slate-500" />
                        <span>{copiedKey === 'body_copy' ? 'Tersalin!' : 'Salin'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetJson}
                        className="px-2.5 py-1 rounded border border-[#CBD5E1] bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                      >
                        <RotateCcwIcon className="w-3 h-3 text-slate-500" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* JSON Syntax Error alert */}
                  {jsonError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{jsonError}</span>
                    </div>
                  )}

                  {/* Textarea Editor */}
                  <textarea
                    rows={10}
                    value={rawBody}
                    onChange={(e) => setRawBody(e.target.value)}
                    className="w-full p-3 font-mono text-xs rounded-xl border border-[#CBD5E1] bg-slate-900 text-emerald-400 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] leading-relaxed"
                  />
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* PANE 4: AUTENTIKASI */}
          {/* ======================================================= */}
          {activeConfigTab === 'auth' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Tipe Autentikasi Webhook</label>
                <select
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value as WebhookAuthType)}
                  className="w-full sm:w-64 text-xs font-semibold px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="none">None (Tanpa Autentikasi)</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="api_key">API Key</option>
                  <option value="basic">Basic Auth</option>
                  <option value="hmac">HMAC Signature (Simulasi SHA-256)</option>
                </select>
              </div>

              {/* Dynamic Auth Fields */}
              {authType === 'bearer' && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block">Bearer Token</label>
                  <div className="relative">
                    <input
                      type={showBearer ? 'text' : 'password'}
                      value={bearerToken}
                      onChange={(e) => setBearerToken(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                      className="w-full px-3 py-2 pr-10 text-xs font-mono border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:border-[#4F46E5]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBearer(!showBearer)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showBearer ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-[#64748B]">
                    Token akan dikirimkan otomatis melalui header <code>Authorization: Bearer &lt;token&gt;</code>.
                  </span>
                </div>
              )}

              {authType === 'api_key' && (
                <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Key Name</label>
                      <input
                        type="text"
                        value={apiKeyName}
                        onChange={(e) => setApiKeyName(e.target.value)}
                        placeholder="X-API-Key"
                        className="w-full px-3 py-2 text-xs font-mono border border-[#CBD5E1] rounded-lg bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Key Value</label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={apiKeyValue}
                          onChange={(e) => setApiKeyValue(e.target.value)}
                          placeholder="api_key_secret..."
                          className="w-full px-3 py-2 pr-8 text-xs font-mono border border-[#CBD5E1] rounded-lg bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showApiKey ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Penempatan</label>
                      <select
                        value={apiKeyPlacement}
                        onChange={(e) => setApiKeyPlacement(e.target.value as 'header' | 'query')}
                        className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-lg bg-white font-semibold"
                      >
                        <option value="header">Request Header</option>
                        <option value="query">Query Parameter</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {authType === 'basic' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Username</label>
                    <input
                      type="text"
                      value={basicUser}
                      onChange={(e) => setBasicUser(e.target.value)}
                      placeholder="admin"
                      className="w-full px-3 py-2 text-xs font-mono border border-[#CBD5E1] rounded-lg bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Password</label>
                    <div className="relative">
                      <input
                        type={showBasicPass ? 'text' : 'password'}
                        value={basicPass}
                        onChange={(e) => setBasicPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 pr-8 text-xs font-mono border border-[#CBD5E1] rounded-lg bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBasicPass(!showBasicPass)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showBasicPass ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {authType === 'hmac' && (
                <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Signature Header Name</label>
                      <input
                        type="text"
                        value={hmacHeader}
                        onChange={(e) => setHmacHeader(e.target.value)}
                        placeholder="X-Hub-Signature-256"
                        className="w-full px-3 py-2 text-xs font-mono border border-[#CBD5E1] rounded-lg bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">HMAC Secret Key</label>
                      <div className="relative">
                        <input
                          type={showHmacSecret ? 'text' : 'password'}
                          value={hmacSecret}
                          onChange={(e) => setHmacSecret(e.target.value)}
                          placeholder="whsec_..."
                          className="w-full px-3 py-2 pr-8 text-xs font-mono border border-[#CBD5E1] rounded-lg bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowHmacSecret(!showHmacSecret)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showHmacSecret ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <span className="font-bold text-indigo-600">Algoritma:</span>
                    <span className="font-mono bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      HMAC-SHA256
                    </span>
                    <span>(Simulasi verifikasi integritas pesan tanpa server backend)</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================= */}
      {/* REQUEST PREVIEW & TEST INSPECTOR */}
      {/* ======================================================= */}
      <div className="border border-[#CBD5E1] rounded-xl overflow-hidden bg-white shadow-xs">
        {/* Sub-header Tabs */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#FAFAFF] px-4 py-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveInspectorTab('preview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                activeInspectorTab === 'preview'
                  ? 'bg-white text-[#4F46E5] shadow-xs border border-[#CBD5E1]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Request Preview
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab('raw')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                activeInspectorTab === 'raw'
                  ? 'bg-white text-[#4F46E5] shadow-xs border border-[#CBD5E1]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw HTTP
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab('curl')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                activeInspectorTab === 'curl'
                  ? 'bg-white text-[#4F46E5] shadow-xs border border-[#CBD5E1]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              cURL Example
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab('inspector')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
                activeInspectorTab === 'inspector'
                  ? 'bg-white text-[#4F46E5] shadow-xs border border-[#CBD5E1]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Test Response & Logs</span>
              {testResult && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    testResult.statusCode >= 200 && testResult.statusCode < 300
                      ? 'bg-emerald-500'
                      : 'bg-rose-500'
                  }`}
                />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={simulatedStatusCode}
              onChange={(e) => setSimulatedStatusCode(Number(e.target.value))}
              className="text-xs font-bold bg-white border border-[#CBD5E1] rounded-lg px-2 py-1 text-slate-700"
              title="Pilih status respons untuk simulasi pengujian"
            >
              <option value={200}>Simulasi: 200 OK</option>
              <option value={201}>Simulasi: 201 Created</option>
              <option value={400}>Simulasi: 400 Bad Request</option>
              <option value={401}>Simulasi: 401 Unauthorized</option>
              <option value={404}>Simulasi: 404 Not Found</option>
              <option value={500}>Simulasi: 500 Server Error</option>
            </select>

            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={isTesting}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 disabled:opacity-50"
            >
              <PlayIcon className="w-3.5 h-3.5 fill-current" />
              <span>{isTesting ? 'Menguji...' : 'Test Webhook'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Preview */}
        {activeInspectorTab === 'preview' && (
          <div className="p-4 space-y-3 bg-[#FAFAFF] text-xs font-sans">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  method === 'POST' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {method}
              </span>
              <span className="font-mono text-[#0F172A] font-bold break-all">{finalUrl}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0]">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Headers Terkirim ({headers.filter((h) => h.enabled).length})
                </span>
                <div className="p-2.5 rounded-lg bg-white border border-[#CBD5E1] space-y-1 font-mono text-[11px]">
                  {headers
                    .filter((h) => h.enabled)
                    .map((h) => (
                      <div key={h.id} className="flex justify-between">
                        <span className="text-slate-500">{h.key}:</span>
                        <span className="font-semibold text-slate-900 truncate ml-2">
                          {h.isSecret ? '••••••••' : h.value}
                        </span>
                      </div>
                    ))}
                  {authType === 'bearer' && (
                    <div className="flex justify-between text-indigo-700 font-semibold">
                      <span>Authorization:</span>
                      <span className="truncate ml-2">Bearer ••••••••</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Ringkasan Request Body
                </span>
                <div className="p-2.5 rounded-lg bg-white border border-[#CBD5E1] space-y-1 text-[11px]">
                  {method === 'GET' ? (
                    <span className="text-slate-400 italic">Tidak ada body pada metode GET.</span>
                  ) : (
                    <div>
                      <span className="font-bold text-emerald-700">Format: JSON</span>
                      <p className="text-slate-500 truncate mt-1">
                        Events: {events.join(', ')}
                      </p>
                      <p className="text-slate-400 text-[10px] mt-0.5">
                        Ukuran payload: ~{rawBody.length} bytes
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Raw HTTP */}
        {activeInspectorTab === 'raw' && (
          <div className="relative p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => handleCopy(rawHttpRequest, 'raw_copy')}
              className="absolute right-4 top-4 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-slate-300 font-sans font-semibold flex items-center gap-1"
            >
              <CopyIcon className="w-3 h-3" />
              <span>{copiedKey === 'raw_copy' ? 'Tersalin!' : 'Salin Raw'}</span>
            </button>
            <pre className="whitespace-pre-wrap leading-relaxed">{rawHttpRequest}</pre>
          </div>
        )}

        {/* Tab 3: cURL Example */}
        {activeInspectorTab === 'curl' && (
          <div className="relative p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => handleCopy(curlCommand, 'curl_copy')}
              className="absolute right-4 top-4 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-slate-300 font-sans font-semibold flex items-center gap-1"
            >
              <CopyIcon className="w-3 h-3" />
              <span>{copiedKey === 'curl_copy' ? 'Tersalin!' : 'Salin cURL'}</span>
            </button>
            <pre className="whitespace-pre-wrap leading-relaxed">{curlCommand}</pre>
          </div>
        )}

        {/* Tab 4: Test Inspector & Logs */}
        {activeInspectorTab === 'inspector' && (
          <div className="p-4 space-y-4 bg-white text-xs">
            {testResult ? (
              <div className="space-y-4">
                {/* Result Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full font-black text-xs ${
                        testResult.statusCode >= 200 && testResult.statusCode < 300
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {testResult.statusCode} {testResult.statusText}
                    </span>
                    <span className="text-slate-500 font-medium">
                      Latency: <strong className="text-slate-900">{testResult.durationMs} ms</strong>
                    </span>
                    <span className="text-slate-400 text-[11px]">Timestamp: {testResult.timestamp}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Simulated Response
                  </span>
                </div>

                {/* Response Body & Headers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Response Headers:
                    </span>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[10px] space-y-1">
                      {Object.entries(testResult.responseHeaders).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-500">{k}:</span>
                          <span className="text-slate-900 font-semibold">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Response Body:
                    </span>
                    <pre className="p-2.5 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-40">
                      {JSON.stringify(testResult.responseBody, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <CodeIcon className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-semibold text-xs text-slate-600">Belum ada pengujian webhook yang dijalankan.</p>
                <p className="text-[11px] text-slate-400">
                  Klik tombol <strong>⚡ Test Webhook</strong> di atas untuk menjalankan simulasi pengiriman event.
                </p>
              </div>
            )}

            {/* Simulation Log History */}
            {logs.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">
                    Riwayat Uji Coba ({logs.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setLogs([])}
                    className="text-[10px] text-rose-600 font-semibold hover:underline"
                  >
                    Bersihkan Riwayat
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-32 overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="py-1.5 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[10px]">{log.timestamp}</span>
                        <span className="font-bold text-slate-800">{log.method}</span>
                        <span className="font-mono text-slate-500 truncate max-w-xs">{log.url}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            log.status >= 200 && log.status < 300
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="text-slate-400 text-[10px]">{log.duration}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
