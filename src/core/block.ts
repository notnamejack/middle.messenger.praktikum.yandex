import Handlebars from 'handlebars';

export interface BlockOwnProps {
  __children?: Array<{
    component: Block<object>;
    embed(node: DocumentFragment): void;
  }>;
  __refs?: Record<string, Element>;
}

type EventListType = Partial<Record<keyof HTMLElementEventMap, (e: Event) => void>>;

export default abstract class Block<Props extends BlockOwnProps = BlockOwnProps> {
  protected abstract template: string;
  
  protected props = {} as Props;
  
  private domElement: Element | null = null;
  
  protected children: Block<object>[] = [];
  
  protected refs: Record<string, Element> = {};
  
  protected events: EventListType = {};

  constructor(props: Props = {} as Props) {
    this.props = props;
  }

  public element(): Element | null {
    if (!this.domElement) {
      this.render();
    }
    return this.domElement;
  }

  public setProps(props: Partial<Props>) {
    this.props = { ...this.props, ...props, __children: [], __refs: {} } as Props;
    this.render();
  }

  public destroy() {
    this.unmountComponent();
    this.domElement?.remove();
    this.domElement = null;
  }

  protected componentDidMount() {}

  private isMounted = false;
  
  private mountComponent() {
    this.attachListeners();
    if (!this.isMounted) {
      this.isMounted = true;
      this.componentDidMount();
    }
  }

  protected componentWillUnmount() {}

  private unmountComponent() {
    if (this.domElement) {
      this.children.reverse().forEach(child => child.unmountComponent());

      this.componentWillUnmount();
      this.removeListeners();
    }
  }

  private attachListeners() {
    for (const eventName in this.events) {
      const key = eventName as keyof HTMLElementEventMap;
      const eventCallback = this.events[key];
      if (typeof eventCallback == 'function' && this.domElement) {
        this.domElement.addEventListener(key, eventCallback);
      }
    }
  }

  private removeListeners() {
    for (const eventName in this.events) {
      const key = eventName as keyof HTMLElementEventMap;
      const eventCallback = this.events[key];
      if (typeof eventCallback === 'function' && this.domElement) {
        this.domElement.removeEventListener(key, eventCallback);
      }
    }
  }

  protected render() {
    this.unmountComponent();
    const fragment = this.compile();
    if (this.domElement && fragment) {
      this.domElement.replaceWith(fragment);
    }
    this.domElement = fragment;
    this.mountComponent();
  }

  private compile(): Element | null {
    const html = Handlebars.compile(this.template)(this.props);
    const templateElement = document.createElement('template');
    templateElement.innerHTML = html;
    const fragment = templateElement.content;

    if (this.props.__children) {
      this.children = this.props.__children.map((child) => child.component);

      this.props.__children.forEach((child) => {
        child.embed(fragment);
      });
    }

    const defaultRefs = this.props?.__refs ?? {};
    this.refs = Array.from(fragment.querySelectorAll('[ref]')).reduce(
      (list, element) => {
        const key = element.getAttribute('ref') as string;
        list[key] = element as HTMLElement;
        element.removeAttribute('ref');
        return list;
      },
      defaultRefs,
    );

    return templateElement.content.firstElementChild;
  }
}
