import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Download, DatabaseZap, Loader2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import api from '../../utils/api';
import { useToast } from '../../components/ui/ToastSystem';

export default function BulkImport() {
  const { push } = useToast();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      push({
        type: 'warning',
        title: 'Select a CSV First',
        body: 'Choose an institutional CSV file before starting the bulk import pipeline.'
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setResults(null);

    try {
      const { data } = await api.post('/import/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResults(data);
      push({
        type: 'success',
        title: 'Bulk Import Completed',
        body: data?.msg || 'Institutional roster import finished successfully.'
      });
    } catch (err) {
      push({
        type: 'error',
        title: 'Bulk Import Failed',
        body: err.response?.data?.msg || err.message || 'Unable to process the CSV import right now.'
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "name,email,role,department,subRole\nJohn Doe,john@vitam.edu,STUDENT,CSE,none\nDr. Jane Smith,jane@vitam.edu,FACULTY,ECE,none";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vitam_onboarding_template.csv';
    a.click();
  };

  return (
    <DashboardLayout title="Institutional Onboarding" role="ADMIN">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-1">Scale Management</p>
            <h2 className="text-3xl font-black text-white tracking-tight">Bulk User Acquisition</h2>
            <p className="text-slate-400 font-medium mt-1">Onboard thousands of students and faculty via institutional CSV pipelines</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-black hover:text-white transition-all"
          >
            <Download size={14} />
            Download Template
          </motion.button>
        </div>

        <GlassCard icon={Upload} title="CSV Pipeline" subtitle="Drop your institutional roster below">
          <div className="p-8 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-6 group hover:border-blue-500/50 transition-all">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            
            <div className="text-center">
              <p className="text-white font-black uppercase tracking-widest mb-2">
                {file ? file.name : "Select Institutional CSV"}
              </p>
              <p className="text-slate-500 text-xs font-medium">Supported formats: .csv (UTF-8)</p>
            </div>

            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              className="hidden" 
              id="csv-upload" 
            />
            
            <div className="flex gap-4">
              <label 
                htmlFor="csv-upload"
                className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] cursor-pointer hover:bg-white/10 transition-all"
              >
                Choose File
              </label>
              
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DatabaseZap size={14} />
                    Execute Import
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </GlassCard>

        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                  <div className="flex items-center gap-3 text-emerald-400 mb-2">
                    <CheckCircle size={20} />
                    <span className="font-black uppercase tracking-widest text-xs">Success Rate</span>
                  </div>
                  <p className="text-4xl font-black text-white">{results.msg.match(/\d+/)[0]}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Users Onboarded Successfully</p>
                </div>

                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl">
                  <div className="flex items-center gap-3 text-red-400 mb-2">
                    <AlertCircle size={20} />
                    <span className="font-black uppercase tracking-widest text-xs">Failure Rate</span>
                  </div>
                  <p className="text-4xl font-black text-white">{results.msg.match(/Errors: (\d+)/)[1]}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Identified Inconsistencies</p>
                </div>
              </div>

              {results.errors && (
                <GlassCard title="Error Log" subtitle="Detailed breakdown of processing failures" icon={AlertCircle}>
                  <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {results.errors.map((err, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                        <span className="text-xs font-mono text-red-300">{err.row}</span>
                        <span className="text-[10px] font-black uppercase text-red-500/60">{err.msg}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-amber-500 font-black uppercase tracking-widest text-[10px] mb-1">Important Notice</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              All imported users will have the default password set to <span className="text-white font-black">vitam123</span>. They will be prompted to change this and set up mandatory MFA (Mobile/Biometric) during their first heartbeat sync.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
