import Block, { type BlockOwnProps } from '../../core/block';
import template from './input-horizontal.hbs?raw';

export type InputHorizontalProps = BlockOwnProps & {
  id: string;
  name: string;
  placeholder?: string;
  label: string;
  type: string;
  value?: string;
  pattern?: string;
  disabled?: boolean;
};

export default class InputHorizontal extends Block<InputHorizontalProps> {
  static componentName = 'InputHorizontal';

  protected template = template;
}
