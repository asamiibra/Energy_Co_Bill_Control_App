import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ScenarioDisplay } from '@/components/scenario-display';
import {
  baselineAlexScenario,
  safetyJordanScenario,
  tariffPreviewScenario,
  connectedHomePreviewScenario,
} from '@/data/scenarios';

describe('ScenarioDisplay', () => {
  it('renders the baseline forecast from fixture data', () => {
    render(<ScenarioDisplay scenario={baselineAlexScenario} />);

    expect(
      screen.getByText('Your bill is currently expected to be $178.')
    ).toBeVisible();
    expect(screen.getAllByText('$171–$204').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: 'Save this action' })
    ).toBeEnabled();
  });

  it('renders safety suppression without executable savings', () => {
    render(<ScenarioDisplay scenario={safetyJordanScenario} />);

    expect(screen.getByText('Essential-use protection active')).toBeVisible();
    expect(
      screen.getByText(
        'We are not recommending changes to essential heating under current conditions.'
      )
    ).toBeVisible();
    expect(
      screen.queryByText('Reduce essential heating overnight')
    ).not.toBeInTheDocument();
  });

  it('renders a non-executable tariff preview', () => {
    render(<ScenarioDisplay scenario={tariffPreviewScenario} />);

    expect(
      screen.getByRole('heading', { name: 'Tariff-Fit Preview' })
    ).toBeVisible();
    expect(screen.getByText('$90–$240')).toBeVisible();
    expect(screen.getByText('$75.00 exit fee')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /switch tariff|confirm switch/i })
    ).not.toBeInTheDocument();
  });

  it('renders connected-home consent boundaries', () => {
    render(<ScenarioDisplay scenario={connectedHomePreviewScenario} />);

    expect(
      screen.getByRole('heading', { name: 'Connected-Home Preview' })
    ).toBeVisible();
    expect(screen.getByText('Personalization is suppressed')).toBeVisible();
    expect(
      screen.getByText(/No personalized device recommendation/i)
    ).toBeVisible();
  });
});
