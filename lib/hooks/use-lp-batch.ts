'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
  createLpBatch,
  listLpBatchesByProduct,
  getLpBatch,
  listLpBatchLandingPages,
  getLpBatchLandingPage,
  transitionLpBatchLandingPageStatus,
  uploadLpBatchAiResults,
  getBatchGeneratedLandingPages,
} from '@/lib/api/lp-batch';
import { getToken } from '@/lib/api/client';
import { API_BASE } from '@/lib/api/config';
import type {
  CreateLpBatchDto,
  CreateLpBatchResponse,
  LpBatchStatus,
  LpBatchLandingPagesParams,
  TransitionLpStatusDto,
} from '@/lib/api/types';


const TERMINAL: LpBatchStatus[] = ['COMPLETED', 'FAILED'];

export function useLpBatchesByProduct(productId: string) {
  return useQuery({
    queryKey: ['lp-batch', 'by-product', productId],
    queryFn: () => listLpBatchesByProduct(productId),
    enabled: !!productId,
  });
}

export function useLpBatchPolling(id: string | null) {
  return useQuery({
    queryKey: ['lp-batch', id],
    queryFn: () => getLpBatch(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || TERMINAL.includes(status)) return false;
      return 2000;
    },
  });
}

export function useCreateLpBatch() {
  const queryClient = useQueryClient();
  return useMutation<CreateLpBatchResponse, Error, CreateLpBatchDto>({
    mutationFn: (dto) => createLpBatch(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lp-batch'] });
    },
  });
}

export function useLpBatchLandingPages(params: LpBatchLandingPagesParams = {}) {
  return useQuery({
    queryKey: ['lp-batch', 'landing-pages', params],
    queryFn: () => listLpBatchLandingPages(params),
  });
}

export function useLpBatchLandingPage(id: string | null) {
  return useQuery({
    queryKey: ['lp-batch', 'landing-pages', id],
    queryFn: () => getLpBatchLandingPage(id!),
    enabled: !!id,
  });
}

export function useTransitionLpBatchLandingPageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: TransitionLpStatusDto }) =>
      transitionLpBatchLandingPageStatus(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lp-batch', 'landing-pages'] });
    },
  });
}

export function useBatchGeneratedLandingPages(batchId: string | null) {
  return useQuery({
    queryKey: ['lp-batch', batchId, 'landing-pages'],
    queryFn: () => getBatchGeneratedLandingPages(batchId!),
    enabled: !!batchId,
  });
}

export function useUploadLpBatchAiResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, files }: { batchId: string; files: File[] }) =>
      uploadLpBatchAiResults(batchId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lp-batch', 'landing-pages'] });
    },
  });
}

export interface LpLogLine {
  id: number;
  time: string;
  message: string;
}

export function useLpBatchLogStream(batchId: string | null) {
  const [logs, setLogs] = useState<LpLogLine[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const counter = useRef(0);

  useEffect(() => {
    if (!batchId) return;
    setLogs([]);
    setIsDone(false);
    setError(null);

    const token = getToken();
    const ctrl = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        console.log('[sse] connecting:', `${API_BASE}/api/v1/lp-batch/${batchId}/logs/stream`);
        const res = await fetch(`${API_BASE}/api/v1/lp-batch/${batchId}/logs/stream`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: ctrl.signal,
        });
        console.log('[sse] status:', res.status);

        if (!res.ok || !res.body) {
          setError(`Stream error: ${res.status}`);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        // current SSE event fields
        let eventType = '';
        let dataLines: string[] = [];

        const processEvent = () => {
          if (eventType === 'done') { setIsDone(true); return; }
          if (dataLines.length === 0) return;

          const raw = dataLines.join('\n');
          try {
            const parsed = JSON.parse(raw);
            const time = parsed.ts ? new Date(parsed.ts).toLocaleTimeString() : '';
            const message = parsed.message ?? parsed.log ?? parsed.text ?? raw;
            console.log(`[sse] ${time} [${(parsed.level ?? 'info').toUpperCase()}] ${message}`);
            setLogs(prev => [...prev, { id: counter.current++, time, message }]);
          } catch {
            console.log('[sse]', raw);
            setLogs(prev => [...prev, { id: counter.current++, time: '', message: raw }]);
          }

          eventType = '';
          dataLines = [];
        };

        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) { setIsDone(true); break; }

          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';

          for (const line of lines) {
            if (line === '') {
              // blank line = end of SSE event
              processEvent();
            } else if (line.startsWith('event:')) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataLines.push(line.slice(5).trim());
            }
            // ignore id: lines
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Stream failed');
        }
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [batchId]);

  return { logs, isDone, error };
}
