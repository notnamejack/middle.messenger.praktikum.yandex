import { navigate } from '../../app';
import Block from '../../core/block';
import template from './registration.hbs?raw';
import { getFormValues, validateField, validateForm } from '../../utils/validation';
import { AuthAPI } from '../../api/auth';
import type { SignUpRequest } from '../../types/api';
import { getApiErrorReason } from '../../utils/api-error';

export default class RegistrationPage extends Block {
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

      const signUpData = getFormValues(target);

      try {
        await AuthAPI.signUp(signUpData as SignUpRequest);
        navigate('/messenger');
      } catch (error) {
        const message = getApiErrorReason(error);
        console.error(message);
      }
    }
  }
}
