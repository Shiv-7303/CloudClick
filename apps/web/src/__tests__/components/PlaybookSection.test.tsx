import { render, screen, fireEvent } from '@testing-library/react'
import { PlaybookSection } from '@/components/ui/PlaybookSection'
import { PlaybookDay } from '@/types'

const mockPlaybook3Days: PlaybookDay[] = [
  { day: 1, content_type: 'Contrarian Post', hook: 'Stop following generic advice.', angle: 'Challenge the norm.', format: 'Talking Head Reel' },
  { day: 2, content_type: 'Educational', hook: 'The framework nobody teaches:', angle: 'Teach step by step.', format: 'Whiteboard Reel' },
  { day: 3, content_type: 'Story Post', hook: 'I almost quit because of this.', angle: 'Personal story angle.', format: 'Facecam Reel' },
]

const mockPlaybook7Days: PlaybookDay[] = [
  ...mockPlaybook3Days,
  { day: 4, content_type: 'Hot Take', hook: 'Unpopular opinion:', angle: 'Hot take angle.', format: 'Talking Head Reel' },
  { day: 5, content_type: 'Relatable', hook: 'POV: You are stuck again.', angle: 'Relatable pain.', format: 'Meme Reel' },
  { day: 6, content_type: 'Authority Post', hook: '5 lessons after 3 years:', angle: 'Authority claim.', format: 'Talking Head Reel' },
  { day: 7, content_type: 'Carousel', hook: '7 mistakes I made:', angle: 'List lessons.', format: 'Instagram Carousel' },
]

describe('PlaybookSection', () => {
  it('renders null playbook with re-analyze message', () => {
    render(<PlaybookSection playbook={null} userTier="free" analysisId="test-id" />)
    expect(screen.getByText(/re-analyze/i)).toBeInTheDocument()
  })

  it('renders empty playbook with re-analyze message', () => {
    render(<PlaybookSection playbook={[]} userTier="free" analysisId="test-id" />)
    expect(screen.getByText(/re-analyze/i)).toBeInTheDocument()
  })

  it('renders 3 days for free user', () => {
    render(<PlaybookSection playbook={mockPlaybook3Days} userTier="free" analysisId="test-id" />)
    expect(screen.getByText('Day 1')).toBeInTheDocument()
    expect(screen.getByText('Day 2')).toBeInTheDocument()
    expect(screen.getByText('Day 3')).toBeInTheDocument()
  })

  it('shows locked days 4-7 for free users', () => {
    render(<PlaybookSection playbook={mockPlaybook3Days} userTier="free" analysisId="test-id" />)
    // Locked day cards should show upgrade prompt
    expect(screen.getAllByText(/Upgrade — ₹499\/mo/i).length).toBeGreaterThan(0)
  })

  it('renders all 7 days for creator user', () => {
    render(<PlaybookSection playbook={mockPlaybook7Days} userTier="creator" analysisId="test-id" />)
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByText(`Day ${i}`)).toBeInTheDocument()
    }
  })

  it('does not show locked days for creator', () => {
    render(<PlaybookSection playbook={mockPlaybook7Days} userTier="creator" analysisId="test-id" />)
    expect(screen.queryByText(/Day 4.*unlocked on Creator/i)).not.toBeInTheDocument()
  })

  it('copy hook button copies text to clipboard', async () => {
    const mockClipboard = { writeText: jest.fn().mockResolvedValue(undefined) }
    Object.assign(navigator, { clipboard: mockClipboard })

    render(<PlaybookSection playbook={mockPlaybook3Days} userTier="creator" analysisId="test-id" />)
    const copyButtons = screen.getAllByTitle(/copy hook to clipboard/i)
    fireEvent.click(copyButtons[0])
    expect(mockClipboard.writeText).toHaveBeenCalled()
  })

  it('shows copy all hooks button', () => {
    render(<PlaybookSection playbook={mockPlaybook7Days} userTier="creator" analysisId="test-id" />)
    expect(screen.getByText(/copy all hooks/i)).toBeInTheDocument()
  })

  it('no upgrade CTA shown for pro user', () => {
    render(<PlaybookSection playbook={mockPlaybook7Days} userTier="pro" analysisId="test-id" />)
    expect(screen.queryByText(/Get 4 more days/i)).not.toBeInTheDocument()
  })

  it('hooks rendered in italic blockquotes', () => {
    render(<PlaybookSection playbook={mockPlaybook3Days} userTier="creator" analysisId="test-id" />)
    expect(screen.getByText(/"Stop following generic advice."/)).toBeInTheDocument()
  })
})