import Block, { type BlockOwnProps } from '../../core/block';
import template from './input.hbs?raw';

export type InputProps = BlockOwnProps & {
  id: string;
  name: string;
  label: string;
  type: string;
  value?: string;
  pattern?: string;
};

export default class Input extends Block<InputProps> {
  static componentName = 'Input';

  protected template = template;
}
