let isSidebarOpenPerTab = {};

chrome.storage.local.get(['isSidebarOpenPerTab'], (result) => {
  if (result.isSidebarOpenPerTab) {
    isSidebarOpenPerTab = result.isSidebarOpenPerTab;
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;

  const storedState = await chrome.storage.local.get('isSidebarOpenPerTab');
  const isSidebarOpenPerTab = storedState.isSidebarOpenPerTab || {};

  if (isSidebarOpenPerTab[tabId]) {
    chrome.tabs.sendMessage(tabId, { action: 'createSidebar' }).catch(() => {});
  }
});


chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('alarm', {
    delayInMinutes: 0,
    periodInMinutes: 0.016
  });

  chrome.alarms.create('resetDailyFlags', {
    when: getTimeUntilMidnight(),
    periodInMinutes: 1440
  });
});

function injectSidebar(forceReopen = false) {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const activeTab = tabs[0];
    const tabId = activeTab.id;

    let sidebarState = (await chrome.storage.local.get('isSidebarOpenPerTab')).isSidebarOpenPerTab || {};
    let isOpen = sidebarState[tabId] || false;

    if (forceReopen || isOpen) {
      chrome.tabs.sendMessage(tabId, { action: 'removeSidebar' }, async () => {
        sidebarState[tabId] = false;
        await chrome.storage.local.set({ isSidebarOpenPerTab: sidebarState });
      });
    } else {
      chrome.scripting.executeScript(
        { target: { tabId }, files: ['injectSidebar.js'] },
        async () => {
          chrome.tabs.sendMessage(tabId, { action: 'createSidebar' });
          sidebarState[tabId] = true;
          await chrome.storage.local.set({ isSidebarOpenPerTab: sidebarState });
        }
      );
    }
  });
}

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

function resetDailyFlags() {
  chrome.storage.local.set({ openedForTime1: false, openedForTime2: false, openedForTime3: false });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'alarm') {
    const { time1, time2, time3, openedForTime1, openedForTime2, openedForTime3, enabled1, enabled2, enabled3 } = await chrome.storage.local.get({
      time1: null,
      time2: null,
      time3: null,
      openedForTime1: false,
      openedForTime2: false,
      openedForTime3: false,
      enabled1: true,
      enabled2: true,
      enabled3: true,
    });

    const date = new Date(Date.now());
    const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

    if (formattedTime === time1 && !openedForTime1 && enabled1) {
      injectSidebar(true);
      await chrome.storage.local.set({ openedForTime1: true });
    } else if (formattedTime === time2 && !openedForTime2 && enabled2) {
      injectSidebar(true);
      await chrome.storage.local.set({ openedForTime2: true });
    } else if (formattedTime === time3 && !openedForTime3 && enabled3) {
      injectSidebar(true);
      await chrome.storage.local.set({ openedForTime3: true });
    }
  }

  if (alarm.name === 'resetDailyFlags') {
    resetDailyFlags();
  }
});

chrome.action.onClicked.addListener(() => {
  injectSidebar();
});