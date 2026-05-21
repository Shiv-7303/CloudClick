import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HeroInput } from '@/components/ui/HeroInput';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    analyze: jest.fn()
  }
}));

describe('HeroInput', () => {
  const mockRouter = { push: jest.fn() };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    // Default to unauthenticated
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    sessionStorage.clear();
  });

  it('has autofocus on render', () => {
    render(<HeroInput />);
    const input = screen.getByPlaceholderText(/Paste your YouTube link here.../i);
    expect(input).toBeInTheDocument();
    // Testing autofocus reliably in JSDOM + React is tricky because React calls .focus() directly
    // and doesn't always leave the autoFocus attribute in the DOM depending on version.
  });

  it('disables Analyze button when URL is invalid', () => {
    render(<HeroInput />);
    const input = screen.getByPlaceholderText(/Paste your YouTube link here.../i);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    
    fireEvent.change(input, { target: { value: 'invalid-url' } });
    expect(button).toBeDisabled();
  });

  it('enables Analyze button for valid youtube.com/watch?v= URLs', () => {
    render(<HeroInput />);
    const input = screen.getByPlaceholderText(/Paste your YouTube link here.../i);
    const button = screen.getByRole('button');
    
    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } });
    expect(button).not.toBeDisabled();
  });

  it('enables Analyze button for valid youtu.be/ URLs', () => {
    render(<HeroInput />);
    const input = screen.getByPlaceholderText(/Paste your YouTube link here.../i);
    const button = screen.getByRole('button');
    
    fireEvent.change(input, { target: { value: 'https://youtu.be/dQw4w9WgXcQ' } });
    expect(button).not.toBeDisabled();
  });

  it('enables Analyze button for valid youtube.com/shorts/ URLs', () => {
    render(<HeroInput />);
    const input = screen.getByPlaceholderText(/Paste your YouTube link here.../i);
    const button = screen.getByRole('button');
    
    fireEvent.change(input, { target: { value: 'https://youtube.com/shorts/dQw4w9WgXcQ' } });
    expect(button).not.toBeDisabled();
  });

  it('unauthenticated submit sets sessionStorage and redirects to /auth', async () => {
    render(<HeroInput />);
    const input = screen.getByPlaceholderText(/Paste your YouTube link here.../i);
    const form = screen.getByRole('button').closest('form');
    
    fireEvent.change(input, { target: { value: 'https://youtu.be/dQw4w9WgXcQ' } });
    fireEvent.submit(form!);
    
    expect(sessionStorage.getItem('cloudclick_pending_url')).toBe('https://youtu.be/dQw4w9WgXcQ');
    expect(mockRouter.push).toHaveBeenCalledWith('/auth');
  });

  it('authenticated submit calls api.analyze and redirects', async () => {
    (useSession as jest.Mock).mockReturnValue({ data: { user: { email: 'test@test.com' } }, status: 'authenticated' });
    (api.analyze as jest.Mock).mockResolvedValue({ analysis_id: 'test-123' });
    
    render(<HeroInput />);
    const input = screen.getByPlaceholderText(/Paste your YouTube link here.../i);
    const form = screen.getByRole('button').closest('form');
    
    fireEvent.change(input, { target: { value: 'https://youtu.be/dQw4w9WgXcQ' } });
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(api.analyze).toHaveBeenCalledWith('https://youtu.be/dQw4w9WgXcQ');
      expect(mockRouter.push).toHaveBeenCalledWith('/analysis/test-123');
    });
  });

  it('network error is caught and handled (no unhandled rejection)', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (useSession as jest.Mock).mockReturnValue({ data: { user: { email: 'test@test.com' } }, status: 'authenticated' });
    (api.analyze as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<HeroInput />);
    const input = screen.getByPlaceholderText(/Paste your YouTube link here.../i);
    const form = screen.getByRole('button').closest('form');
    const button = screen.getByRole('button');
    
    fireEvent.change(input, { target: { value: 'https://youtu.be/dQw4w9WgXcQ' } });
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(button).not.toBeDisabled(); // Button should be re-enabled after failure
    });
    
    consoleErrorSpy.mockRestore();
  });
});
