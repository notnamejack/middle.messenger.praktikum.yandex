import Block, { type BlockOwnProps} from '../../core/block';
import template from './chats.hbs?raw';


const CHATS = [
  { name: 'Андрей', text: 'Изображение', time: '10:49', count: 2 },
  { name: 'Киноклуб', text: 'стикер', time: '10:49', prefix: 'Вы: ' },
  { name: 'Илья', text: 'Друзья, у меня...', time: '10:49', count: 4 },
]

type ChatsPageProps = BlockOwnProps & {
  chats: typeof CHATS;
}

export default class ChantsPage extends Block<ChatsPageProps> {
  constructor() {
    super({ chats: CHATS});
  }


  protected template = template;
}
