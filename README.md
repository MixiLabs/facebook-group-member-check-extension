# Facebook Group Member Checker - v2.0

A modern, production-ready Chrome/Edge browser extension for checking Facebook group membership status with advanced queue processing, beautiful UI, and efficient state management.

## 🚀 Features

- **Modern Tech Stack**: Built with React, Vite, TailwindCSS, shadcn/ui, and Zustand
- **Group Management**: Store and manage multiple Facebook groups
- **Automated Checking**: Queue-based system for checking multiple users across multiple groups
- **Auto-Detection**: Automatically detects user and group IDs when browsing Facebook
- **Beautiful UI/UX**: Modern interface with avatars, status badges, and responsive design
- **Memory Management**: Efficient queue processing with configurable limits (100-200 checks)
- **Background Processing**: Runs in background with periodic checks and notifications
- **Local Storage**: Persistent state management with Chrome storage API
- **Rate Limiting**: Built-in delays to prevent Facebook rate limiting

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 4 + shadcn/ui components
- **State Management**: Zustand with Chrome storage persistence
- **Extension Framework**: @crxjs/vite-plugin for modern Chrome extension development

### Project Structure
```
src/
├── components/
│   ├── ui/                 # shadcn/ui components (Button, Input, Card, etc.)
│   ├── UserCard.tsx        # User result display component
│   └── GroupCard.tsx       # Group management component
├── lib/
│   ├── types.ts           # TypeScript type definitions
│   ├── utils.ts           # Utility functions
│   ├── origin-fetch.ts    # Facebook-compatible fetch wrapper
│   ├── is-member-of-groups.ts  # Group membership checking logic
│   └── find-facebook-info.ts   # User info extraction
├── pages/
│   ├── background/        # Background service worker
│   ├── content/           # Content script for Facebook pages
│   └── sidebar/           # React sidebar application
├── store/
│   └── app-store.ts       # Zustand store with Chrome storage
└── manifest.ts            # Extension manifest definition
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- PowerShell (Windows)
- Chrome/Edge browser

### Installation
```powershell
# Clone and navigate to project
cd facebook-member-group-ext

# Install dependencies
npm install

# Development build with watch mode
npm run dev

# Production build
npm run build
```

### Adding shadcn/ui Components
```powershell
# Example: Add new shadcn components
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add dropdown-menu
```

## 📦 Installation in Browser

1. **Build the extension**:
   ```powershell
   npm run build
   ```

2. **Load in Chrome/Edge**:
   - Open `chrome://extensions/` or `edge://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

3. **Pin the extension** to your toolbar for easy access

## 🎯 Usage Guide

### 1. Setup Groups
- Click the extension icon to open sidebar
- Navigate to "Groups" tab
- Add Facebook groups by ID and name
- Groups are saved automatically

### 2. Quick Check
- Navigate to a Facebook user profile within a group
- The extension auto-detects user and group IDs
- Click "Check Now" for instant results
- Or "Add to Queue" for batch processing

### 3. Queue Processing
- Add multiple users to queue
- Click "Start Queue" to begin batch processing
- Queue processes with human-like delays (2-5 seconds)
- View progress in real-time

### 4. View Results
- Check "History" tab for recent results
- Results include avatars, membership status, and timestamps
- Copy profile links or open directly in new tabs
- Results are limited to 100-200 to prevent memory issues

### 5. Auto-Detection
- **Smart URL Detection**: Automatically recognizes Facebook profile and group pages
- **Username Resolution**: Converts usernames to numeric IDs using `find-facebook-info`
- **Group Member Auto-Check**: When visiting group member profiles, automatically checks membership
- **Multiple User Detection**: Detects multiple users on member list pages
- **Auto-Queue Addition**: Automatically adds detected users to queue for saved groups

## 🔧 Configuration

### Queue Settings
- **Max Recent Checks**: 200 (configurable)
- **Processing Delay**: 2-5 seconds between requests
- **Batch Size**: Sequential processing to avoid rate limits

### Auto-Detection Patterns
- **Group Member Profiles**: `facebook.com/groups/{groupId}/user/{userId}` → Auto-checks membership
- **Numeric Profile IDs**: `facebook.com/profile.php?id={userId}` → Extracts user info
- **Username Profiles**: `facebook.com/{username}` → Resolves to numeric ID
- **Group Pages**: `facebook.com/groups/{groupId}` → Detects group context
- **Member Lists**: `facebook.com/groups/{groupId}/members` → Finds multiple users

## 🎨 UI Components

### UserCard
- Displays user avatar, name, and membership status
- Color-coded badges for different membership levels
- Quick action buttons for copying/opening links

### GroupCard
- Shows group information with avatar
- Management controls (remove, copy URL, open group)
- Clean, compact design

### Queue Status
- Real-time processing status
- Progress indicators
- Error handling and retry logic

## 🔐 Permissions Required

- `sidePanel`: For sidebar interface
- `activeTab`: For auto-detection on active tabs
- `tabs`: For opening Facebook links
- `storage`: For persistent data storage
- `alarms`: For background queue processing
- `notifications`: For processing notifications
- `host_permissions`: Access to Facebook pages

## 🛡️ Privacy & Security

- **No Data Collection**: All data stays local on your device
- **Secure Storage**: Uses Chrome's secure storage API
- **Rate Limiting**: Respects Facebook's usage policies
- **Memory Safe**: Automatic cleanup and limits

## 🚦 Development Commands

```powershell
# Development with hot reload
npm run dev

# Production build
npm run build

# Build with file watching
npm run build:watch

# Preview built files
npm run preview
```

## 📈 Performance Features

- **Lazy Loading**: Components load only when needed
- **Efficient Rendering**: React optimization patterns
- **Memory Management**: Automatic cleanup of old data
- **Background Processing**: Non-blocking queue operations
- **Persistent State**: Survives browser restarts

## 🐛 Troubleshooting

### Build Issues
1. Clear node_modules and reinstall:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

2. Check Node.js version (requires 18+)

### Extension Issues
1. Reload extension in browser
2. Check browser console for errors
3. Verify permissions are granted

### Facebook Detection Issues
1. Ensure you're on Facebook.com
2. Try refreshing the page
3. Check if Facebook changed their URL structure

## 🔄 Migration from v1.0

The new v2.0 completely replaces the old Webpack-based architecture:

- **Old**: Vanilla JS + Webpack + Direct DOM manipulation
- **New**: React + Vite + TailwindCSS + Modern state management

No data migration needed - extension will start fresh with new storage structure.

## 📋 Roadmap

- [ ] Dark mode support
- [ ] Export/import group lists
- [ ] Advanced filtering and search
- [ ] Bulk user import from CSV
- [ ] Performance analytics
- [ ] Notification customization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Follow TypeScript and React best practices
4. Test with multiple Facebook group scenarios
5. Submit pull request

## 📄 License

This project is for educational purposes. Please respect Facebook's Terms of Service when using this extension.

---

**Built with ❤️ using React, Vite, TailwindCSS, and shadcn/ui** 