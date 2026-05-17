import Block from '../../core/block';
import template from './server-error.hbs?raw';

export default class ServerErrorPage extends Block {
  protected template = template;
}