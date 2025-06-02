import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

describe('Button', () => {
  // Basic rendering tests
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
    expect(button).not.toHaveClass('w-full');
  });

  it('renders children correctly', () => {
    render(<Button>Custom text</Button>);
    expect(screen.getByText('Custom text')).toBeInTheDocument();
  });

  // Variant tests
  it.each([
    ['primary', 'bg-primary'],
    ['secondary', 'bg-secondary'],
    ['outline', 'border-neutral-400'],
    ['ghost', 'bg-transparent'],
    ['link', 'underline-offset-4'],
    ['danger', 'bg-error'],
  ])('applies the correct classes for %s variant', (variant, expectedClass) => {
    render(<Button variant={variant as any}>Button</Button>);
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });

  // Size tests
  it.each([
    ['sm', 'h-9'],
    ['md', 'h-11'],
    ['lg', 'h-12'],
    ['icon', 'h-10 w-10'],
  ])('applies the correct classes for %s size', (size, expectedClass) => {
    render(<Button size={size as any}>Button</Button>);
    const button = screen.getByRole('button');
    
    // Split classes and check each one
    const classes = expectedClass.split(' ');
    classes.forEach(className => {
      expect(button).toHaveClass(className);
    });
  });

  // Full width test
  it('applies full width class when fullWidth is true', () => {
    render(<Button fullWidth>Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  // Loading state tests
  it('shows spinner when isLoading is true', () => {
    render(<Button isLoading>Button</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading text when provided', () => {
    render(<Button isLoading loadingText="Loading...">Button</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows spinner on the left when leftLoadingIcon is true', () => {
    render(<Button isLoading leftLoadingIcon>Button</Button>);
    
    // Check spinner is rendered before the text
    const button = screen.getByRole('button');
    const spinner = screen.getByRole('status');
    
    // In the DOM, the spinner should come before the text node
    expect(button.firstChild).toBe(spinner);
  });

  // Icon tests
  it('renders left icon when provided', () => {
    render(
      <Button leftIcon={<ChevronLeftIcon data-testid="left-icon" />}>
        Button
      </Button>
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders right icon when provided', () => {
    render(
      <Button rightIcon={<ChevronRightIcon data-testid="right-icon" />}>
        Button
      </Button>
    );
    
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('does not render icons when in loading state', () => {
    render(
      <Button 
        isLoading 
        leftIcon={<ChevronLeftIcon data-testid="left-icon" />}
        rightIcon={<ChevronRightIcon data-testid="right-icon" />}
      >
        Button
      </Button>
    );
    
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  // Disabled state test
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  // Event handler test
  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Button</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Button</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} isLoading>Button</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Accessibility tests
  it('forwards ref to the button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Button</Button>);
    
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('applies additional className when provided', () => {
    render(<Button className="custom-class">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('passes additional props to the button element', () => {
    render(<Button data-testid="test-button" aria-label="Test Button">Button</Button>);
    
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('aria-label', 'Test Button');
  });
});
