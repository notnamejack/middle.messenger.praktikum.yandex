import { navigate } from '../../app';
import Block from '../../core/block';
import template from './registration.hbs?raw';
import { getFormValues, validateField, validateForm } from '../../utils/validation';

export default class RegistrationPage extends Block {
  protected template = template;

  protected events = {
    focusout: (event: Event) => {
      const target = event.target;
      if(target instanceof HTMLInputElement){
        validateField(target);
      }
    },

    submit: (event: Event) => {
      event.preventDefault();

      const target = event.target;
      if(!(target instanceof HTMLFormElement)) return;

      const isValid = validateForm(target);
      if(!isValid) return;

      const payload = getFormValues(target);
      console.log(payload);

      navigate('/');
    }
  }
}
