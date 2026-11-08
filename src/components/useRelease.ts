'use client';

import { useSyncExternalStore } from 'react';
import { FEED, latest, detectPlatform } from '@/lib/releases';

export type ReleaseAsset = { name: string; browser_download_url: string; size: number };
export type Release = { tag_name: string; html_url?: string; assets: ReleaseAsset[] };
export type PlatformId = 'windows' | 'macos' | 'linux';

export type ReleaseState = {
  status: 'loading' | 'ready' | 'error' | 'empty';
  release: Release | null;
  mine: PlatformId | null;
};

const LOADING: ReleaseState = { status: 'loading', release: null, mine: null };

// One fetch per page load, shared by every component that asks.
let state: ReleaseState = LOADING;
let started = false;
const listeners = new Set<() => void>();

function set(next: ReleaseState) {
  state = next;
  listeners.forEach((l) => l());
}

function start() {
  if (started || typeof window === 'undefined') return;
  started = true;
  let mine: PlatformId | null = null;
  try {
    mine = (detectPlatform() as PlatformId | null) ?? null;
  } catch {
    mine = null;
  }
  const abort = new AbortController();
  const timer = window.setTimeout(() => abort.abort(), 8000);
  fetch(FEED, { signal: abort.signal, headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((list: unknown) => {
      const release = latest(list) as Release | null;
      set(release ? { status: 'ready', release, mine } : { status: 'empty', release: null, mine });
    })
    .catch(() => set({ status: 'error', release: null, mine }))
    .finally(() => window.clearTimeout(timer));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => LOADING;

export function useRelease(): ReleaseState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
