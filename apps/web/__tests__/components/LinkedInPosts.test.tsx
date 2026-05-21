import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LinkedInPosts } from '@/components/ui/LinkedInPosts';

const mockAnalysis = {
  linkedin_post_v1: 'V1 Content',
  linkedin_post_v2: 'V2 Content',
  linkedin_post_v3: 'V3 Content'
};

describe('LinkedInPosts', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('Free tier: 1 unblurred post + 2 blurred with upgrade overlay', () => {
    render(<LinkedInPosts analysis={mockAnalysis} tier="free" />);
    
    const v1Tab = screen.getByTestId('tab-v1');
    const v2Tab = screen.getByTestId('tab-v2');
    
    // Click v2
    fireEvent.click(v2Tab);
    
    const content = screen.getByTestId('post-content');
    expect(content).toHaveClass('blur-sm');
    expect(screen.getByTestId('upgrade-overlay')).toBeInTheDocument();
    
    // Click v1
    fireEvent.click(v1Tab);
    expect(content).not.toHaveClass('blur-sm');
    expect(screen.queryByTestId('upgrade-overlay')).not.toBeInTheDocument();
  });

  it('Creator: 3 tab buttons visible and content not blurred', () => {
    render(<LinkedInPosts analysis={mockAnalysis} tier="creator" />);
    
    const v1Tab = screen.getByTestId('tab-v1');
    const v2Tab = screen.getByTestId('tab-v2');
    const v3Tab = screen.getByTestId('tab-v3');
    
    expect(v1Tab).toBeInTheDocument();
    expect(v2Tab).toBeInTheDocument();
    expect(v3Tab).toBeInTheDocument();
    
    fireEvent.click(v2Tab);
    const content = screen.getByTestId('post-content');
    expect(content).not.toHaveClass('blur-sm');
    expect(screen.queryByTestId('upgrade-overlay')).not.toBeInTheDocument();
  });

  it('Copy button calls navigator.clipboard.writeText', async () => {
    render(<LinkedInPosts analysis={mockAnalysis} tier="creator" />);
    
    const copyBtn = screen.getByTestId('copy-btn');
    fireEvent.click(copyBtn);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('V1 Content');
  });
});
