import './Drawer.css';

export interface IDrawerProps {
    childrenWithinHandleLeft?: React.ReactNode;
    childrenWithinHandleRight?: React.ReactNode;
    children?: React.ReactNode;
    isOpen: boolean;
    location: 'top' | 'bottom';
    className?: string;
    disableHandle?: boolean;
    drawerClassName?: string;
    drawerHandleClassName?: string;
    setIsOpen: (isOpen: boolean) => void;
}

const Drawer: React.FC<IDrawerProps> = (props: IDrawerProps) => {
    const { isOpen, children, childrenWithinHandleLeft, childrenWithinHandleRight, location, className, drawerClassName, drawerHandleClassName, setIsOpen, disableHandle } = props;
    return (
        <div className={['drawer-container', isOpen ? 'isOpen' : '', location === 'top' ? 'isTop' : 'isBottom', className].join(' ')}>
            {location === 'bottom' &&
                <div className={['drawer-handle', drawerHandleClassName, disableHandle ? 'disabled' : ''].join(' ')}>
                    <div className='drawer-handle-children drawer-handle-children-left'>{childrenWithinHandleLeft}</div>
                    <div className='drawer-handle-icon' onClick={() => {
                        if (disableHandle) {
                            setIsOpen(false);
                            return
                        }
                        setIsOpen(!isOpen);
                    }}>
                        <i className="bi-chevron-up"></i>
                    </div>
                    <div className='drawer-handle-children drawer-handle-children-right'>{childrenWithinHandleRight}</div>
                </div>
            }
            <div className={['drawer', drawerClassName].join(' ')}>
                {children}
            </div>
            {location === 'top' &&
                <div className={['drawer-handle', drawerHandleClassName, disableHandle ? 'disabled' : ''].join(' ')}>
                    <div className='drawer-handle-children drawer-handle-children-left'>{childrenWithinHandleLeft}</div>
                    <div className='drawer-handle-icon' onClick={() => {
                        if (disableHandle) {
                            setIsOpen(false);
                            return
                        }
                        setIsOpen(!isOpen);
                    }}>
                        <i className="bi-chevron-down"></i>
                    </div>
                    <div className='drawer-handle-children drawer-handle-children-right'>{childrenWithinHandleRight}</div>
                </div>
            }
        </div >
    );
};

export default Drawer;