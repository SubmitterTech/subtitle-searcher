import { render, screen } from '@testing-library/react';
import Search from './pages/Search';

test('shows the search mode selector', () => {
  render(<Search />);

  expect(screen.getByLabelText(/arama modu/i)).toBeInTheDocument();
  expect(screen.getByRole('option', { name: /tüm kelimeler/i })).toBeInTheDocument();
});
