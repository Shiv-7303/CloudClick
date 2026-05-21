import { render, screen, fireEvent, act } from '@testing-library/react';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { useRouter } from 'next/navigation';

describe('UpgradeModal', () => {
  const mockRouter = { push: jest.fn() };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders on upgrade_required event', () => {
    render(<UpgradeModal />);
    
    // Initially not visible
    expect(screen.queryByText(/Upgrade Required/i)).not.toBeInTheDocument();
    
    // Dispatch event
    act(() => {
      window.dispatchEvent(new CustomEvent('upgrade_required', { detail: 'Test limit message' }));
    });
    
    expect(screen.getByText(/Upgrade Required/i)).toBeInTheDocument();
    expect(screen.getByText('Test limit message')).toBeInTheDocument();
  });

  it('Upgrade CTA is present and routes to pricing', () => {
    render(<UpgradeModal />);
    act(() => {
      window.dispatchEvent(new CustomEvent('upgrade_required'));
    });
    
    const upgradeBtn = screen.getByRole('button', { name: /Upgrade to Creator/i });
    expect(upgradeBtn).toBeInTheDocument();
    
    fireEvent.click(upgradeBtn);
    expect(mockRouter.push).toHaveBeenCalledWith('/pricing');
  });

  it('Dismiss closes modal', () => {
    render(<UpgradeModal />);
    act(() => {
      window.dispatchEvent(new CustomEvent('upgrade_required'));
    });
    
    // Assuming the dismiss button is the first button (the X icon)
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons[0]; 
    
    act(() => {
      fireEvent.click(closeBtn);
    });
    expect(screen.queryByText(/Upgrade Required/i)).not.toBeInTheDocument();
  });
});
