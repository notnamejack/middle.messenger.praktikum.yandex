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

type AvatarModalState = 'closed' | 'idle' | 'file-selected' | 'validation-error' | 'api-error';

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
  isAvatarModalOpen: boolean;
  selectedAvatarName: string;
  isAvatarFileSelected: boolean;
  isAvatarApiError: boolean;
  isAvatarValidationError: boolean;
};

const EMPTY_USER: UserResponse = {
  id: 0,
  first_name: '',
  second_name: '',
  display_name: '',
  login: '',
  email: '',
  phone: '',
  avatar: null,
};

function getDisplayName(user: UserResponse): string {
  return user.display_name || `${user.first_name} ${user.second_name}`;
}

function getAvatarModalFlags(state: AvatarModalState) {
  return {
    isAvatarFileSelected: state === 'file-selected',
    isAvatarApiError: state === 'api-error',
    isAvatarValidationError: state === 'validation-error',
  };
}

function mapUserToProps(
  user: UserResponse,
  mode: ProfileMode = 'view',
  avatarModal: {
    isOpen?: boolean;
    state?: AvatarModalState;
    selectedAvatarName?: string;
  } = {},
): ProfilePageProps {
  const modalState = avatarModal.state ?? 'closed';

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
    isAvatarModalOpen: avatarModal.isOpen ?? false,
    selectedAvatarName: avatarModal.selectedAvatarName ?? '',
    ...getAvatarModalFlags(modalState),
  };
}

export default class ProfilePage extends Block<ProfilePageProps> {
  private selectedAvatarFile: File | null = null;

  constructor() {
    super(mapUserToProps(EMPTY_USER));
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
    const user: UserResponse = {
      ...EMPTY_USER,
      first_name: this.props.first_name,
      second_name: this.props.second_name,
      display_name: this.props.display_name,
      login: this.props.login,
      email: this.props.email,
      phone: this.props.phone,
      avatar: null,
    };

    this.setProps({
      ...mapUserToProps(user, mode),
      avatarUrl: this.props.avatarUrl,
      displayName: this.props.displayName,
    });
  }

  private openAvatarModal() {
    this.selectedAvatarFile = null;
    this.setProps({
      ...mapUserToProps(
        {
          ...EMPTY_USER,
          first_name: this.props.first_name,
          second_name: this.props.second_name,
          display_name: this.props.display_name,
          login: this.props.login,
          email: this.props.email,
          phone: this.props.phone,
        },
        this.props.mode,
        { isOpen: true, state: 'idle', selectedAvatarName: '' },
      ),
      avatarUrl: this.props.avatarUrl,
    });
  }

  private closeAvatarModal() {
    this.selectedAvatarFile = null;
    this.setProps({
      ...mapUserToProps(
        {
          ...EMPTY_USER,
          first_name: this.props.first_name,
          second_name: this.props.second_name,
          display_name: this.props.display_name,
          login: this.props.login,
          email: this.props.email,
          phone: this.props.phone,
        },
        this.props.mode,
        { isOpen: false, state: 'closed', selectedAvatarName: '' },
      ),
      avatarUrl: this.props.avatarUrl,
    });
  }

  private async saveProfile(form: HTMLFormElement) {
    const inputs = Array.from(
      form.querySelectorAll<HTMLInputElement>(
        'input[name]:not([name="oldPassword"]):not([name="newPassword"]):not([name="newPassword_repeat"])',
      ),
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

    try {
      await UserAPI.changePassword({ oldPassword, newPassword });
      this.setMode('view');
    } catch (error) {
      alert(getApiErrorReason(error));
    }
  }

  private async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await UserAPI.uploadAvatar(formData);
      const user = await AuthAPI.getUser();
      this.selectedAvatarFile = null;
      this.setProps(mapUserToProps(user, this.props.mode));
    } catch {
      this.setProps(
        mapUserToProps(
          {
            ...EMPTY_USER,
            first_name: this.props.first_name,
            second_name: this.props.second_name,
            display_name: this.props.display_name,
            login: this.props.login,
            email: this.props.email,
            phone: this.props.phone,
          },
          this.props.mode,
          {
            isOpen: true,
            state: 'api-error',
            selectedAvatarName: this.props.selectedAvatarName,
          },
        ),
      );
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

      const file = target.files[0];
      this.selectedAvatarFile = file;

      this.setProps(
        mapUserToProps(
          {
            ...EMPTY_USER,
            first_name: this.props.first_name,
            second_name: this.props.second_name,
            display_name: this.props.display_name,
            login: this.props.login,
            email: this.props.email,
            phone: this.props.phone,
          },
          this.props.mode,
          {
            isOpen: true,
            state: 'file-selected',
            selectedAvatarName: file.name,
          },
        ),
      );

      target.value = '';
    },

    click: async (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const actionEl = target.closest<HTMLElement>('[data-action]');
      const action = actionEl?.dataset.action;

      if (action === 'open-avatar-modal') {
        this.openAvatarModal();
        return;
      }

      if (action === 'pick-avatar') {
        const input = this.refs.avatar;
        if (input instanceof HTMLInputElement) input.click();
        return;
      }

      if (action === 'close-modal') {
        this.closeAvatarModal();
        return;
      }

      if (action === 'upload-avatar') {
        if (!this.selectedAvatarFile) {
          this.setProps({
            ...mapUserToProps(
              {
                ...EMPTY_USER,
                first_name: this.props.first_name,
                second_name: this.props.second_name,
                display_name: this.props.display_name,
                login: this.props.login,
                email: this.props.email,
                phone: this.props.phone,
              },
              this.props.mode,
              { isOpen: true, state: 'validation-error', selectedAvatarName: '' },
            ),
            avatarUrl: this.props.avatarUrl,
          });
          return;
        }

        await this.uploadAvatar(this.selectedAvatarFile);
        return;
      }

      if (target.classList.contains('avatar-modal-overlay')) {
        this.closeAvatarModal();
        return;
      }

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
        const saveAction = target.dataset.action;
        if (saveAction === 'profile') await this.saveProfile(form);
        if (saveAction === 'password') await this.savePassword(form);
        return;
      }

      if (!target.classList.contains('edit')) return;

      if (action === 'profile') this.setMode('edit-profile');
      if (action === 'password') this.setMode('edit-password');
    },
  };
}
