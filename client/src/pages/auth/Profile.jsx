import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Calendar, CreditCard, Camera, Save, Edit2, CheckCircle, AlertCircle, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import DashboardLayout from '../../layouts/DashboardLayout';

const TiltCard = ({ children, className = "" }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const onMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - card.top) / card.height - 0.5;
    const y = (e.clientX - card.left) / card.width - 0.5;
    setRotate({ x: x * 15, y: y * -15 });
  };
  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative group perspective-1000 ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div style={{ transform: "translateZ(30px)" }}>{children}</div>
    </motion.div>
  );
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNo: '',
    aadharNo: '',
    dob: '',
    profilePhoto: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobileNo: user.mobileNo || '',
        aadharNo: user.aadharNo || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        profilePhoto: user.profilePhoto || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    setLoading(true);
    try {
      const { data } = await api.post('/upload/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, profilePhoto: data.url }));
      setMsg({ type: 'success', text: 'Identity Manifest: Photo Synchronized.' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Uplink Failed: Media transmission interrupted.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const { data } = await api.put('/auth/update-profile', formData);
      setUser(data.user);
      localStorage.setItem('vitam_user', JSON.stringify(data.user));
      setEditing(false);
      setMsg({ type: 'success', text: 'Sovereign Node Updated: Profile Manifest Committed.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.msg || 'Update Protocol Failure.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Identity Hub" role={user?.role}>
      <div className="relative pb-24 font-['Outfit'] overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-16 gap-8">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative group">
                <TiltCard>
                  <div className="w-48 h-48 rounded-[60px] bg-[#050505] border border-white/10 p-1 shadow-[0_40px_100px_rgba(0,113,227,0.2)] relative overflow-hidden">
                    {formData.profilePhoto ? (
                      <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover rounded-[58px]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                        <User size={64} className="text-white/10" />
                      </div>
                    )}
                    {editing && (
                      <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                        <Camera className="text-white" size={32} />
                        <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                      </label>
                    )}
                  </div>
                </TiltCard>
                <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-3xl bg-blue-600 border-[6px] border-[#020202] flex items-center justify-center shadow-2xl">
                   <ShieldCheck size={20} className="text-white" />
                </div>
              </div>
              
              <div className="text-center md:text-left space-y-4">
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">{formData.name || 'Scholar'}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center">
                  <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] px-5 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                    {user?.role?.toUpperCase()} CORE
                  </p>
                  <span className="text-white/20 font-black text-[10px] uppercase tracking-widest italic">Identity Certified</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setEditing(!editing)}
              className={`px-8 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 ${
                editing 
                ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
                : 'bg-white text-black hover:bg-blue-500 hover:text-white shadow-xl shadow-white/5'
              }`}
            >
              {editing ? <><AlertCircle size={16}/> Abort Update</> : <><Edit2 size={16}/> Modify Manifest</>}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {msg.text && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`mb-12 p-6 rounded-[35px] border flex items-center justify-between gap-4 ${
                  msg.type === 'success' 
                  ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' 
                  : 'bg-red-500/5 border-red-500/10 text-red-400'
                }`}
              >
                <div className="flex items-center gap-4">
                  {msg.type === 'success' ? <CheckCircle size={24}/> : <AlertCircle size={24}/>}
                  <span className="text-xs font-black uppercase tracking-[0.2em]">{msg.text}</span>
                </div>
                <button onClick={() => setMsg({ ...msg, text: '' })} className="text-white/20 hover:text-white"><AlertCircle size={16}/></button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Main Data Column */}
            <div className="lg:col-span-12 space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    { label: 'Legal Designation', key: 'name', icon: User, placeholder: 'Enter Full Name' },
                    { label: 'Institutional Link', key: 'email', icon: Mail, readOnly: true },
                    { label: 'Secure Mobile', key: 'mobileNo', icon: Phone, placeholder: '+91 00000 00000' },
                    { label: 'Identity Token (Aadhar)', key: 'aadharNo', icon: CreditCard, placeholder: 'XXXX XXXX XXXX' },
                    { label: 'Temporal Origin', key: 'dob', icon: Calendar, type: 'date' },
                  ].map((field, i) => (
                    <TiltCard key={i}>
                       <div className={`p-10 bg-black/40 border border-white/5 rounded-[50px] backdrop-blur-3xl group/field hover:border-blue-500/30 transition-all flex flex-col justify-between h-48 relative overflow-hidden ${field.readOnly ? 'opacity-50' : ''}`}>
                          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover/field:bg-blue-500/10 transition-colors" />
                          <div className="flex justify-between items-center mb-6 relative z-10">
                             <div className="flex items-center gap-3">
                                <field.icon size={16} className="text-white/20 group-hover/field:text-blue-500 transition-colors" />
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] group-hover/field:text-white/40">{field.label}</span>
                             </div>
                             {field.readOnly && <Lock size={12} className="text-white/10" />}
                          </div>
                          <input 
                            type={field.type || 'text'}
                            name={field.key}
                            value={field.key === 'dob' && formData[field.key] ? formData[field.key].split('T')[0] : formData[field.key]}
                            onChange={handleChange}
                            readOnly={field.readOnly || !editing}
                            placeholder={field.placeholder}
                            className={`bg-transparent text-2xl font-black text-white outline-none w-full relative z-10 ${field.readOnly || !editing ? 'cursor-not-allowed' : 'focus:text-blue-500'}`}
                          />
                       </div>
                    </TiltCard>
                  ))}

                  {/* Commit Action Placeholder / Call to Action */}
                  <div className="lg:col-span-1 flex items-center justify-center">
                    {editing && (
                      <motion.button 
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full h-full bg-blue-600 hover:bg-blue-500 text-white rounded-[50px] font-black uppercase tracking-[0.6em] text-[11px] shadow-[0_40px_100px_rgba(0,113,227,0.3)] transition-all flex flex-col items-center justify-center gap-6 p-8 group min-h-[192px]"
                      >
                         <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-all">
                            {loading ? <Loader2 className="animate-spin" size={32}/> : <Save size={32}/>}
                         </div>
                         Commit To Ledger
                      </motion.button>
                    )}
                  </div>
               </div>

               {/* Institutional Footnote */}
               <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-white/5 rounded-[40px] p-12 flex flex-col md:flex-row items-center gap-10">
                  <div className="w-20 h-20 rounded-[30px] bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-2xl">
                    <ShieldCheck size={40} />
                  </div>
                  <div className="space-y-4 flex-1">
                    <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">Vitam OS Integrity System</h4>
                    <p className="text-white/30 text-xs font-bold leading-relaxed uppercase tracking-widest max-w-2xl">
                      Your identity manifest is protected by sovereign biometric linkage and post-quantum encryption standards. 
                      Every modification is audited and recorded in the secure security ledger.
                    </p>
                  </div>
               </div>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
