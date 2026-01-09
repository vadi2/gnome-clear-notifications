# Clear Notifications

GNOME Shell extension to clear all notifications with a button or keyboard shortcut.

## Features

- **Panel button** - Appears when notifications exist, click to clear all
- **Keyboard shortcut** - `Shift+Super+C` (configurable)
- **Preferences** - Toggle button visibility, customize shortcut

## Installation

```bash
# Clone to extensions directory
git clone https://github.com/vadi2/gnome-clear-notifications.git \
  ~/.local/share/gnome-shell/extensions/clear-notifications@vadimperetok.in

# Compile schemas
cd ~/.local/share/gnome-shell/extensions/clear-notifications@vadimperetok.in
glib-compile-schemas schemas/

# Restart GNOME Shell (X11: Alt+F2, type 'r') or log out/in

# Enable
gnome-extensions enable clear-notifications@vadimperetok.in
```

## Compatibility

GNOME Shell 45, 46, 47, 48

## License

MIT
