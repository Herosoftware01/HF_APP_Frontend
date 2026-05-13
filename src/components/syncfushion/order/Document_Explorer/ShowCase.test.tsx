import React from 'react';
import { render, screen } from '@testing-library/react';
import ShowCase from './ShowCase/layout';

test('renders learn react link', () => {
  render(<ShowCase />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
