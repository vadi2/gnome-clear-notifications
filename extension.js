import St from 'gi://St';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import GObject from 'gi://GObject';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

const ClearNotificationsIndicator = GObject.registerClass(
class ClearNotificationsIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, 'Clear Notifications', false);
        this._extension = extension;

        this._icon = new St.Icon({
            icon_name: 'edit-clear-all-symbolic',
            style_class: 'system-status-icon clear-notifications-icon',
        });
        this.add_child(this._icon);

        this.connect('button-press-event', () => {
            this._extension._clearNotifications();
            return true;
        });
    }
});

export default class ClearNotificationsExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        this._indicator = new ClearNotificationsIndicator(this);

        Main.panel.addToStatusArea(this.uuid, this._indicator);

        this._bindSettings();

        this._registerKeybinding();

        this._connectNotificationSignals();

        this._updateVisibility();
    }

    disable() {
        Main.wm.removeKeybinding('clear-all');

        this._disconnectNotificationSignals();

        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }

        this._indicator?.destroy();
        this._indicator = null;
        this._settings = null;
    }

    _bindSettings() {
        this._settingsChangedId = this._settings.connect('changed::show-indicator', () => {
            this._updateIndicatorVisibility();
        });
        this._updateIndicatorVisibility();
    }

    _updateIndicatorVisibility() {
        if (this._indicator) {
            const showIndicator = this._settings.get_boolean('show-indicator');
            this._indicator.visible = showIndicator && this._hasNotifications();
        }
    }

    _registerKeybinding() {
        Main.wm.addKeybinding(
            'clear-all',
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            () => {
                this._clearNotifications();
            }
        );
    }

    _connectNotificationSignals() {
        const messageList = this._getMessageList();
        if (!messageList)
            return;

        const notificationSection = messageList._notificationSection;
        if (!notificationSection || !notificationSection._list)
            return;

        this._actorAddedId = notificationSection._list.connect('actor-added', () => {
            this._updateVisibility();
        });

        this._actorRemovedId = notificationSection._list.connect('actor-removed', () => {
            this._updateVisibility();
        });
    }

    _disconnectNotificationSignals() {
        const messageList = this._getMessageList();
        if (!messageList)
            return;

        const notificationSection = messageList._notificationSection;
        if (!notificationSection || !notificationSection._list)
            return;

        if (this._actorAddedId) {
            notificationSection._list.disconnect(this._actorAddedId);
            this._actorAddedId = null;
        }

        if (this._actorRemovedId) {
            notificationSection._list.disconnect(this._actorRemovedId);
            this._actorRemovedId = null;
        }
    }

    _getMessageList() {
        return Main.panel.statusArea.dateMenu?._messageList;
    }

    _hasNotifications() {
        const messageList = this._getMessageList();
        if (!messageList)
            return false;

        const notificationSection = messageList._notificationSection;
        if (!notificationSection || !notificationSection._list)
            return false;

        return notificationSection._list.get_n_children() > 0;
    }

    _updateVisibility() {
        if (!this._indicator)
            return;

        const showIndicator = this._settings.get_boolean('show-indicator');
        this._indicator.visible = showIndicator && this._hasNotifications();
    }

    _clearNotifications() {
        const messageList = this._getMessageList();
        if (!messageList)
            return;

        const notificationSection = messageList._notificationSection;
        if (!notificationSection || !notificationSection._list)
            return;

        const children = notificationSection._list.get_children();
        children.forEach(notification => {
            notification.destroy();
        });

        this._updateVisibility();
    }
}
