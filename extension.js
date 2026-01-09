import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class ClearNotificationsExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._registerKeybinding();
    }

    disable() {
        Main.wm.removeKeybinding('clear-all');
        this._settings = null;
    }

    _registerKeybinding() {
        Main.wm.addKeybinding(
            'clear-all',
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW | Shell.ActionMode.POPUP,
            () => {
                try {
                    this._clearNotifications();
                } catch (e) {
                    console.error(`[Clear Notifications] Error in keybinding: ${e.message}`);
                }
            }
        );
    }

    _getMessageList() {
        return Main.panel.statusArea.dateMenu?._messageList;
    }

    _clearNotifications() {
        // Clear popup banner if one is showing
        const messageTray = Main.messageTray;
        if (messageTray._banner) {
            try {
                messageTray._banner.ease({
                    opacity: 0,
                    duration: 100,
                    onComplete: () => {
                        messageTray._hideBanner();
                    },
                });
            } catch (e) {
                console.warn(`[Clear Notifications] Failed to hide banner: ${e.message}`);
            }
        }

        // Clear notification list
        const messageList = this._getMessageList();
        if (!messageList) {
            console.warn('[Clear Notifications] Cannot clear - notification API unavailable');
            return;
        }

        const notificationSection = messageList._notificationSection;
        if (!notificationSection || !notificationSection._list) {
            console.warn('[Clear Notifications] Cannot clear - notification section unavailable');
            return;
        }

        const children = notificationSection._list.get_children();
        children.forEach(listItem => {
            try {
                listItem.child.close();
            } catch (e) {
                console.warn(`[Clear Notifications] Failed to close notification: ${e.message}`);
            }
        });
    }
}
