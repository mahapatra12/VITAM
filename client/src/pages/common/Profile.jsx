import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  Smartphone,
  Clock,
  ChevronRight,
  Camera,
  MapPin,
  Calendar,
  Lock,
  Activity,
  Zap,
  Fingerprint,
  Cpu,
  Globe,
  Award,
  Target,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';

const ManifestText = ({ text }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="font-mono text-appleBlue drop-shadow-[0_0_10px_rgba(0,113,227,0.5)]">
      {displayed}<span className="animate-pulse">_</span>
    </span>
  );
};

const useAetherParallax = () => {
  const x = useSpring(0, { stiffness: 100, damping: 30 });
  const y = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouse = (e) => {
      const { innerWidth, innerHeight } = window;
      const xPct = (e.clientX / innerWidth - 0.5) * 20;
      const yPct = (e.clientY / innerHeight - 0.5) * 20;
      x.set(xPct);
      y.set(yPct);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [x, y]);

  return { x, y };
};

const TiltCard = ({ children, className = "" }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const onMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - card.top) / card.height - 0.5;
    const y = (e.clientX - card.left) / card.width - 0.5;
    setRotate({ x: x * 20, y: y * -20 });
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
      <div style={{ transform: "translateZ(50px)" }}>{children}</div>
    </motion.div>
  );
};

