import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import PlatformSelector from './components/PlatformSelector';
import ProjectDetails from './components/ProjectDetails';
import AdditionalInfo from './components/AdditionalInfo';
import GenerateButtons from './components/GenerateButtons';
import StatusDisplay from './components/StatusDisplay';
import { generateDocument, downloadDocument } from './services/api';

const STORAGE_KEY = 'hld-lld-generator-details';

function loadSavedDetails() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return null;
}

function getCurrentView() {
  if (typeof window === 'undefined') return 'landing';
  if (window.location.pathname.endsWith('/app')) return 'app';
  return window.location.hash === '#/app' ? 'app' : 'landing';
}

function LandingPage({ onEnter }) {
  const rotatingWords = [
    { label: 'Public Cloud Teams', className: 'role-blue' },
    { label: 'Engineers', className: 'role-yellow' },
    { label: 'Management', className: 'role-greenblue' },
    { label: 'Sales', className: 'role-india' }
  ];
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex(prev => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [rotatingWords.length]);

  const activeRole = rotatingWords[roleIndex];

  return (
    <div className="glyphic-shell min-h-screen">
      <main className="mx-auto w-full max-w-[1760px] p-3 md:p-5">
        <section className="glyphic-stage overflow-hidden rounded-[32px] border border-[#dfdad2] bg-[#f7f5f0]">
          <header className="flex items-center justify-between px-5 py-6 md:px-10 md:py-8">
            <div className="flex items-center gap-2">
              <img
                src="/images/gutenberg-mark.svg"
                alt="Gutenberg icon"
                className="h-11 w-11 rounded-full border border-[#2b3f79]/25 shadow-sm"
              />
              <span className="text-[28px] font-bold leading-none tracking-[-0.02em] text-[#0c234a] md:text-[34px]">Gutenberg</span>
            </div>

            <nav className="hidden items-center gap-10 text-[24px] font-medium text-[#213b5a] md:flex">
              <a href="#features" className="hover:text-[#0c234a]">Features</a>
              <a href="#how" className="hover:text-[#0c234a]">How it works</a>
              <a href="#contact" className="hover:text-[#0c234a]">Contact</a>
            </nav>

            <button
              onClick={onEnter}
              className="rounded-2xl border border-[#bfc8d6] bg-white px-7 py-3 text-[24px] font-semibold text-[#1f3758] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
            >
              Enter
            </button>
          </header>

          <section className="relative px-5 pb-20 pt-8 text-center md:px-12 md:pb-28 md:pt-14">
            <h1 className="mx-auto max-w-6xl text-[52px] font-bold leading-[0.98] tracking-[-0.03em] text-[#021f4b] md:text-[78px]">
              Precision Document Automation
              <span className="mt-1 block">
                <span className="glyphic-for inline-block">for</span>{' '}
                <span className={`rotating-role inline-block ${activeRole.className}`}>{activeRole.label}</span>
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-4xl text-[22px] leading-snug text-[#243e61] md:text-[36px]">
              Manual document processing is a time drain. Gutenberg delivers accurate and seamless automation, freeing your team to do business.
            </p>

            <button
              onClick={onEnter}
              className="mt-10 rounded-2xl bg-[#092b58] px-9 py-4 text-[24px] font-semibold text-white transition hover:bg-[#103a72]"
            >
              Enter
            </button>

            <p className="mt-6 text-[16px] text-[#3d5573] md:text-[21px]">No disruption to your current workflow. Start with your existing SOW process.</p>
          </section>
        </section>

        <section id="features" className="mt-6 rounded-[28px] border border-[#dfdad2] bg-[#f7f5f0] px-6 py-8 md:px-10">
          <h2 className="text-[32px] font-bold tracking-[-0.02em] text-[#0c234a] md:text-[42px]">Features</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-[#d6deea] bg-white/80 p-5">
              <h3 className="text-[20px] font-semibold text-[#0c234a]">AI SOW Extraction</h3>
              <p className="mt-2 text-[16px] text-[#34506f]">Parses PDF, DOCX, and TXT SOW files and extracts structured project data using Gemini.</p>
            </article>
            <article className="rounded-2xl border border-[#d6deea] bg-white/80 p-5">
              <h3 className="text-[20px] font-semibold text-[#0c234a]">HLD + LLD Generation</h3>
              <p className="mt-2 text-[16px] text-[#34506f]">Generates professional Word documents for High-Level and Low-Level Design.</p>
            </article>
            <article className="rounded-2xl border border-[#d6deea] bg-white/80 p-5">
              <h3 className="text-[20px] font-semibold text-[#0c234a]">AWS + Azure Support</h3>
              <p className="mt-2 text-[16px] text-[#34506f]">Platform-aware output for networking, security, topology, migration, and operations.</p>
            </article>
          </div>
        </section>

        <section id="how" className="mt-6 rounded-[28px] border border-[#dfdad2] bg-[#f7f5f0] px-6 py-8 md:px-10">
          <h2 className="text-[32px] font-bold tracking-[-0.02em] text-[#0c234a] md:text-[42px]">How it works</h2>
          <ol className="mt-5 list-decimal space-y-2 pl-5 text-[17px] leading-relaxed text-[#2e4766]">
            <li>Upload the Statement of Work document.</li>
            <li>Select cloud platform and provide project details.</li>
            <li>Gutenberg analyzes requirements, scope, risks, and architecture inputs.</li>
            <li>Generate HLD or LLD and download the DOCX output.</li>
          </ol>
        </section>

        <section id="contact" className="mt-6 rounded-[28px] border border-[#dfdad2] bg-[#f7f5f0] px-6 py-8 md:px-10">
          <h2 className="text-[32px] font-bold tracking-[-0.02em] text-[#0c234a] md:text-[42px]">Contact</h2>
          <div className="mt-4 space-y-2 text-[17px] text-[#2e4766]">
            <p><span className="font-semibold text-[#0c234a]">Name:</span> Promit Bhattacherjee</p>
            <p>
              <span className="font-semibold text-[#0c234a]">Email:</span>{' '}
              <a href="mailto:Promit.b@global.ntt" className="text-[#0f4b92] hover:underline">Promit.b@global.ntt</a>
            </p>
            <p>
              <span className="font-semibold text-[#0c234a]">X:</span>{' '}
              <a href="https://x.com/PromitXi" target="_blank" rel="noreferrer" className="text-[#0f4b92] hover:underline">https://x.com/PromitXi</a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function WorkspacePage({ onBack }) {
  const [file, setFile] = useState(null);
  const [platform, setPlatform] = useState('');
  const [activeTab, setActiveTab] = useState('how-it-works');
  const [projectDetails, setProjectDetails] = useState(
    loadSavedDetails() || {
      projectName: '',
      clientName: '',
      authorName: '',
      version: '1.0',
      region: ''
    }
  );
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(null);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projectDetails));
  }, [projectDetails]);

  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.2 }
    );

    revealEls.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isFormValid = file && platform && projectDetails.projectName && projectDetails.clientName && projectDetails.authorName;

  const handleGenerate = async documentType => {
    if (!isFormValid) return;

    setLoading(documentType);
    setResult(null);
    setError(null);

    const steps = ['uploading', 'parsing', 'extracting', 'generating', 'building', 'finalizing'];
    let stepIndex = 0;

    const interval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex += 1;
        setStatus({ step: steps[stepIndex] });
      }
    }, 1500);

    setStatus({ step: steps[0] });

    try {
      const formData = new FormData();
      formData.append('sowFile', file);
      formData.append('platform', platform);
      formData.append('documentType', documentType);
      formData.append('additionalInfo', additionalInfo);
      formData.append('projectDetails', JSON.stringify(projectDetails));

      const data = await generateDocument(formData, progress => {
        setStatus(progress);
      });

      clearInterval(interval);
      setResult(data);
      setStatus(null);
    } catch (err) {
      clearInterval(interval);
      const message = err.response?.data?.error || err.message || 'An unexpected error occurred';
      setError(message);
      setStatus(null);
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = downloadUrl => {
    downloadDocument(downloadUrl);
  };

  const handleRetry = () => {
    setError(null);
    setResult(null);
    setStatus(null);
  };

  const completedRequirements = [
    Boolean(file),
    Boolean(platform),
    Boolean(projectDetails.projectName),
    Boolean(projectDetails.clientName),
    Boolean(projectDetails.authorName)
  ].filter(Boolean).length;

  return (
    <div className="apple-page min-h-screen">
      <div className="apple-orb apple-orb-left" />
      <div className="apple-orb apple-orb-right" />

      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">NTT Workspace</p>
            <h1 className="text-xl font-semibold text-slate-900">Gutenberg</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="rounded-full border border-slate-200 bg-white/90 px-4 py-1 text-xs font-medium text-slate-600 shadow-sm"
            >
              Back
            </button>
            <p className="rounded-full border border-slate-200 bg-white/90 px-4 py-1 text-xs font-medium text-slate-600 shadow-sm">
              Made for NTT Public Cloud Team
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8">
        <section className="apple-hero mb-8 rounded-3xl border border-white/70 bg-white/78 p-8 shadow-2xl shadow-slate-900/5 backdrop-blur-xl md:p-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-slate-500">NTT Public Cloud Team</p>
          <h2 className="max-w-4xl text-5xl font-semibold leading-[1.03] text-slate-900 md:text-7xl">
            Manual document processing is a time drain. Gutenberg automates it.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 md:text-xl">
            Generate accurate, delivery-ready HLD and LLD documents from SOW files with AI-assisted extraction, structured templates,
            and cloud-specific outputs for AWS and Azure.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/90 px-5 py-2 text-sm text-slate-700">
            <span className="font-medium">{completedRequirements} of 5 required inputs completed</span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            <span>{isFormValid ? 'Ready to generate' : 'Complete remaining fields'}</span>
          </div>
        </section>

        <div className="space-y-5">
          <FileUpload file={file} onFileChange={setFile} />
          <PlatformSelector selected={platform} onSelect={setPlatform} />
          <ProjectDetails details={projectDetails} onChange={setProjectDetails} platform={platform} />
          <AdditionalInfo value={additionalInfo} onChange={setAdditionalInfo} />
          <GenerateButtons onGenerate={handleGenerate} disabled={!isFormValid} loading={loading} />
          <StatusDisplay
            status={status}
            result={result}
            error={error}
            onDownload={handleDownload}
            onRetry={handleRetry}
          />
        </div>

        <section className="mt-8 rounded-3xl border border-white/70 bg-white/82 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-xl md:p-8">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-100/70 p-1 text-sm">
            <button
              className={`rounded-full px-5 py-2 font-medium transition ${
                activeTab === 'how-it-works' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('how-it-works')}
            >
              How it Works?
            </button>
            <button
              className={`rounded-full px-5 py-2 font-medium transition ${
                activeTab === 'features' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('features')}
            >
              Features
            </button>
            <button
              className={`rounded-full px-5 py-2 font-medium transition ${
                activeTab === 'contact' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('contact')}
            >
              Contact
            </button>
          </div>

          {activeTab === 'how-it-works' && (
            <div className="mt-6 space-y-4 text-slate-700">
              <h3 className="text-2xl font-semibold text-slate-900">How Gutenberg Works</h3>
              <p className="text-sm text-slate-600 md:text-base">
                End-to-end workflow from SOW ingestion to downloadable architecture documentation.
              </p>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                <li>Upload SOW input in PDF, DOCX, or TXT format (up to 10MB).</li>
                <li>Choose target cloud: AWS or Azure.</li>
                <li>Provide project metadata: project name, client, author, version, and region.</li>
                <li>Add optional implementation notes to include context not present in the SOW.</li>
                <li>Gutenberg extracts SOW text and sends it to Gemini for structured analysis.</li>
                <li>AI output is normalized into architecture-ready sections: scope, requirements, risks, RACI, DR, migration, workloads, security, and SLA inputs.</li>
                <li>Select `Generate HLD` for architectural strategy or `Generate LLD` for implementation-level configuration details.</li>
                <li>Download your generated DOCX package and share with delivery and governance teams.</li>
              </ol>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="mt-6 space-y-5 text-slate-700">
              <h3 className="text-2xl font-semibold text-slate-900">Platform Features</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <p className="text-sm font-semibold text-slate-900">Input and Validation</p>
                  <p className="mt-2 text-sm text-slate-600">SOW upload with drag-and-drop, format checks (.pdf/.docx/.txt), and 10MB max size validation.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <p className="text-sm font-semibold text-slate-900">AI-Powered SOW Analysis</p>
                  <p className="mt-2 text-sm text-slate-600">Gemini-based extraction for executive summary, scope, requirements, constraints, risks, migration and DR strategy.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <p className="text-sm font-semibold text-slate-900">HLD + LLD Generation</p>
                  <p className="mt-2 text-sm text-slate-600">Generates both design levels with sectioned, table-rich, enterprise DOCX output.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <p className="text-sm font-semibold text-slate-900">Cloud Coverage</p>
                  <p className="mt-2 text-sm text-slate-600">Supports AWS and Azure with platform-aware sections for networking, security, and operations.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-900">Support Matrix</p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[380px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2 pr-4 font-medium">Cloud</th>
                        <th className="py-2 pr-4 font-medium">HLD</th>
                        <th className="py-2 font-medium">LLD</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr className="border-b border-slate-100">
                        <td className="py-2 pr-4 font-medium">AWS</td>
                        <td className="py-2 pr-4">Supported</td>
                        <td className="py-2">Supported</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-medium">Azure</td>
                        <td className="py-2 pr-4">Supported</td>
                        <td className="py-2">Supported</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="mt-6 space-y-3 text-sm text-slate-700">
              <h3 className="text-2xl font-semibold text-slate-900">Contact</h3>
              <p>
                <span className="font-medium text-slate-900">Name:</span> Promit Bhattacherjee
              </p>
              <p>
                <span className="font-medium text-slate-900">Email:</span>{' '}
                <a className="text-blue-700 hover:text-blue-800 hover:underline" href="mailto:Promit.b@global.ntt">
                  Promit.b@global.ntt
                </a>
              </p>
              <p>
                <span className="font-medium text-slate-900">Follow me on X:</span>{' '}
                <a
                  className="text-blue-700 hover:text-blue-800 hover:underline"
                  href="https://x.com/PromitXi"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://x.com/PromitXi
                </a>
              </p>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="reveal-on-scroll rounded-2xl border border-white/70 bg-white/82 p-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
            <img src="/images/documents.svg" alt="Structured document output" className="h-48 w-full rounded-xl object-cover" />
            <p className="px-2 pb-2 pt-3 text-sm font-medium text-slate-700">Structured HLD and LLD document output</p>
          </article>
          <article className="reveal-on-scroll rounded-2xl border border-white/70 bg-white/82 p-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
            <img src="/images/files.svg" alt="SOW file processing flow" className="h-48 w-full rounded-xl object-cover" />
            <p className="px-2 pb-2 pt-3 text-sm font-medium text-slate-700">SOW file processing and extraction pipeline</p>
          </article>
          <article className="reveal-on-scroll rounded-2xl border border-white/70 bg-white/82 p-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
            <img src="/images/charts.svg" alt="Architecture metrics and planning charts" className="h-48 w-full rounded-xl object-cover" />
            <p className="px-2 pb-2 pt-3 text-sm font-medium text-slate-700">Architecture insights, plans, and charts</p>
          </article>
        </section>
      </main>

      <footer className="px-4 pb-8 text-center text-xs text-slate-500">Gutenberg | Made for NTT Public Cloud Team</footer>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState(getCurrentView());

  useEffect(() => {
    const sync = () => setView(getCurrentView());
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  const openWorkspace = () => {
    window.location.hash = '/app';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView('app');
  };

  const openLanding = () => {
    window.location.hash = '/';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView('landing');
  };

  return view === 'app' ? <WorkspacePage onBack={openLanding} /> : <LandingPage onEnter={openWorkspace} />;
}
