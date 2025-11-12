import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import AgeFilterBox from './AgeFilterBox'

expect.extend(toHaveNoViolations)

describe('AgeFilterBox', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('Rendering', () => {
    it('should render with default selected value', () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      expect(screen.getByText('Below 60 years')).toBeInTheDocument()
      expect(screen.getByText('Standard tax slabs')).toBeInTheDocument()
    })

    it('should render with senior citizen selected', () => {
      render(<AgeFilterBox value="60-80" onChange={mockOnChange} />)
      
      expect(screen.getByText('60 - 80 years')).toBeInTheDocument()
      expect(screen.getByText('Senior citizen benefits')).toBeInTheDocument()
    })

    it('should render with super senior citizen selected', () => {
      render(<AgeFilterBox value="80+" onChange={mockOnChange} />)
      
      expect(screen.getByText('Above 80 years')).toBeInTheDocument()
      expect(screen.getByText('Super senior citizen benefits')).toBeInTheDocument()
    })

    it('should render in dark theme', () => {
      const { container } = render(
        <AgeFilterBox value="0-60" onChange={mockOnChange} theme="dark" />
      )
      
      expect(container.querySelector('button')).toHaveStyle({
        background: 'rgba(30, 41, 59, 0.5)',
      })
    })
  })

  describe('Interaction', () => {
    it('should open dropdown when clicked', async () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
    })

    it('should close dropdown when clicking outside', async () => {
      render(
        <div>
          <AgeFilterBox value="0-60" onChange={mockOnChange} />
          <div data-testid="outside">Outside</div>
        </div>
      )
      
      const button = screen.getByRole('button', { name: /select age group/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      fireEvent.mouseDown(screen.getByTestId('outside'))
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })

    it('should call onChange when option is selected', async () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      const option = screen.getByRole('option', { name: /60 - 80 years/i })
      fireEvent.click(option)
      
      expect(mockOnChange).toHaveBeenCalledWith('60-80')
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should close dropdown after selection', async () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      const option = screen.getByRole('option', { name: /60 - 80 years/i })
      fireEvent.click(option)
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should open dropdown with Enter key', async () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      button.focus()
      
      fireEvent.keyDown(button, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
    })

    it('should open dropdown with Space key', async () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      button.focus()
      
      fireEvent.keyDown(button, { key: ' ' })
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
    })

    it('should navigate options with Arrow Down', async () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      button.focus()
      
      fireEvent.keyDown(button, { key: 'ArrowDown' })
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      // First option should be active
      const firstOption = screen.getByRole('option', { name: /Below 60 years/i })
      expect(firstOption).toHaveStyle({ outline: '2px solid' })
    })

    it('should navigate options with Arrow Up', async () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      button.focus()
      
      fireEvent.keyDown(button, { key: 'ArrowUp' })
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      // Last option should be active
      const lastOption = screen.getByRole('option', { name: /Above 80 years/i })
      expect(lastOption).toHaveStyle({ outline: '2px solid' })
    })

    it('should select option with Enter key', async () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      button.focus()
      
      // Open dropdown
      fireEvent.keyDown(button, { key: 'ArrowDown' })
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      // Navigate to second option
      fireEvent.keyDown(button, { key: 'ArrowDown' })
      
      // Select with Enter
      fireEvent.keyDown(button, { key: 'Enter' })
      
      expect(mockOnChange).toHaveBeenCalledWith('60-80')
    })

    it('should close dropdown with Escape key', async () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      button.focus()
      
      fireEvent.keyDown(button, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      fireEvent.keyDown(button, { key: 'Escape' })
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA attributes on button', () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      
      expect(button).toHaveAttribute('aria-haspopup', 'listbox')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('should update aria-expanded when opened', async () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('should have proper ARIA attributes on listbox', async () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        const listbox = screen.getByRole('listbox')
        expect(listbox).toBeInTheDocument()
      })
    })

    it('should mark selected option with aria-selected', async () => {
      render(<AgeFilterBox value="60-80" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        const selectedOption = screen.getByRole('option', { name: /60 - 80 years/i })
        expect(selectedOption).toHaveAttribute('aria-selected', 'true')
      })
    })

    it('should announce selection changes', async () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const status = screen.getByRole('status')
      expect(status).toHaveTextContent('Selected age group: Below 60 years')
    })

    it('should have visible focus indicator', () => {
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      
      expect(button).toHaveClass('focus-visible:outline-none')
      expect(button).toHaveClass('focus-visible:ring-2')
    })
  })

  describe('Analytics', () => {
    it('should track age group selection', async () => {
      const mockAnalytics = {
        track: jest.fn(),
      }
      ;(window as any).analytics = mockAnalytics
      
      render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      const option = screen.getByRole('option', { name: /60 - 80 years/i })
      fireEvent.click(option)
      
      expect(mockAnalytics.track).toHaveBeenCalledWith('age_group_selected', {
        value: '60-80',
        page: 'tax-calculator',
        timestamp: expect.any(String),
      })
      
      delete (window as any).analytics
    })
  })

  describe('Visual States', () => {
    it('should show check icon for selected option', async () => {
      render(<AgeFilterBox value="60-80" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        // Check icon should be present for selected option
        const selectedOption = screen.getByRole('option', { name: /60 - 80 years/i })
        const checkIcon = selectedOption.querySelector('svg')
        expect(checkIcon).toBeInTheDocument()
      })
    })

    it('should rotate chevron when opened', async () => {
      const { container } = render(<AgeFilterBox value="0-60" onChange={mockOnChange} />)
      
      const button = screen.getByRole('button', { name: /select age group/i })
      const chevron = container.querySelector('svg')
      
      expect(chevron).not.toHaveClass('rotate-180')
      
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(chevron).toHaveClass('rotate-180')
      })
    })
  })
})
