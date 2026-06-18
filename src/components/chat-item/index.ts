import Block, { type BlockOwnProps } from '../../core/block';
import template from './chat-item.hbs?raw';

export type ChatItemProps = BlockOwnProps & {
  id: number;
  active?: boolean;
  name: string;
  text: string;
  time: string;
  count?: number;
  prefix?: string;
};

export default class ChatItem extends Block<ChatItemProps> {
  static componentName = 'ChatItem';

  protected template = template;
}
