import { AuthAPI } from '../../api/auth';
import { navigate } from '../../app';
import Block from '../../core/block';
import type { SignInRequest } from '../../types/api';
import { getApiErrorReason } from '../../utils/api-error';
import { getFormValues, validateField, validateForm } from '../../utils/validation';
import template from './login.hbs?raw';

export default class LoginPage extends Block {
  protected template = template;

  protected events = {
    focusout: (event: Event) => {
      const target = event.target;
      if(target instanceof HTMLInputElement){
        validateField(target);
      }
    },

    submit: async (event: Event) => {
      event.preventDefault();

      const target = event.target;
      if(!(target instanceof HTMLFormElement)) return;

      const isValid = validateForm(target);
      if(!isValid) return;

      const { login, password } = getFormValues(target);

      try {
        await AuthAPI.signIn({ login, password } satisfies SignInRequest);
        navigate('/messenger');
      } catch (error) {
        const message = getApiErrorReason(error);
        console.error(message);
      }
    }
  }
}
