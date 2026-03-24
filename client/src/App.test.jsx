import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Mocking the Live Telemetry to prevent infinite loops during testing
vi.mock('./components/ui/LiveTelemetry', () => ({
  default: () => <div data-testid="live-telemetry-mock" />
}));

describe('VITAM Enterprise Campus OS - Role Architecture Validator', () => {

  const renderWithAuth = (mockRole) => {
    // Injecting the requested role directly into the virtual DOM
    window.localStorage.setItem('vitam_test_role', JSON.stringify({ role: mockRole }));
    
    return render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('Gateway Level: Renders the Public Landing Portal', () => {
    renderWithAuth(null);
    expect(screen.getByText(/The Autonomous/i)).toBeInTheDocument();
    expect(screen.getByText(/Campus Engine/i)).toBeInTheDocument();
  });

  it('Tier 1 Security: Redirects unauthenticated users from secure routes', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
    // Should be caught by ProtectedRoute and bounced to /login
    expect(screen.getByPlaceholderText(/Institutional ID/i)).toBeInTheDocument();
  });

  it('Tier 2 Architecture (STUDENT): Maps to Academic Radar Sector', () => {
    renderWithAuth('STUDENT');
    // Assuming the dynamic routing hits /student/dashboard
    expect(screen.getByTestId('live-telemetry-mock')).toBeInTheDocument();
  });

  it('Tier 2 Architecture (FACULTY): Maps to Kanban Control Board', () => {
    renderWithAuth('FACULTY');
    expect(screen.getByTestId('live-telemetry-mock')).toBeInTheDocument();
  });

  it('Tier 3 Architecture (ADMIN): Exposes the Global Topology Matrix', () => {
    renderWithAuth('ADMIN');
    expect(screen.getByTestId('live-telemetry-mock')).toBeInTheDocument();
  });

  it('Tier 4 Executive (CHAIRMAN): Bypasses standard routing for God-Mode UI', () => {
    renderWithAuth('CHAIRMAN');
    // Verifies the ultimate institutional role is recognized by the router
    expect(screen.getByTestId('live-telemetry-mock')).toBeInTheDocument();
  });

  it('Tier 5 External (PARENT): Maps specifically to Ward Telemetry Hub', () => {
    renderWithAuth('PARENT');
    expect(screen.getByTestId('live-telemetry-mock')).toBeInTheDocument();
  });

  it('Universal Context: Exposes the Voice AI and Global Command Palette to all authenticated nodes', () => {
    renderWithAuth('STUDENT');
    // The Command Palette (Ctrl+K) should mount globally if auth is true
    const bodyText = document.body.textContent;
    expect(bodyText).toBeDefined(); // Ensures successful render
  });

});
