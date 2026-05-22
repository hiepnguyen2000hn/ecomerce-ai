'use client';

import React, { useState, useMemo } from 'react';
import type { ApiProduct, ApiLpBatchLandingPage } from '@/lib/api/types';
import { EditorHeader } from './editor-header';
import { EditorToolbar, type DeviceType } from './editor-toolbar';
import { EditorCanvas } from './editor-canvas';
import { EditorSidebar } from './editor-sidebar';

interface LandingPageEditorProps {
  product: ApiProduct;
  lp: ApiLpBatchLandingPage;
  versions?: ApiLpBatchLandingPage[];
  onBack: () => void;
}

export function LandingPageEditor({ product, lp, versions, onBack }: LandingPageEditorProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [activeLpId, setActiveLpId] = useState(lp.id);

  const activeLp = useMemo(
    () => versions?.find((v) => v.id === activeLpId) ?? lp,
    [activeLpId, versions, lp],
  );

  const versionItems = useMemo(
    () => versions?.map((v, i) => ({ id: v.id, label: `V${i + 1}` })),
    [versions],
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
      <EditorHeader product={product} lp={activeLp} onBack={onBack} />
      <EditorToolbar
        device={device}
        onDeviceChange={setDevice}
        versions={versionItems}
        activeVersionId={activeLpId}
        onVersionChange={setActiveLpId}
      />
      <div className="flex-1 flex overflow-hidden">
        <EditorCanvas htmlUrl={activeLp.htmlUrl} publicUrl={activeLp.publicUrl} device={device} />
        <EditorSidebar />
      </div>
    </div>
  );
}
