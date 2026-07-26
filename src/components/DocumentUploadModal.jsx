import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  X,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  FileCheck,
  Stethoscope,
  Award,
  FileSpreadsheet,
  Calendar,
  BookOpen,
  Info
} from 'lucide-react';

const CATEGORIES = [
  { id: 'On-Duty Proof', label: 'On-Duty (OD) Proof', icon: Award, desc: 'Hackathons, Fest, Sports Event' },
  { id: 'Medical Certificate', label: 'Medical Certificate', icon: Stethoscope, desc: 'Doctor note, Hospital leave' },
  { id: 'Leave Application', label: 'Leave Application', icon: FileText, desc: 'Personal leave, Family emergency' },
  { id: 'Official Sports ID Proof', label: 'Sports / Event ID', icon: FileSpreadsheet, desc: 'University representation' }
];

const DocumentUploadModal = ({
  isOpen,
  onClose,
  onSubmitDoc,
  subjects = [],
  initialDate = '2026-07-26',
  initialSubject = '',
  initialReason = ''
}) => {
  const [docType, setDocType] = useState('Medical Certificate');
  const [reqDate, setReqDate] = useState(initialDate);
  const [reqSubject, setReqSubject] = useState(initialSubject || (subjects[0]?.id || 'CS301'));
  const [reqReason, setReqReason] = useState(initialReason);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    if (file.type && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 25;
      setUploadProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        const formattedSize = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;
        onSubmitDoc({
          type: docType,
          docType: docType,
          date: reqDate,
          subjectId: reqSubject,
          reason: reqReason || `${docType} Submission`,
          fileName: selectedFile.name,
          size: formattedSize,
          file: selectedFile,
          previewUrl: previewUrl,
        });
        setIsUploading(false);
        setUploadProgress(0);
        handleRemoveFile();
        onClose();
      }
    }, 180);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isUploading) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="glass-panel max-w-2xl w-full p-6 sm:p-7 rounded-3xl relative border border-slate-700/80 shadow-2xl overflow-y-auto max-h-[90vh]"
          style={{ background: 'var(--panel-bg, rgba(15, 23, 42, 0.97))' }}
        >
          {/* Header Banner */}
          <div style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            paddingBottom: '16px',
            marginBottom: '20px',
            borderBottom: '1px solid var(--panel-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                color: 'var(--accent-primary, #3b82f6)',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <FileCheck size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Document Verification Upload Portal
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Upload your medical certificate or OD proof for automatic attendance clearance
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { if (!isUploading) onClose(); }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--panel-border)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Step 1: Absence Details */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px',
                color: 'var(--accent-primary, #3b82f6)'
              }}>
                <Calendar size={14} /> 1. Absence Details &amp; Target Course
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-muted)' }}>
                    Date of Absence
                  </label>
                  <input
                    type="date"
                    value={reqDate}
                    onChange={(e) => setReqDate(e.target.value)}
                    className="form-control"
                    required
                    disabled={isUploading}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-muted)' }}>
                    Target Course / Subject
                  </label>
                  <select
                    value={reqSubject}
                    onChange={(e) => setReqSubject(e.target.value)}
                    className="form-control"
                    disabled={isUploading}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px' }}
                  >
                    {subjects.length > 0 ? (
                      subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code || s.id})</option>)
                    ) : (
                      <>
                        <option value="CS301">Data Structures &amp; Algorithms</option>
                        <option value="CS302">Database Systems</option>
                        <option value="CS303">Computer Networks</option>
                        <option value="MATH301">Linear Algebra</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Select Document Category */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px',
                color: 'var(--accent-secondary, #8b5cf6)'
              }}>
                <Sparkles size={14} /> 2. Document Category
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {CATEGORIES.map(cat => {
                  const IconComp = cat.icon;
                  const isSelected = docType === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => !isUploading && setDocType(cat.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '14px',
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        border: isSelected ? '1px solid var(--accent-primary, #3b82f6)' : '1px solid var(--panel-border)',
                        background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                      }}
                    >
                      <div style={{
                        padding: '6px',
                        borderRadius: '8px',
                        background: isSelected ? 'var(--accent-primary, #3b82f6)' : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#ffffff' : 'var(--text-muted)',
                        marginTop: '2px'
                      }}>
                        <IconComp size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                          {cat.label}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {cat.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Reason / Medical Diagnosis */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
                color: 'var(--text-muted)'
              }}>
                <Info size={14} /> 3. Reason / Diagnosis Summary
              </label>
              <input
                type="text"
                placeholder="e.g. Viral Fever & Medical Rest / Hackathon Participation"
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
                className="form-control"
                required
                disabled={isUploading}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
              />
            </div>

            {/* Step 4: File Upload & Live Preview */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px',
                color: 'var(--status-safe, #10b981)'
              }}>
                <Upload size={14} /> 4. Attach Proof Document (Your Own File)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                style={{ display: 'none' }}
                disabled={isUploading}
              />

              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragActive ? 'var(--accent-primary, #3b82f6)' : 'var(--panel-border)'}`,
                    background: dragActive ? 'rgba(59, 130, 246, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '16px',
                    padding: '24px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                    color: 'var(--accent-primary, #3b82f6)'
                  }}>
                    <Upload size={22} />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px', color: 'var(--text-main)' }}>
                    Click to browse your device or Drag &amp; Drop file here
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px' }}>
                    Upload your official PDF, PNG, or JPG certificate (Max 5MB)
                  </p>
                  <span className="status-badge info" style={{ fontSize: '11px' }}>
                    <ShieldCheck size={12} /> Encrypted Vault Upload
                  </span>
                </div>
              ) : (
                <div style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Thumbnail Preview"
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '14px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      borderRadius: '12px',
                      color: 'var(--accent-primary, #3b82f6)'
                    }}>
                      <FileText size={28} />
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span className="status-badge safe" style={{ fontSize: '10px', padding: '2px 8px' }}>
                        <CheckCircle2 size={11} /> Ready to Submit
                      </span>
                    </div>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedFile.name}
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Verified File Format
                    </p>
                  </div>

                  {!isUploading && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  <span>Submitting to Admin Verification Inbox...</span>
                  <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>{uploadProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--accent-gradient)', transition: 'width 0.2s ease' }} />
                </div>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={() => { if (!isUploading) onClose(); }}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px', fontSize: '14px', borderRadius: '12px' }}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  flex: 1.5,
                  padding: '12px',
                  fontSize: '14px',
                  borderRadius: '12px',
                  opacity: !selectedFile || isUploading ? 0.5 : 1,
                  cursor: !selectedFile || isUploading ? 'not-allowed' : 'pointer'
                }}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? 'Submitting Application...' : 'Submit Document for Clearance'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DocumentUploadModal;
