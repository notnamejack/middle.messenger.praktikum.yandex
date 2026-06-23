import { AuthAPI } from '../../api/auth';
import { ChatsAPI } from '../../api/chats';
import { UserAPI } from '../../api/user';
import Block, { type BlockOwnProps } from '../../core/block';
import type { ChatResponse, UserResponse } from '../../types/api';
import { getAvatarUrl } from '../../utils/avatar';
import { getApiErrorReason } from '../../utils/api-error';
import template from './chats.hbs?raw';

type ChatListItem = {
  id: number;
  name: string;
  text: string;
  time: string;
  count?: number;
  prefix?: string;
  active?: boolean;
  avatarUrl: string | null;
};

type SearchNewChatItem = {
  isNewChat: true;
  title: string;
};

type SearchChatItem = ChatListItem & {
  isChat: true;
};

type SearchUserItem = {
  isUser: true;
  id: number;
  name: string;
  login: string;
  avatarUrl: string | null;
};

type SearchResultItem = SearchNewChatItem | SearchChatItem | SearchUserItem;

type ChatParticipant = {
  id: number;
  name: string;
  avatarUrl: string | null;
  canRemove: boolean;
};

type ChatsPageProps = BlockOwnProps & {
  chats: ChatListItem[];
  searchQuery: string;
  isSearching: boolean;
  searchResults: SearchResultItem[];
  activeChatId: number | null;
  activeChatTitle: string;
  activeChatAvatarUrl: string | null;
  chatMenuOpen: boolean;
  participantsOpen: boolean;
  participants: ChatParticipant[];
  isAddUserModalOpen: boolean;
  isCreateChatModalOpen: boolean;
  isChatAvatarModalOpen: boolean;
  isDeleteChatModalOpen: boolean;
  selectedChatAvatarName: string;
  isChatAvatarFileSelected: boolean;
  modalError: string;
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapChat(chat: ChatResponse, currentUserId: number): ChatListItem {
  const last = chat.last_message;
  const isMine = last?.user.id === currentUserId;

  return {
    id: chat.id,
    name: chat.title,
    text: last?.content ?? '',
    time: last ? formatTime(last.time) : '',
    count: chat.unread_count > 0 ? chat.unread_count : undefined,
    prefix: isMine ? 'Вы: ' : undefined,
    avatarUrl: getAvatarUrl(chat.avatar),
  };
}

function getUserDisplayName(user: UserResponse): string {
  return user.display_name || `${user.first_name} ${user.second_name}`;
}

function mapParticipant(user: UserResponse, currentUserId: number): ChatParticipant {
  return {
    id: user.id,
    name: getUserDisplayName(user),
    avatarUrl: getAvatarUrl(user.avatar),
    canRemove: user.id !== currentUserId,
  };
}

export default class ChatsPage extends Block<ChatsPageProps> {
  private currentUserId = 0;

  private allChats: ChatListItem[] = [];

  private selectedChatAvatarFile: File | null = null;

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  private searchInputValue = '';

  private searchCursorPos: number | null = null;

  constructor() {
    super({
      chats: [],
      searchQuery: '',
      isSearching: false,
      searchResults: [],
      activeChatId: null,
      activeChatTitle: '',
      activeChatAvatarUrl: null,
      chatMenuOpen: false,
      participantsOpen: false,
      participants: [],
      isAddUserModalOpen: false,
      isCreateChatModalOpen: false,
      isChatAvatarModalOpen: false,
      isDeleteChatModalOpen: false,
      selectedChatAvatarName: '',
      isChatAvatarFileSelected: false,
      modalError: '',
    });
  }

  protected template = template;

  protected componentDidMount() {
    void this.loadChats();
  }

  private withActiveChats(chats: ChatListItem[]): ChatListItem[] {
    const { activeChatId } = this.props;
    return chats.map((chat) => ({
      ...chat,
      active: chat.id === activeChatId,
    }));
  }

  private closeChatMenu() {
    this.setProps({ chatMenuOpen: false });
  }

  private closeParticipants() {
    this.setProps({ participantsOpen: false });
  }

  private closeUserModal() {
    this.selectedChatAvatarFile = null;
    this.setProps({
      isAddUserModalOpen: false,
      isCreateChatModalOpen: false,
      isChatAvatarModalOpen: false,
      selectedChatAvatarName: '',
      isChatAvatarFileSelected: false,
      modalError: '',
    });
  }

  private openCreateChatModal() {
    this.setProps({
      chatMenuOpen: false,
      participantsOpen: false,
      isAddUserModalOpen: false,
      isChatAvatarModalOpen: false,
      isCreateChatModalOpen: true,
      modalError: '',
    });
  }

  private openChatAvatarModal() {
    this.selectedChatAvatarFile = null;
    this.setProps({
      chatMenuOpen: false,
      participantsOpen: false,
      isAddUserModalOpen: false,
      isCreateChatModalOpen: false,
      isChatAvatarModalOpen: true,
      selectedChatAvatarName: '',
      isChatAvatarFileSelected: false,
      modalError: '',
    });
  }

  private openAddUserModal() {
    this.setProps({
      chatMenuOpen: false,
      participantsOpen: false,
      isAddUserModalOpen: true,
      isChatAvatarModalOpen: false,
      isDeleteChatModalOpen: false,
      modalError: '',
    });
  }

  private openDeleteChatModal() {
    this.setProps({
      chatMenuOpen: false,
      participantsOpen: false,
      isDeleteChatModalOpen: true,
    });
  }

  private closeDeleteChatModal() {
    this.setProps({ isDeleteChatModalOpen: false });
  }

  private syncSearchInput(query: string) {
    const input = this.refs.search;
    if (!(input instanceof HTMLInputElement)) return;

    input.value = query;

    if (!this.props.isSearching) return;

    input.focus();
    const pos = this.searchCursorPos ?? query.length;
    input.setSelectionRange(pos, pos);
  }

  private async loadChats() {
    try {
      const user = await AuthAPI.getUser();
      this.currentUserId = user.id;

      const chats = await ChatsAPI.getChats();
      this.allChats = chats.map((chat) => mapChat(chat, user.id));

      const searchValue = this.searchInputValue;
      this.setProps({
        chats: this.withActiveChats(this.allChats),
      });
      if (searchValue.trim()) {
        await this.updateSearch(searchValue);
      }
    } catch (error) {
      alert(getApiErrorReason(error));
    }
  }

  private async updateSearch(query: string) {
    const trimmed = query.trim();

    if (!trimmed) {
      this.clearSearch();
      return;
    }

    const filteredChats = this.allChats.filter((chat) =>
      chat.name.toLowerCase().includes(trimmed.toLowerCase()),
    );

    let users: UserResponse[] = [];

    try {
      users = (await UserAPI.search(trimmed)).filter(
        (user) => user.id !== this.currentUserId,
      );
    } catch {
      users = [];
    }

    const newChatItem: SearchResultItem[] =
      filteredChats.length === 0
        ? [{ isNewChat: true, title: trimmed }]
        : [];

    const searchResults: SearchResultItem[] = [
      ...newChatItem,
      ...filteredChats.map((chat) => ({
        isChat: true as const,
        ...chat,
        active: chat.id === this.props.activeChatId,
      })),
      ...users.map((user) => ({
        isUser: true as const,
        id: user.id,
        name: getUserDisplayName(user),
        login: user.login,
        avatarUrl: getAvatarUrl(user.avatar),
      })),
    ];

    this.setProps({
      searchQuery: query,
      isSearching: true,
      searchResults,
    });
    this.syncSearchInput(query);
  }

  private clearSearch() {
    const input = this.refs.search;
    if (input instanceof HTMLInputElement) {
      input.value = '';
    }

    this.setProps({
      searchQuery: '',
      isSearching: false,
      searchResults: [],
      chats: this.withActiveChats(this.allChats),
    });
  }

  private openChat(id: number, title: string) {
    const chat = this.allChats.find((item) => item.id === id);

    this.setProps({
      activeChatId: id,
      activeChatTitle: title,
      activeChatAvatarUrl: chat?.avatarUrl ?? null,
      chats: this.withActiveChats(this.allChats),
      chatMenuOpen: false,
      participantsOpen: false,
      participants: [],
      isAddUserModalOpen: false,
      isCreateChatModalOpen: false,
      isChatAvatarModalOpen: false,
      isDeleteChatModalOpen: false,
      selectedChatAvatarName: '',
      isChatAvatarFileSelected: false,
      modalError: '',
    });
    this.clearSearch();
    void this.loadParticipants(id);
  }

  private async loadParticipants(chatId: number) {
    try {
      const users = await ChatsAPI.getChatUsers(chatId);
      if (this.props.activeChatId !== chatId) return;

      this.setProps({
        participants: users.map((user) => mapParticipant(user, this.currentUserId)),
      });
    } catch (error) {
      alert(getApiErrorReason(error));
    }
  }

  private async handleCreateChat(title: string) {
    const response = await ChatsAPI.createChat(title);
    await this.loadChats();
    this.openChat(response.id, title);
  }

  private async handleCreateChatWithUser(userId: number, name: string, login: string) {
    try {
      const commonChat = await ChatsAPI.getCommonChat(userId);
      await this.loadChats();
      this.openChat(commonChat.id, commonChat.title);
      return;
    } catch {
      // общего чата нет — создаём новый
    }

    const title = name || login;
    const response = await ChatsAPI.createChat(title);
    await ChatsAPI.addUsersToChat([userId], response.id);
    await this.loadChats();
    this.openChat(response.id, title);
  }

  private async handleUploadChatAvatar() {
    const chatId = this.props.activeChatId;
    if (!chatId) return;

    if (!this.selectedChatAvatarFile) {
      this.setProps({ modalError: 'Нужно выбрать файл' });
      return;
    }

    try {
      await ChatsAPI.uploadAvatar(chatId, this.selectedChatAvatarFile);
      const title = this.props.activeChatTitle;
      this.closeUserModal();
      await this.loadChats();
      this.openChat(chatId, title);
    } catch (error) {
      this.setProps({ modalError: getApiErrorReason(error) });
    }
  }

  private getModalChatTitle(): string {
    const input = this.refs.modalChatTitle;
    if (!(input instanceof HTMLInputElement)) return '';
    return input.value.trim();
  }

  private async handleCreateChatFromModal() {
    const title = this.getModalChatTitle();
    if (!title) {
      this.setProps({ modalError: 'Введите название чата' });
      return;
    }

    try {
      await this.handleCreateChat(title);
      this.closeUserModal();
    } catch (error) {
      this.setProps({ modalError: getApiErrorReason(error) });
    }
  }

  private getModalLogin(): string {
    const input = this.refs.modalLogin;
    if (!(input instanceof HTMLInputElement)) return '';
    return input.value.trim();
  }

  private async findUserByLogin(login: string): Promise<UserResponse | null> {
    const users = await UserAPI.search(login);
    return users.find((user) => user.login === login) ?? null;
  }

  private async handleAddUserToActiveChat() {
    const chatId = this.props.activeChatId;
    if (!chatId) return;

    const login = this.getModalLogin();
    if (!login) {
      this.setProps({ modalError: 'Введите логин' });
      return;
    }

    try {
      const user = await this.findUserByLogin(login);
      if (!user) {
        this.setProps({ modalError: 'Пользователь не найден' });
        return;
      }

      if (user.id === this.currentUserId) {
        this.setProps({ modalError: 'Нельзя добавить себя' });
        return;
      }

      await ChatsAPI.addUsersToChat([user.id], chatId);
      this.closeUserModal();
      await this.loadChats();
      await this.loadParticipants(chatId);
    } catch (error) {
      this.setProps({ modalError: getApiErrorReason(error) });
    }
  }

  private async handleRemoveParticipant(userId: number) {
    const chatId = this.props.activeChatId;
    if (!chatId) return;

    try {
      await ChatsAPI.removeUsersFromChat([userId], chatId);
      await this.loadParticipants(chatId);
      await this.loadChats();
    } catch (error) {
      alert(getApiErrorReason(error));
    }
  }

  private async handleDeleteChat() {
    const chatId = this.props.activeChatId;
    if (!chatId) return;

    try {
      await ChatsAPI.deleteChat(chatId);
      this.closeDeleteChatModal();
      this.setProps({
        activeChatId: null,
        activeChatTitle: '',
        activeChatAvatarUrl: null,
        participantsOpen: false,
        participants: [],
      });
      await this.loadChats();
    } catch (error) {
      alert(getApiErrorReason(error));
    }
  }

  protected events = {
    change: (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.name !== 'chatAvatar') return;

      const file = target.files?.[0];
      if (!file) return;

      this.selectedChatAvatarFile = file;
      this.setProps({
        selectedChatAvatarName: file.name,
        isChatAvatarFileSelected: true,
        modalError: '',
      });
      target.value = '';
    },

    input: (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.name !== 'search') return;

      this.searchInputValue = target.value;
      this.searchCursorPos = target.selectionStart;

      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      this.searchTimer = setTimeout(() => {
        void this.updateSearch(target.value)
          .then(() => this.syncSearchInput(target.value))
          .catch((error) => alert(getApiErrorReason(error)));
      }, 300);
    },

    click: (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const actionEl = target.closest<HTMLElement>('[data-action]');
      const action = actionEl?.dataset.action;

      if (action === 'toggle-chat-menu') {
        this.setProps({
          chatMenuOpen: !this.props.chatMenuOpen,
          participantsOpen: false,
        });
        return;
      }

      if (action === 'toggle-participants') {
        this.setProps({
          chatMenuOpen: false,
          participantsOpen: !this.props.participantsOpen,
        });
        return;
      }

      if (action === 'remove-participant') {
        const userId = Number(actionEl?.dataset.userId);
        if (!Number.isNaN(userId)) {
          void this.handleRemoveParticipant(userId);
        }
        return;
      }

      if (action === 'open-add-user') {
        this.openAddUserModal();
        return;
      }

      if (action === 'open-create-chat') {
        this.openCreateChatModal();
        return;
      }

      if (action === 'open-chat-avatar') {
        this.openChatAvatarModal();
        return;
      }

      if (action === 'delete-chat') {
        this.openDeleteChatModal();
        return;
      }

      if (action === 'confirm-delete-chat') {
        void this.handleDeleteChat();
        return;
      }

      if (action === 'close-delete-modal') {
        this.closeDeleteChatModal();
        return;
      }

      if (action === 'pick-chat-avatar') {
        const input = this.refs.chatAvatar;
        if (input instanceof HTMLInputElement) input.click();
        return;
      }

      if (action === 'upload-chat-avatar') {
        void this.handleUploadChatAvatar();
        return;
      }

      if (action === 'close-modal') {
        this.closeUserModal();
        return;
      }

      if (target.classList.contains('chat-modal-overlay')) {
        if (this.props.isDeleteChatModalOpen) {
          this.closeDeleteChatModal();
          return;
        }
        this.closeUserModal();
        return;
      }

      if (action === 'submit-add-user') {
        void this.handleAddUserToActiveChat();
        return;
      }

      if (action === 'submit-create-chat') {
        void this.handleCreateChatFromModal();
        return;
      }

      if (this.props.chatMenuOpen && !target.closest('.setting-wrap')) {
        this.closeChatMenu();
      }

      if (this.props.participantsOpen && !target.closest('.participants-wrap')) {
        this.closeParticipants();
      }

      const chatItem = target.closest<HTMLElement>('[data-chat-id]');
      if (chatItem && !this.props.isSearching) {
        const id = Number(chatItem.dataset.chatId);
        const title = chatItem.dataset.title ?? '';
        if (!Number.isNaN(id)) {
          this.openChat(id, title);
        }
        return;
      }

      const searchItem = target.closest<HTMLElement>('[data-search-type]');
      if (!searchItem) return;

      const type = searchItem.dataset.searchType;

      void (async () => {
        try {
          if (type === 'new-chat') {
            const title = searchItem.dataset.title?.trim() ?? '';
            if (!title) return;
            await this.handleCreateChat(title);
            return;
          }

          if (type === 'chat') {
            const id = Number(searchItem.dataset.id);
            const title = searchItem.dataset.title ?? '';
            if (Number.isNaN(id)) return;
            this.openChat(id, title);
            return;
          }

          if (type === 'user') {
            const userId = Number(searchItem.dataset.id);
            const name = searchItem.dataset.name ?? '';
            const login = searchItem.dataset.login ?? '';
            if (Number.isNaN(userId)) return;
            await this.handleCreateChatWithUser(userId, name, login);
          }
        } catch (error) {
          alert(getApiErrorReason(error));
        }
      })();
    },
  };
}
