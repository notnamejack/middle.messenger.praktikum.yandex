import Block, { type BlockOwnProps } from '../../core/block';
import template from './input-horizontal.hbs?raw';

export type InputHorizontalProps = BlockOwnProps & {
  id: string;
  name: string;
  label: string;
  type: string;
  value?: string;
  pattern?: string;
};

export default class InputHorizontal extends Block<InputHorizontalProps> {
  static componentName = 'InputHorizontal';

  protected template = template;
}
