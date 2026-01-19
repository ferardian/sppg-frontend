#!/bin/bash

# SPPG Frontend Production Auto-Start Setup Script
# This script creates a LaunchAgent to auto-start sppg-frontend PRODUCTION on Mac boot

PLIST_FILE="$HOME/Library/LaunchAgents/com.sppg.frontend.plist"
LOG_DIR="$HOME/Documents/sppg-api/sppg-frontend/logs"
WORK_DIR="$HOME/Documents/sppg-api/sppg-frontend"

# Create logs directory
mkdir -p "$LOG_DIR"

# Find npm path
NPM_PATH=$(which npm)
if [ -z "$NPM_PATH" ]; then
    echo "❌ npm not found in PATH"
    exit 1
fi

echo "📝 Creating LaunchAgent plist file for PRODUCTION mode..."

# Create plist file
cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.sppg.frontend</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>$NPM_PATH</string>
        <string>run</string>
        <string>preview</string>
        <string>--</string>
        <string>--port</string>
        <string>3456</string>
        <string>--host</string>
    </array>
    
    <key>WorkingDirectory</key>
    <string>$WORK_DIR</string>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <true/>
    
    <key>StandardOutPath</key>
    <string>$LOG_DIR/stdout.log</string>
    
    <key>StandardErrorPath</key>
    <string>$LOG_DIR/stderr.log</string>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$HOME/.nvm/versions/node/$(node -v)/bin</string>
        <key>NODE_ENV</key>
        <string>production</string>
    </dict>
</dict>
</plist>
EOF

echo "✅ Plist file created at: $PLIST_FILE"

# Unload if already loaded
echo "🔄 Unloading existing service (if any)..."
launchctl unload "$PLIST_FILE" 2>/dev/null || true

# Load the LaunchAgent
echo "🚀 Loading LaunchAgent..."
launchctl load "$PLIST_FILE"

# Start the service
echo "▶️  Starting service..."
launchctl start com.sppg.frontend

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Commands:"
echo "  Start:   launchctl start com.sppg.frontend"
echo "  Stop:    launchctl stop com.sppg.frontend"
echo "  Restart: launchctl stop com.sppg.frontend && launchctl start com.sppg.frontend"
echo "  Status:  launchctl list | grep sppg"
echo "  Logs:    tail -f $LOG_DIR/stdout.log"
echo "  Errors:  tail -f $LOG_DIR/stderr.log"
echo ""
echo "🔄 Service will auto-start on Mac boot"
echo "🌐 Access via: http://localhost:3456 or https://idrg-test.my.id"
echo "📦 Mode: PRODUCTION (npm run preview)"
echo ""
echo "⚠️  IMPORTANT: Run 'npm run build' after code changes!"
