import React, { useRef } from 'react';
import { Settings2, Trash2, Figma, Upload } from 'lucide-react';
import type { CanvasElement } from '../../types';

interface Props {
  element: CanvasElement;
  onUpdate: (element: CanvasElement) => void;
  onDelete: (id: string) => void;
}

export default function PropertiesPanel({ element, onUpdate, onDelete }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateData = (newData: Partial<any>) => {
    onUpdate({
      ...element,
      data: { ...element.data, ...newData }
    } as CanvasElement);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateData({ videoUrl: url });
    }
  };

  // Helper renderers for common fields
  const renderTextInput = (key: string, label: string, placeholder = '') => (
    <div className="mb-3">
      <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type="text"
        value={(element.data as any)[key] || ''}
        onChange={(e) => updateData({ [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full bg-surface-1 border border-panel-border rounded-md px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-purple"
      />
    </div>
  );

  const renderTextArea = (key: string, label: string, placeholder = '', rows = 3) => (
    <div className="mb-3">
      <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">{label}</label>
      <textarea
        value={(element.data as any)[key] || ''}
        onChange={(e) => updateData({ [key]: e.target.value })}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-surface-1 border border-panel-border rounded-md px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-purple resize-none"
      />
    </div>
  );

  return (
    <div
      className="flex flex-col h-full bg-white border border-panel-border shadow-2xl shadow-black/5 rounded-2xl flex-shrink-0 relative pointer-events-auto transition-all overflow-hidden"
      style={{ width: '280px' }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border bg-white sticky top-0 z-10 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Settings2 className="w-4 h-4 text-accent-purple flex-shrink-0" />
          <span className="text-xs font-semibold text-text-primary truncate uppercase tracking-wider">
            {element.type.replace(/-/g, ' ')}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        
        {/* Case Study Card */}
        {element.type === 'case-study-card' && (() => {
          const metrics = (element.data as any).metrics || [];
          return (
            <>
              {renderTextInput('title', 'Title')}
              {renderTextInput('subtitle', 'Subtitle')}
              {renderTextArea('description', 'Description', '', 4)}
              
              <div className="mb-3">
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  value={((element.data as any).tags || []).join(', ')}
                  onChange={(e) => updateData({ tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="Enterprise, SaaS, B2B"
                  className="w-full bg-surface-1 border border-panel-border rounded-md px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-purple"
                />
              </div>

              <div className="mt-4 mb-2">
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">Metrics (Max 3)</label>
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={`Label ${i + 1}`}
                    value={metrics[i]?.label || ''}
                    onChange={(e) => {
                      const newMetrics = [...metrics];
                      if (!newMetrics[i]) newMetrics[i] = { label: '', value: '' };
                      newMetrics[i].label = e.target.value;
                      updateData({ metrics: newMetrics });
                    }}
                    className="w-1/2 bg-surface-1 border border-panel-border rounded-md px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent-purple"
                  />
                  <input
                    type="text"
                    placeholder={`Value ${i + 1}`}
                    value={metrics[i]?.value || ''}
                    onChange={(e) => {
                      const newMetrics = [...metrics];
                      if (!newMetrics[i]) newMetrics[i] = { label: '', value: '' };
                      newMetrics[i].value = e.target.value;
                      updateData({ metrics: newMetrics });
                    }}
                    className="w-1/2 bg-surface-1 border border-panel-border rounded-md px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent-purple"
                  />
                </div>
              ))}
            </>
          );
        })()}

        {/* Section Label */}
        {element.type === 'section-label' && (
          <>
            {renderTextInput('title', 'Section Title')}
          </>
        )}

        {/* Sticky Note */}
        {element.type === 'sticky-note' && (
          <>
            {renderTextArea('content', 'Note Content', '', 5)}
          </>
        )}

        {/* Figma Embed */}
        {element.type === 'figma-embed' && (
          <>
            <div className="mb-4 bg-surface-1 p-3 rounded-lg border border-panel-border flex flex-col items-center text-center">
              <Figma className="w-6 h-6 text-accent-purple mb-2" />
              <p className="text-[10px] text-text-secondary">Paste a Figma prototype or file embed link below.</p>
            </div>
            {renderTextInput('title', 'Title')}
            {renderTextInput('figmaUrl', 'Figma Embed URL', 'https://www.figma.com/embed?embed_host=...')}
            {renderTextArea('description', 'Description')}
          </>
        )}

        {/* Tag Cluster */}
        {element.type === 'tag-cluster' && (() => {
          const tags = (element.data as any).tags || [];
          const currentTagsStr = tags.map((t: any) => t.label).join(', ');
          
          const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newLabels = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            const palette = ['#3B82F6', '#10B981', '#F59E0B', '#A855F7', '#EC4899', '#6366F1'];
            
            const newTags = newLabels.map((lbl, idx) => {
               const existing = tags.find((t: any) => t.label === lbl);
               return existing ? existing : { label: lbl, color: palette[idx % palette.length] };
            });
            
            updateData({ tags: newTags });
          };
          
          return (
            <>
              {renderTextInput('title', 'Title')}
              <div className="mb-3">
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  value={currentTagsStr}
                  onChange={handleTagsChange}
                  placeholder="Design, Engineering, Product"
                  className="w-full bg-surface-1 border border-panel-border rounded-md px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-purple"
                />
              </div>
            </>
          );
        })()}

        {/* Image Frame */}
        {element.type === 'image-frame' && (() => {
          const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const objectUrl = URL.createObjectURL(file);
            updateData({ imageUrl: objectUrl });
          };

          return (
            <>
              {renderTextInput('label', 'Image Label')}
              
              <div className="mb-3">
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Image URL</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={(element.data as any).imageUrl || ''}
                    onChange={(e) => updateData({ imageUrl: e.target.value })}
                    placeholder="https://example.com/image.png"
                    className="w-full bg-surface-1 border border-panel-border rounded-md px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-purple"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="w-full flex items-center justify-center gap-2 bg-surface-1 hover:bg-surface-2 border border-panel-border text-text-primary px-3 py-2 rounded-md text-xs font-semibold transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      Upload Local Image
                    </button>
                  </div>
                </div>
              </div>
            </>
          );
        })()}

        {/* Video Embed */}
        {element.type === 'video-embed' && (
          <>
            <div className="mb-3">
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Upload Local Video</label>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex justify-center items-center gap-2 bg-accent-purple text-white rounded-md py-2 text-xs font-semibold hover:bg-opacity-90 transition-colors"
               >
                <Upload className="w-3.5 h-3.5" /> Select Video File
              </button>
              <input type="file" accept="video/*" ref={fileInputRef} onChange={handleVideoUpload} className="hidden" />
              <p className="text-[9px] text-text-secondary mt-1.5 leading-tight">
                This will preview locally. For persistence, paste a public URL below.
              </p>
            </div>
            {renderTextInput('videoUrl', 'Or Paste Video URL', 'https://.../video.mp4')}
            {renderTextInput('title', 'Title')}
            {renderTextArea('description', 'Description')}
          </>
        )}

        {/* Generic Fallback for Supported Component Data */}
        {!['case-study-card', 'section-label', 'sticky-note', 'figma-embed', 'video-embed', 'tag-cluster', 'game-zone', 'storyboard', 'image-frame'].includes(element.type) && (
           <>
             {Object.entries((element.data as any)).map(([key, value]) => {
               if (['accentColor', 'color', 'thumbnailColor'].includes(key)) return null;
               
               const labelText = key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase());
               
               if (typeof value === 'string') {
                 const isLong = value.length > 50 || key.toLowerCase().includes('description') || key.toLowerCase().includes('content') || key.toLowerCase().includes('quote');
                 return (
                    <React.Fragment key={key}>
                      {isLong ? renderTextArea(key, labelText) : renderTextInput(key, labelText)}
                    </React.Fragment>
                  );
               }
               if (typeof value === 'number') {
                 return (
                    <React.Fragment key={key}>
                      {renderTextInput(key, labelText)}
                    </React.Fragment>
                  );
               }
               
               return null;
             })}
           </>
        )}
      </div>

      <div className="p-4 border-t border-panel-border mt-auto">
        <button
          onClick={() => onDelete(element.id)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Component
        </button>
      </div>
    </div>
  );
}
