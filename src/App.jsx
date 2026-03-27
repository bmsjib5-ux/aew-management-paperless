import { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { MembersProvider } from './context/MembersContext';
import { InstallationsProvider } from './context/InstallationsContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TeamDirectory from './components/TeamDirectory';
import LeaveManagement from './components/LeaveManagement';
import SiteManagement from './components/SiteManagement';
import InstallationCoordination from './components/InstallationCoordination';
import ResourcePlanning from './components/ResourcePlanning';
import OrgChart from './components/OrgChart';
import Notifications from './components/Notifications';
import ProjectTimeline from './components/ProjectTimeline';
import ProjectSummary from './components/ProjectSummary';
import Settings from './components/Settings';

export default function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <Dashboard onMenuChange={setActiveMenu} />;
      case 'team': return <TeamDirectory />;
      case 'leave': return <LeaveManagement />;
      case 'sites': return <SiteManagement />;
      case 'installation': return <InstallationCoordination />;
      case 'resource': return <ResourcePlanning />;
      case 'health': return <LeaveManagement />;
      case 'orgchart': return <OrgChart />;
      case 'notifications': return <Notifications />;
      case 'timeline': return <ProjectTimeline />;
      case 'summary': return <ProjectSummary />;
      case 'settings': return <Settings />;
      default: return <Dashboard onMenuChange={setActiveMenu} />;
    }
  };

  return (
    <SettingsProvider>
    <MembersProvider>
    <InstallationsProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
        <main className="flex-1 overflow-auto scrollbar-thin">
          {renderContent()}
        </main>
      </div>
    </InstallationsProvider>
    </MembersProvider>
    </SettingsProvider>
  );
}
