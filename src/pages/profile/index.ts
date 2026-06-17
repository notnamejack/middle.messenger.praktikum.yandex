import { AuthAPI } from '../../api/auth';
import { navigate } from '../../app';
import Block from '../../core/block';
import { getApiErrorReason } from '../../utils/api-error';
import template from './profile.hbs?raw';

export default class ProfilePage extends Block {
  protected template = template;

  protected events = {
    click: async (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.classList.contains('out')) return;
      try {
        await AuthAPI.logout();
        navigate('/');
      } catch (error) {
        alert(getApiErrorReason(error));
      }
    },
  };
}