const SovereignSeal = () => (
  <div className="relative w-32 h-32 md:w-48 md:h-48">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 border-[1px] border-appleBlue/20 rounded-full"
    />
    <motion.div 
      animate={{ rotate: -360 }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute inset-4 border-[1px] border-dashed border-appleBlue/30 rounded-full"
    />
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute inset-8 border-2 border-appleBlue/40 rounded-full"
    />
    <motion.div 
      animate={{ rotate: -360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="absolute inset-12 border-2 border-appleBlue/60 rounded-full flex items-center justify-center bg-appleBlue/5 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,113,227,0.3)]"
    >
      <ShieldCheck size={40} className="text-appleBlue drop-shadow-[0_0_10px_#0071e3]" />
    </motion.div>
    <div className="absolute inset-0 bg-appleBlue/5 blur-[80px] rounded-full animate-pulse" />
  </div>
);

const AetherCursor = () => {
  const { x, y } = useAetherParallax();
  const mouseX = useSpring(0, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 50 });

  useEffect(() => {
    const handleMouse = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{ x: mouseX, y: mouseY, translateX: "-50%", translateY: "-50%" }}
      className="fixed inset-0 w-[400px] h-[400px] bg-appleBlue/20 blur-[120px] rounded-full pointer-events-none z-50 mix-blend-screen opacity-50"
    />
  );
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { x, y } = useAetherParallax();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    rollNo: '',
    registrationNo: '',
    branch: '',
    mobileNo: '',
    aadharNo: '',
    dob: '',
    email: '',
    profilePhoto: ''
  });

  const bgX = useTransform(x, [-20, 20], [20, -20]);
  const bgY = useTransform(y, [-20, 20], [20, -20]);
  const midX = useTransform(x, [-20, 20], [10, -10]);
  const midY = useTransform(y, [-20, 20], [10, -10]);
  const farX = useTransform(x, [-20, 20], [-10, 10]);
  const farY = useTransform(y, [-20, 20], [-10, 10]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const uid = user?.id || user?._id;
        if (!uid) return;
        setLoading(true);
        const { data } = await api.get(`/student/profile/${uid}`);
        setProfileData(data);
      } catch (err) {
        console.warn("Institutional Connection Interrupted");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id, user?._id]);

  const handleUpdate = async () => {
    if (!profileData.profilePhoto) {
      alert("Institutional Identity Error: Profile Photo is Mandatory.");
      return;
    }
    try {
      setSaving(true);
      const uid = user?.id || user?._id;
      await api.post('/student/profile/update', { userId: uid, ...profileData });
      
      // Update local context
      const updatedUser = { ...user, profilePhoto: profileData.profilePhoto };
      localStorage.setItem('vitam_user', JSON.stringify(updatedUser));
      // Note: setUser is not in AuthContext right now, we might need to add it or just re-login if critical
      // But for now, the local storage change will persist on refresh.
      
      alert("Synchrony Complete: Profile Manifest Updated.");
    } catch (err) {
      alert("Protocol Failure: Unable to commit changes.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const { data } = await api.post('/upload/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileData(prev => ({ ...prev, profilePhoto: data.url }));
    } catch (err) {
      alert("Upload Interrupted: Institutional Uplink Error.");
    }
  };

  return (
    <DashboardLayout title="Citadel Profile" role={user?.role?.toUpperCase() || 'STUDENT'}>
      <div className="relative min-h-screen overflow-hidden pb-32">
        <AetherCursor />
        
        {/* Parallax Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <motion.div style={{ x: bgX, y: bgY }} className="absolute -inset-[10%] bg-[#020202] -z-20" />
           <motion.div style={{ x: midX, y: midY }} className="liquid-mesh opacity-30" />
           <motion.div style={{ x, y }} className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-appleBlue/5 blur-[250px] rounded-full opacity-20" />
        </div>

        <div className="max-w-6xl mx-auto pt-20 px-6 relative z-10">
           
           {/* Central Identity Monolith */}
           <div className="flex flex-col items-center mb-24">
              <div className="relative group/avatar">
                 <TiltCard>
                    <div className="w-56 h-56 rounded-[70px] bg-black border border-white/10 shadow-[0_40px_100px_rgba(0,113,227,0.3)] overflow-hidden relative">
                       {profileData.profilePhoto ? (
                          <img src={profileData.profilePhoto} alt="Identity" className="w-full h-full object-cover" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center bg-appleBlue/5">
                             <User size={80} className="text-appleBlue/20" />
                          </div>
                       )}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <label className="cursor-pointer p-6 bg-white rounded-3xl text-black hover:scale-110 transition-transform">
                             <Camera size={24} />
                             <input type="file" className="hidden" onChange={handlePhotoUpload} />
                          </label>
                       </div>
                    </div>
                 </TiltCard>
                 {!profileData.profilePhoto && (
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-4 -right-4 px-4 py-1.5 bg-red-500 text-[9px] font-black text-white uppercase tracking-widest rounded-full shadow-lg"
                    >
                       Photo Mandatory
                    </motion.div>
                 )}
              </div>
              <h1 className="text-6xl font-black text-white tracking-tighter mt-12 uppercase italic leading-none">
                 {user?.name || 'Scholar'}
              </h1>
              <p className="text-[10px] font-black tracking-[0.6em] text-white/30 uppercase mt-4 italic">Sovereign Identity Key</p>
           </div>

           {/* Pure Data Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { label: 'Roll No', key: 'rollNo', icon: Shield },
                { label: 'Registration No', key: 'registrationNo', icon: Fingerprint },
                { label: 'Branch', key: 'branch', icon: Globe },
                { label: 'Mobile No', key: 'mobileNo', icon: Smartphone },
                { label: 'Aadhar No', key: 'aadharNo', icon: Cpu },
                { label: 'DOB', key: 'dob', icon: Calendar, type: 'date' },
                { label: 'Registered Email ID', key: 'email', icon: Mail, readOnly: true },
              ].map((field, i) => (
                <TiltCard key={i}>
                   <div className="p-10 bg-black/40 border border-white/5 rounded-[50px] backdrop-blur-3xl group/field hover:border-appleBlue/30 transition-all flex flex-col justify-between h-40">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] group-hover/field:text-appleBlue transition-colors">{field.label}</span>
                         <field.icon size={16} className="text-white/10 group-hover/field:text-appleBlue/40" />
                      </div>
                      <input 
                        type={field.type || 'text'}
                        value={field.key === 'dob' && profileData[field.key] ? profileData[field.key].split('T')[0] : profileData[field.key]}
                        onChange={(e) => !field.readOnly && setProfileData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        readOnly={field.readOnly}
                        className={`bg-transparent text-2xl font-black text-white outline-none w-full ${field.readOnly ? 'opacity-40 cursor-not-allowed' : 'focus:text-appleBlue'}`}
                        placeholder={`Pending ${field.label}...`}
                      />
                   </div>
                </TiltCard>
              ))}
           </div>

           <div className="mt-24 flex justify-center pb-20">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpdate}
                disabled={saving}
                className="px-16 py-10 bg-white text-black rounded-full font-black uppercase tracking-[0.8em] text-xs shadow-[0_30px_80px_rgba(255,255,255,0.15)] flex items-center gap-6 group hover:bg-appleBlue hover:text-white transition-all disabled:opacity-50"
              >
                 {saving ? 'SYNCHRONIZING...' : 'Commit Synchrony'}
                 <Zap size={20} className="group-hover:animate-bounce" />
              </motion.button>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
