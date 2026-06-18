import { AuthAPI } from '../../api/auth';
import { UserAPI } from '../../api/user';
import { navigate } from '../../app';
import Block, { type BlockOwnProps } from '../../core/block';
import type { UserResponse, UserUpdateRequest } from '../../types/api';
import { getAvatarUrl } from '../../utils/avatar';
import { getApiErrorReason } from '../../utils/api-error';
import { getFormValues, validateField } from '../../utils/validation';
import template from './profile.hbs?raw';

type ProfileMode = 'view' | 'edit-profile' | 'edit-password';

type ProfilePageProps = BlockOwnProps & {
  mode: ProfileMode;
  avatarUrl: string | null;
  displayName: string;
  email: string;
  login: string;
  first_name: string;
  second_name: string;
  display_name: string;
  phone: string;
  profileDisabled: boolean;
  isPasswordMode: boolean;
  isEditing: boolean;
  editAction: 'profile' | 'password' | '';
};

function getDisplayName(user: UserResponse): string {
  return user.display_name || `${user.first_name} ${user.second_name}`;
}

function mapUserToProps(user: UserResponse, mode: ProfileMode = 'view'): ProfilePageProps {
  return {
    mode,
    avatarUrl: getAvatarUrl(user.avatar),
    displayName: getDisplayName(user),
    email: user.email,
    login: user.login,
    first_name: user.first_name,
    second_name: user.second_name,
    display_name: user.display_name,
    phone: user.phone,
    profileDisabled: mode !== 'edit-profile',
    isPasswordMode: mode === 'edit-password',
    isEditing: mode !== 'view',
    editAction: mode === 'edit-profile' ? 'profile' : mode === 'edit-password' ? 'password' : '',
  };
}

export default class ProfilePage extends Block<ProfilePageProps> {
  constructor() {
    super(mapUserToProps({
      id: 0,
      first_name: '',
      second_name: '',
      display_name: '',
      login: '',
      email: '',
      phone: '',
      avatar: null,
    }));
  }

  protected template = template;

  protected componentDidMount() {
    void this.loadUser();
  }

  private async loadUser() {
    try {
      const user = await AuthAPI.getUser();
      this.setProps(mapUserToProps(user, this.props.mode));
    } catch (error) {
      alert(getApiErrorReason(error));
      navigate('/');
    }
  }

  private setMode(mode: ProfileMode) {
    this.setProps({
      ...this.props,
      ...mapUserToProps({
        id: 0,
        first_name: this.props.first_name,
        second_name: this.props.second_name,
        display_name: this.props.display_name,
        login: this.props.login,
        email: this.props.email,
        phone: this.props.phone,
        avatar: null,
      }, mode),
      avatarUrl: this.props.avatarUrl,
      displayName: this.props.displayName,
    });
  }

  private async saveProfile(form: HTMLFormElement) {
    const inputs = Array.from(
      form.querySelectorAll<HTMLInputElement>('input[name]:not([name="oldPassword"]):not([name="newPassword"])'),
    );
    const isValid = inputs.map(validateField).every(Boolean);
    if (!isValid) return;

    const values = getFormValues(form);

    try {
      await UserAPI.updateProfile({
        first_name: values.first_name,
        second_name: values.second_name,
        display_name: values.display_name,
        login: values.login,
        email: values.email,
        phone: values.phone,
      } satisfies UserUpdateRequest);

      const user = await AuthAPI.getUser();
      this.setProps(mapUserToProps(user, 'view'));
    } catch (error) {
      alert(getApiErrorReason(error));
    }
  }

  private async savePassword(form: HTMLFormElement) {
    const inputs = Array.from(
      form.querySelectorAll<HTMLInputElement>(
        'input[name="oldPassword"], input[name="newPassword"], input[name="newPassword_repeat"]',
      ),
    );
    const isValid = inputs.map(validateField).every(Boolean);
    if (!isValid) return;

    const { oldPassword, newPassword } = getFormValues(form);

    await UserAPI.changePassword({ oldPassword, newPassword });
    this.setMode('view');
  }

  private async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await UserAPI.uploadAvatar(formData);
      const user = await AuthAPI.getUser();
      this.setProps(mapUserToProps(user, this.props.mode));
    } catch (error) {
      alert(getApiErrorReason(error));
    }
  }

  protected events = {
    focusout: (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.type !== 'file') {
        validateField(target);
      }
    },

    change: (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.type !== 'file' || !target.files?.[0]) return;
      void this.uploadAvatar(target.files[0]);
      target.value = '';
    },

    click: async (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.classList.contains('cancel')) {
        try {
          const user = await AuthAPI.getUser();
          this.setProps(mapUserToProps(user, 'view'));
        } catch (error) {
          alert(getApiErrorReason(error));
        }
        return;
      }

      if (target.classList.contains('out')) {
        try {
          await AuthAPI.logout();
          navigate('/');
        } catch (error) {
          alert(getApiErrorReason(error));
        }
        return;
      }

      const form = this.refs.form;
      if (!(form instanceof HTMLFormElement)) return;

      if (target.classList.contains('save')) {
        const action = target.dataset.action;
        if (action === 'profile') await this.saveProfile(form);
        if (action === 'password') await this.savePassword(form);
        return;
      }

      if (!target.classList.contains('edit')) return;

      const action = target.dataset.action;
      if (action === 'profile') this.setMode('edit-profile');
      if (action === 'password') this.setMode('edit-password');
    },
  };
}
