import { render, screen, fireEvent } from '@testing-library/react';
import { TwitterThread } from '@/components/ui/TwitterThread';

describe('TwitterThread', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('Tweets > 280 chars show red counter', () => {
    const longText = "A".repeat(300);
    const thread = [
      { text: 'Short tweet', position: 1 },
      { text: longText, position: 2 }
    ];
    
    render(<TwitterThread thread={thread} />);
    
    const counters = screen.getAllByTestId('char-counter');
    expect(counters[0]).not.toHaveClass('text-negative');
    expect(counters[1]).toHaveClass('text-negative');
  });

  it('Copy all concatenates tweets correctly', () => {
    const thread = [
      { text: 'Tweet 1', position: 1 },
      { text: 'Tweet 2', position: 2 }
    ];
    
    render(<TwitterThread thread={thread} />);
    
    const copyAllBtn = screen.getByTestId('copy-all-btn');
    fireEvent.click(copyAllBtn);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Tweet 1\n\nTweet 2');
  });
});
