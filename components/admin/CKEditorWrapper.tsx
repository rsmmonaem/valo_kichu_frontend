"use client";

import React from 'react';
import dynamic from 'next/dynamic';

interface CKEditorWrapperProps {
    value: string;
    onChange: (data: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

const CKEditorCustom = dynamic(
    () => import('./CKEditorCustom'),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-[480px] w-full rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-3 p-8 text-slate-400">
                <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                    <p className="text-xs font-semibold text-slate-700">Loading CKEditor 5...</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Initializing rich text toolbar and media tools</p>
                </div>
            </div>
        )
    }
);

export default function CKEditorWrapper(props: CKEditorWrapperProps) {
    return <CKEditorCustom {...props} />;
}
