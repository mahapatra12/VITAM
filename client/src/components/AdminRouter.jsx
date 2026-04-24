import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Spinner from './ui/Spinner';
import lazySimple from '../utils/lazySimple';

const Motion = motion;

const PrincipalDashboard = lazySimple(() => import('../pages/admin/PrincipalDashboard'));
const FinanceDashboard = lazySimple(() => import('../pages/admin/FinanceDashboard'));
const HodDashboard = lazySimple(() => import('../pages/hod/Dashboard'));
const AdminDashboard = lazySimple(() => import('../pages/admin/Dashboard'));
const PlacementDashboard = lazySimple(() => import('../pages/admin/PlacementDashboard'));
const ExamDashboard = lazySimple(() => import('../pages/admin/ExamDashboard'));
const BusDashboard = lazySimple(() => import('../pages/admin/BusDashboard'));

export default function AdminRouter() {
    const { user } = useAuth();

    const renderSubsystem = () => {
        const subRole = user?.subRole?.toLowerCase();
        
        switch (subRole) {
            case 'principal':
            case 'director':
            case 'vice_principal':
                return <PrincipalDashboard />;
            case 'finance':
                return <FinanceDashboard />;
            case 'hod':
                return <HodDashboard />;
            case 'placement':
                return <PlacementDashboard />;
            case 'exam':
                return <ExamDashboard />;
            case 'bus':
                return <BusDashboard />;
            default:
                return <AdminDashboard />;
        }
    };

    return (
        <Motion.div
            key={`resolved-subsystem-${user?.subRole || 'admin'}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
        >
            <Suspense fallback={<Spinner label="Loading role workspace" />}>
                {renderSubsystem()}
            </Suspense>
        </Motion.div>
    );
}
