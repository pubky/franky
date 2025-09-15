import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from './Card';

describe('Card', () => {
  it('renders complete card structure', () => {
    render(
      <Card data-testid="complete-card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId('complete-card')).toBeInTheDocument();
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });
});

describe('Card - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Card>Card content</Card>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different configurations', () => {
    const { container: defaultContainer } = render(<Card>Default Card</Card>);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customContainer } = render(<Card className="custom-card">Custom Card</Card>);
    expect(customContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for card subcomponents', () => {
    const { container: headerContainer } = render(<CardHeader>Header Content</CardHeader>);
    expect(headerContainer.firstChild).toMatchSnapshot();

    const { container: titleContainer } = render(<CardTitle>Card Title</CardTitle>);
    expect(titleContainer.firstChild).toMatchSnapshot();

    const { container: descriptionContainer } = render(<CardDescription>Card Description</CardDescription>);
    expect(descriptionContainer.firstChild).toMatchSnapshot();

    const { container: contentContainer } = render(<CardContent>Card Content</CardContent>);
    expect(contentContainer.firstChild).toMatchSnapshot();

    const { container: footerContainer } = render(<CardFooter>Card Footer</CardFooter>);
    expect(footerContainer.firstChild).toMatchSnapshot();

    const { container: actionContainer } = render(<CardAction>Action</CardAction>);
    expect(actionContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for complete card structure', () => {
    const { container: completeContainer } = render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>,
    );
    expect(completeContainer.firstChild).toMatchSnapshot();

    const { container: minimalContainer } = render(
      <Card>
        <CardContent>Minimal Content</CardContent>
      </Card>,
    );
    expect(minimalContainer.firstChild).toMatchSnapshot();
  });
});
