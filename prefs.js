import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ClearNotificationsPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'preferences-system-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('Settings'),
            description: _('Configure the Clear Notifications extension'),
        });
        page.add(group);

        const showIndicatorRow = new Adw.SwitchRow({
            title: _('Show Panel Button'),
            subtitle: _('Display clear button in the top panel when notifications exist'),
        });
        group.add(showIndicatorRow);
        settings.bind('show-indicator', showIndicatorRow, 'active', Gio.SettingsBindFlags.DEFAULT);

        const shortcutRow = new Adw.ActionRow({
            title: _('Keyboard Shortcut'),
            subtitle: _('Press to clear all notifications'),
        });
        group.add(shortcutRow);

        const currentShortcut = settings.get_strv('clear-all')[0] || '';
        const shortcutLabel = new Gtk.ShortcutLabel({
            accelerator: currentShortcut,
            disabled_text: _('Disabled'),
            valign: Gtk.Align.CENTER,
        });

        const editButton = new Gtk.Button({
            icon_name: 'document-edit-symbolic',
            valign: Gtk.Align.CENTER,
            css_classes: ['flat'],
            tooltip_text: _('Edit shortcut'),
        });

        const clearButton = new Gtk.Button({
            icon_name: 'edit-clear-symbolic',
            valign: Gtk.Align.CENTER,
            css_classes: ['flat'],
            tooltip_text: _('Clear shortcut'),
        });

        clearButton.connect('clicked', () => {
            settings.set_strv('clear-all', []);
            shortcutLabel.accelerator = '';
        });

        editButton.connect('clicked', () => {
            this._showShortcutDialog(window, settings, shortcutLabel);
        });

        const buttonBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 6,
            valign: Gtk.Align.CENTER,
        });
        buttonBox.append(shortcutLabel);
        buttonBox.append(editButton);
        buttonBox.append(clearButton);

        shortcutRow.add_suffix(buttonBox);
    }

    _showShortcutDialog(parentWindow, settings, shortcutLabel) {
        const dialog = new Adw.Dialog({
            title: _('Set Shortcut'),
            content_width: 400,
            content_height: 200,
        });

        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 24,
            margin_top: 24,
            margin_bottom: 24,
            margin_start: 24,
            margin_end: 24,
        });

        const label = new Gtk.Label({
            label: _('Press a key combination to set the shortcut.\nPress Escape to cancel or Backspace to disable.'),
            justify: Gtk.Justification.CENTER,
        });
        box.append(label);

        const statusLabel = new Gtk.Label({
            label: _('Waiting for input...'),
            css_classes: ['dim-label'],
        });
        box.append(statusLabel);

        dialog.set_child(box);

        const controller = new Gtk.EventControllerKey();
        controller.connect('key-pressed', (ctrl, keyval, keycode, state) => {
            const mask = state & Gtk.accelerator_get_default_mod_mask();

            if (keyval === Gdk.KEY_Escape) {
                dialog.close();
                return Gdk.EVENT_STOP;
            }

            if (keyval === Gdk.KEY_BackSpace) {
                settings.set_strv('clear-all', []);
                shortcutLabel.accelerator = '';
                dialog.close();
                return Gdk.EVENT_STOP;
            }

            if (!Gtk.accelerator_valid(keyval, mask)) {
                statusLabel.label = _('Invalid shortcut. Try again...');
                return Gdk.EVENT_STOP;
            }

            const accelerator = Gtk.accelerator_name(keyval, mask);
            settings.set_strv('clear-all', [accelerator]);
            shortcutLabel.accelerator = accelerator;
            dialog.close();
            return Gdk.EVENT_STOP;
        });

        dialog.get_content().add_controller(controller);
        dialog.present(parentWindow);
    }
}
