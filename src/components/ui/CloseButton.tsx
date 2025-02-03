import Button from './Button';
import { IoClose } from "react-icons/io5";

type CloseButtonPropsType = {
    className?: string
}

export default function CloseButton({ className }: CloseButtonPropsType) {
    function handleClose() {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const activeTab = tabs[0];
            const tabId = activeTab.id ?? 0;

            chrome.tabs.sendMessage(tabId, { action: 'removeSidebar' }).catch(() => {});

            const storedState = await chrome.storage.local.get('isSidebarOpenPerTab');
            const isSidebarOpenPerTab = storedState.isSidebarOpenPerTab || {};

            isSidebarOpenPerTab[tabId] = false;
            await chrome.storage.local.set({ isSidebarOpenPerTab });
        });
    }

    return (
        <Button
            onClick={handleClose}
            classname={`p-[6px] closeBtn cursor-pointer z-50 bg-white/10 backdrop-blur-[50px] border-white/70 border rounded-[10px] ${className}`}
        >
            <IoClose size={24} color='#fff' />
        </Button>
    );
}