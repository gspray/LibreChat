import { render } from '@testing-library/react';
import type { TStartupConfig } from 'librechat-data-provider';
import ModelSelector from '../ModelSelector';

describe('model selector visibility', () => {
  it('does not render while startup policy is loading', () => {
    const { container } = render(<ModelSelector startupConfig={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render when model selection is disabled and model specs are configured', () => {
    const startupConfig = {
      interface: { modelSelect: false },
      modelSpecs: { list: [{ name: 'instructor-assistant' }] },
    } as TStartupConfig;
    const { container } = render(<ModelSelector startupConfig={startupConfig} />);
    expect(container).toBeEmptyDOMElement();
  });
});
