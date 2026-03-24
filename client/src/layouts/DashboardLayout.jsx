import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CommandPalette from '../components/CommandPalette';
import GlobalComms from '../components/ui/GlobalComms';
import { ToastProvider } from '../components/ui/ToastSystem';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children, title, role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCommsOpen, setIsCommsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ToastProvider userRole={user?.role}>
      <div className="min-h-screen bg-[var(--apple-bg)] flex transition-colors duration-500 overflow-x-hidden">
        <GlobalComms isOpen={isCommsOpen} onClose={() => setIsCommsOpen(false)} />
        <CommandPalette 
          isOpen={isCommandPaletteOpen} 
          onClose={() => setIsCommandPaletteOpen(false)} 
        />
        
        <Sidebar 
          role={role} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64'} ml-0`}> 
          <Navbar 
            title={title} 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            onCommsClick={() => setIsCommsOpen(true)}
          />
          
          <main className="pt-24 px-4 md:px-8 pb-12 w-full overflow-x-hidden">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};

export default DashboardLayout;
