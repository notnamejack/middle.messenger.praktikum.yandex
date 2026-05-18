import { navigate } from '../../app';
import Block from '../../core/block';
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
