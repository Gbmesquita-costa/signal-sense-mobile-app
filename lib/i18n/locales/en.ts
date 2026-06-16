export default {
  // App
  appName: "SignalSense",

  // Tabs
  tabs: {
    scan: "Scan",
    proximity: "Proximity",
    environment: "Environment",
    wifi: "Wi-Fi",
    education: "Education",
  },

  // Settings
  settings: {
    title: "Settings",

    // Theme section
    theme: {
      title: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
    },

    // Language section
    language: {
      title: "Language",
    },

    // About section
    about: {
      title: "About",
      description:
        "SignalSense is a personal privacy tool that helps you detect signals from devices around you. We don't make absolute promises — we offer awareness.",
    },

    // Premium section
    premium: {
      title: "Premium",
      active: "Premium active",
      upgrade: "Unlock Premium",
    },

    // Export section
    export: {
      title: "Export Data",
    },

    // Anti-Stalking section
    antiStalking: {
      title: "Anti-Stalking",
      enable: "Enable Monitoring",
      enableDesc: "Scans for trackers in the background",
      trustedDevices: "Trusted Devices",
      trustedDevicesDesc: "Devices you marked as safe won't trigger alerts.",
      noTrustedDevices: "No trusted devices yet.",
    },

    // Privacy section
    privacy: {
      title: "Privacy",
      content:
        "Your privacy is our priority. SignalSense:\n\n• Does not collect any personal data\n• Has no backend or server\n• All processing happens locally on your device\n• Does not track your location\n• Does not share information with third parties",
    },
  },

  // Scan screen
  scan: {
    title: "Signal Scan",
    tapToStart: "Tap to start scanning",
    description: "Detect Bluetooth devices around you",
    scanning: "Scanning...",
    disclaimer: "We only detect active signals. No data is collected.",
    error: "Error",
    retry: "Retry",
    settings: "Settings",
    signalStrength: {
      weak: "Weak",
      medium: "Medium",
      strong: "Strong",
    },
    states: {
      checking: "Checking...",
      checkingPermissions: "Checking permissions...",
      requestingPermissions: "Requesting permissions...",
      checkingBluetooth: "Checking Bluetooth...",
      initializing: "Initializing sensors...",
      scanning: "Scanning for devices...",
      foundDevices: "{count} device(s) found",
      finished: "{count} device(s) found",
      error: "An error occurred",
      loadingMore: "Loading more...",
      searchingDevices: "Searching for devices...",
    },
    errorMessages: {
      bluetoothOff: "Bluetooth is off. Turn on Bluetooth to continue.",
      locationOff: "Location is disabled. Enable location to continue.",
    },
  },

  // Proximity screen
  proximity: {
    // Empty state
    empty: {
      title: "No Device Selected",
      message: "Go to Scan and select a device to monitor its proximity.",
      button: "Go to Scan",
    },

    // Ready state
    ready: {
      message: "Tap the button below to start proximity monitoring.",
    },

    // Buttons
    startMonitoring: "Start Monitoring",
    monitoringLoading: "Initializing monitoring...",
    stopMonitoring: "Stop Monitoring",
    changeDevice: "Change Device",

    // Signal lost
    signalLost: {
      title: "Signal Lost",
      message:
        "The device is no longer responding. It may be out of range or turned off.",
      retry: "Try Again",
      newScan: "New Scan",
    },

    // Proximity levels
    levels: {
      near: "Very Close",
      medium: "Medium Distance",
      far: "Far Away",
      unknown: "Unknown",
    },

    // Distance
    distance: {
      estimated: "Estimated Distance",
      real: "Real Distance",
      precise: "PRECISE",
    },

    // RSSI
    rssi: {
      raw: "Raw RSSI",
    },

    // Permission/service errors
    errors: {
      bluetoothOff: {
        title: "Bluetooth Off",
        message: "Bluetooth needs to be enabled to monitor this device.",
      },
      locationOff: {
        title: "Location Disabled",
        message: "Location needs to be enabled to monitor devices.",
      },
      generic: {
        title: "Monitoring Error",
        message: "An error occurred while trying to start monitoring.",
      },
      openSettings: "Open Settings",
    },
  },

  // Environment screen
  environment: {
    // Idle
    idle: {
      initializingSensor: "Initializing sensor...",
      tapToStart: "Tap to start",
      description:
        "The magnetometer will detect variations in the magnetic field around you",
      hint: "Earth's normal magnetic field is 25-65 µT.\nElevated values may indicate interference from metal objects, motors, or nearby electronic devices.",
    },

    // States
    initializing: "Initializing magnetometer...",
    stopMonitoring: "Stop Monitoring",

    // Labels
    statusLabel: "ENVIRONMENT STATUS",
    axis: "Axis",

    // Status
    status: {
      stable: "Stable Environment",
      moderate: "Moderate Interference",
      high: "Elevated Magnetic Field",
      extreme: "Strong Interference",
    },

    // Sensor unavailable
    unavailable: {
      title: "Sensor Unavailable",
      message:
        "Your device does not have a magnetometer or it is not accessible.",
    },

    // Error
    error: {
      title: "Error Accessing Sensor",
    },

    // Educational tip
    tip: "Variations in the magnetic field can be caused by metal objects, motors, speakers, or nearby electronic devices. Elevated values do not necessarily mean danger.",
  },

  // Education screen
  education: {
    title: "Education",
    subtitle: "Understand how the app works and what each measurement means.",
    tip: "Tip",
    disclaimer:
      "We make no absolute promises about detection or measurement. Use with awareness.",

    // Topics
    topics: {
      // 1. Introduction
      intro: {
        title: "What is SignalSense?",
        description:
          "Get to know the app and understand what it does — and what it doesn't.",
        sections: [
          {
            title: "Overview",
            content:
              "SignalSense is a tool that analyzes radio signals (Bluetooth) and magnetic fields to help you understand your surroundings. It transforms technical data into understandable information.",
          },
          {
            title: "What it does",
            content:
              "• Detects devices emitting Bluetooth (BLE) signals\n• Estimates proximity to selected devices\n• Monitors variations in the ambient magnetic field\n• Records a complete session history\n• Identifies potential trackers (AirTag, Tile, etc.)\n• Allows naming and managing device profiles\n• Presents data in a visual and educational way",
          },
          {
            title: "What it does NOT do",
            content:
              "• Does not detect turned-off or hidden devices without signal\n• Is not a metal detector\n• Cannot see through walls accurately\n• Does not identify specific people or objects\n• Does not replace professional security equipment\n• Does not detect Classic Bluetooth (BLE only)",
          },
        ],
        tip: "Use SignalSense as an awareness tool, not as an absolute security device.",
      },

      // 2. Scan
      scan: {
        title: "How Scan Works",
        description:
          "Understand how signal scanning detects devices around you.",
        sections: [
          {
            title: "Bluetooth Low Energy (BLE)",
            content:
              "Scan detects devices that are actively emitting BLE (Bluetooth Low Energy) signals. Bluetooth is used by headphones, watches, speakers, trackers, and smart devices. Classic Bluetooth devices (like some older headphones) are not detectable by the scan.",
          },
          {
            title: "What 'device found' means",
            content:
              "When a device appears in the list, it means it's emitting a signal that your phone could pick up. This does NOT necessarily mean it's nearby — signals can pass through walls and travel tens of meters.",
          },
          {
            title: "Device list interactions",
            content:
              "• Quick tap: selects the device for proximity monitoring\n• Long press (press and hold): opens the full device profile with session history, custom name, and technical details\n• Signal bars: show real-time RSSI strength\n• Tracker badge: appears when the device is identified as a potential tracker",
          },
          {
            title: "Advanced filters (Premium)",
            content:
              "• Name search: search devices by name or custom name\n• Signal filter: Strong (≥ -60 dBm), Medium (-60 to -80 dBm), Weak (< -80 dBm)\n• Trackers only: shows only devices identified as trackers\n• Named only: shows only devices with a custom name\n• Sorting: by signal (RSSI), by name, or by last seen",
          },
          {
            title: "Why results vary",
            content:
              "• Walls and obstacles attenuate the signal\n• Other devices can cause interference\n• Some devices emit intermittent signals\n• Phone orientation affects reception\n• Metallic materials reflect signals",
          },
          {
            title: "How Bluetooth works",
            content:
              "• Scan processes devices in batches every 100ms\n• Each device is updated at most every 500ms to avoid overload\n• BLE devices emit periodic signals (advertisements)\n• Typical range is 10-30 meters indoors\n• Signal strength decreases with distance and obstacles",
          },
        ],
        tip: "Devices that don't appear may be turned off, in airplane mode, or simply out of range. Long-press a device to see its full profile.",
      },

      // 3. Proximity
      proximity: {
        title: "How Proximity Works",
        description: "Learn how the app estimates distance to a device.",
        sections: [
          {
            title: "What is RSSI",
            content:
              "RSSI (Received Signal Strength Indicator) is the measure of received signal strength, in dBm. Values closer to 0 indicate stronger signal. Ex: -30 dBm is very strong, -90 dBm is very weak.",
          },
          {
            title: "Distance estimation",
            content:
              "The app uses the Friis model (signal propagation) to convert RSSI into estimated distance. The formula considers transmission power (TX Power), environmental factor (2.0 to 4.0), and applies automatic calibration based on sample history.",
          },
          {
            title: "How the app stabilizes values",
            content:
              "The app uses multiple techniques to smooth distance:\n• EMA (Exponential Moving Average) smoothing on RSSI with factor 0.3 — 70% of previous value is preserved\n• TX Power calibration via median of last 30 samples, recalibrated every 30 new samples\n• Environmental factor with smooth transition (no abrupt jumps)\n• Final distance smoothing (EMA 0.2)\n• UI updates every 300ms, aligned with animations",
          },
          {
            title: "Proximity levels",
            content:
              "• Near (RSSI ≥ -60 dBm): device probably within 2 meters\n• Medium (RSSI between -60 and -80 dBm): device several meters away\n• Far (RSSI < -80 dBm): device distant or with obstacles\n• If the device doesn't respond for 5 seconds, signal is considered lost",
          },
          {
            title: "Why distance varies even when stationary",
            content:
              "Even with a stationary phone, RSSI naturally varies ±2-5 dBm due to reflections and environmental interference. Since the distance formula is exponential, small RSSI changes cause larger distance changes. The app minimizes this with smoothing, but slight variations are normal and expected.",
          },
          {
            title: "RSSI Graph (Premium)",
            content:
              "The real-time graph shows RSSI variation over time, with up to 80 visible samples. Includes current, minimum, and maximum RSSI statistics. Useful for identifying signal patterns and testing positioning.",
          },
        ],
        tip: "Treat estimated distance as an approximate reference. For best results, keep the phone still and unobstructed between it and the device.",
      },

      // 4. Environment
      environment: {
        title: "How Environment Works",
        description:
          "Understand what the magnetometer measures and what the values mean.",
        sections: [
          {
            title: "What is the Magnetometer",
            content:
              "The magnetometer is a sensor present in most smartphones that measures magnetic fields in microteslas (µT). It's used in digital compasses and navigation apps.",
          },
          {
            title: "Normal magnetic field",
            content:
              "Earth's magnetic field varies between 25-65 µT depending on location. Stable values in this range indicate an environment without significant interference.",
          },
          {
            title: "What causes variations",
            content:
              "• Metal objects (furniture, structures)\n• Magnets and speakers\n• Electric motors\n• High-voltage cables\n• Turned-on electronic devices",
          },
          {
            title: "What the levels mean",
            content:
              "The app uses hysteresis to prevent oscillation at boundaries:\n• Stable: below 70 µT (returns to stable below 55 µT)\n• Moderate: between 55-150 µT (changes to elevated above 150 µT)\n• Elevated: between 120-400 µT (changes to extreme above 400 µT)\n• Extreme: above 400 µT (returns to elevated below 330 µT)",
          },
          {
            title: "How monitoring works",
            content:
              "• Sensor updates at ~30 FPS (every 33ms)\n• EMA smoothing with factor 0.3 to prevent micro-tremors\n• X, Y, and Z values are animated directly in the UI (60 FPS) without re-renders\n• Haptic feedback vibrates when level increases, with minimum 800ms interval\n• Visual status updates at most 2x per second to prevent flickering",
          },
        ],
        tip: "High values don't mean danger — they just indicate the presence of nearby magnetic sources. Move the phone slowly to map the source.",
      },

      // 5. History
      history: {
        title: "Session History",
        description:
          "Understand how the app records and organizes your monitoring sessions.",
        sections: [
          {
            title: "What is recorded",
            content:
              "Every time you run a scan, monitor a device's proximity, or use the environment sensor, the app creates a session in the history. Each session records: start and end time, duration, session type, and relevant data.",
          },
          {
            title: "Session types",
            content:
              "• BLE Scan: records all devices found, with RSSI statistics (min, max, average) for each\n• Proximity: records monitoring of a specific device, with RSSI and estimated distance samples\n• Environment: records magnetometer readings (X, Y, Z, magnitude, and status) over time",
          },
          {
            title: "History filters",
            content:
              "Use the chips at the top of the screen to filter by type:\n• All: shows all sessions\n• Scan: BLE scan sessions only\n• Proximity: proximity monitoring sessions only\n• Environment: magnetometer sessions only",
          },
          {
            title: "Session management",
            content:
              "• Swipe a session left to delete it\n• Sessions are grouped by date (Today, Yesterday, or full date)\n• Duration and device count are shown on each card\n• Pull down to refresh the list",
          },
          {
            title: "Free limit",
            content:
              "Free users can view the last 3 sessions. To access full, unlimited history, Premium is required.",
          },
        ],
        tip: "History is saved locally on your device. Sessions are only created when monitoring actually starts receiving data — if you cancel during loading, no empty session is created.",
      },

      // 6. Device Profiles
      deviceProfiles: {
        title: "Device Profiles",
        description:
          "Learn how to manage detected devices and customize their names.",
        sections: [
          {
            title: "What is a device profile",
            content:
              "Each Bluetooth device detected by the app automatically gets a profile. The profile stores: Bluetooth ID, original name (if available), custom name, first and last detection, appearance count, and whether it's a potential tracker.",
          },
          {
            title: "How to access the profile",
            content:
              "On the Scan screen, long-press (press and hold) any device in the list to open its full profile. The profile is a Premium feature.",
          },
          {
            title: "Custom name",
            content:
              "• Tap the edit icon next to the name to set a custom name\n• The custom name appears across all app screens (Scan, Proximity, History)\n• Maximum 30 characters\n• To remove the custom name, tap the X next to the name",
          },
          {
            title: "GATT name discovery",
            content:
              "If a device has no visible name, you can try to discover it. The app tries multiple strategies:\n• System BLE cache (no connection)\n• Direct connection and GATT reading\n• autoConnect fallback on Android\n\nNote: Classic Bluetooth (non-BLE) devices may not respond. In that case, use a custom name.",
          },
          {
            title: "Appearance history",
            content:
              "The profile shows all scan sessions where the device was detected, with date, duration, device count in the session, and RSSI statistics (average). Premium exclusive feature.",
          },
        ],
        tip: "Use custom names to easily identify your known devices. The name appears throughout the entire app.",
      },

      // 7. Premium
      premium: {
        title: "Premium Plan",
        description:
          "Learn about exclusive features and what the free plan offers.",
        sections: [
          {
            title: "What's free",
            content:
              "• Full and unlimited BLE scan\n• Proximity monitoring (distance and level)\n• Magnetic field monitoring (environment)\n• Up to 3 sessions in history\n• Complete education tab\n• Light and dark themes",
          },
          {
            title: "What Premium unlocks",
            content:
              "• Unlimited session history\n• Device profiles (long-press on scan)\n• Tracker detection (AirTag, Tile, SmartTag, etc.)\n• Real-time RSSI graph in Proximity\n• Data export as CSV\n• Advanced filters in Scan (search, signal, trackers, named, sorting)",
          },
          {
            title: "How the purchase works",
            content:
              "Premium is a one-time purchase — no subscription, no recurring charges. Once purchased, it's yours forever. The purchase is processed through Google Play.",
          },
          {
            title: "Restore purchase",
            content:
              "If you switch phones, reinstall the app, or factory reset your device, your purchase is not lost. Google keeps a record of your purchase linked to your Google account.\n\nJust tap 'Restore previous purchase' on the Premium screen — the app checks the store, confirms you already paid, and unlocks Premium again. No additional cost.",
          },
          {
            title: "Regional pricing",
            content:
              "Premium pricing is automatically adjusted for your region. If you're in Brazil, the price appears in BRL; in India, in INR — adapted to your local market.\n\nThis is handled directly by Google Play — ensuring a fair and accessible price regardless of your country.",
          },
        ],
        tip: "The free plan already offers all core features. Premium is for those who want the most out of the app.",
      },

      // 8. Anti-Stalking
      antiStalking: {
        title: "Anti-Stalking Protection",
        description:
          "Learn how the app helps detect Bluetooth devices that may be following you.",
        sections: [
          {
            title: "What is Anti-Stalking?",
            content:
              "The anti-stalking feature monitors all Bluetooth (BLE) devices around you — not just known trackers like AirTags or Tiles, but any device that appears to be moving with you over time. If a device is detected near you consistently for 15+ minutes, you receive an alert. This broader approach ensures that even improvised or lesser-known tracking devices are caught.",
          },
          {
            title: "How detection works",
            content:
              "The app periodically scans for all BLE devices in range. Known trackers (AirTag, Tile, SmartTag, etc.) are identified with higher confidence, while unknown devices are tracked with lower confidence. If any device persists beyond the configured time window (default 15 minutes) with a minimum number of sightings, it's flagged as suspicious.",
          },
          {
            title: "Background monitoring",
            content:
              "When enabled, the app continues scanning even when minimized. It runs short scan bursts in the background and sends a push notification if a suspicious device is found. Background scanning uses minimal battery.",
          },
          {
            title: "Trusted devices",
            content:
              "You can mark any device as trusted from its profile screen to avoid false alerts. For example, your own headphones, a smartwatch, or a family member's AirTag. Trusted devices are permanently ignored by the detection system until you remove them.",
          },
          {
            title: "Limitations",
            content:
              "• Detection depends on devices actively emitting BLE signals\n• Some devices may rotate their Bluetooth address, making persistent tracking harder\n• Background scan frequency depends on OS restrictions\n• Monitoring all devices may generate more alerts — use the trust feature to reduce noise\n• This is an awareness tool, not a security guarantee\n• If you feel unsafe, contact local authorities",
          },
        ],
        tip: "Keep anti-stalking enabled when traveling alone or in unfamiliar areas. If you receive an alert, check your belongings and surroundings carefully. You can trust your own devices from their profile to reduce false alerts.",
      },

      // 9. Wi-Fi Info
      wifiInfo: {
        title: "Wi-Fi Network Info",
        description:
          "Understand how Wi-Fi analysis works and what information is available.",
        sections: [
          {
            title: "What is Wi-Fi Info?",
            content:
              "The Wi-Fi Info feature lets you monitor your current Wi-Fi connection in real time — including signal strength, frequency band, IP address, and more. It helps you understand your network environment at a glance.",
          },
          {
            title: "Signal quality",
            content:
              "Signal strength is measured as a percentage (0-100%). Excellent (80%+) means fast, stable connection. Good (60-79%) is reliable for most tasks. Fair (40-59%) may cause slower speeds. Weak or Poor signal may lead to disconnections.",
          },
          {
            title: "Frequency bands",
            content:
              "Wi-Fi operates on different frequency bands:\n• 2.4 GHz — longer range but slower, more interference\n• 5 GHz — faster speeds, shorter range, less congestion\n• 6 GHz — newest band, fastest speeds, shortest range\n\nThe app shows which band your connection uses.",
          },
          {
            title: "Nearby network scanning",
            content:
              "The premium version can scan all nearby Wi-Fi networks. This shows each network's signal strength (RSSI in dBm), channel, frequency band, and security type. This is useful for finding less congested channels.",
          },
          {
            title: "Channel analysis",
            content:
              "Multiple networks on the same channel cause interference. The channel analysis chart (premium) shows how many networks occupy each channel, helping you identify the least congested channel for your router.",
          },
          {
            title: "Signal Tracker",
            content:
              "The Signal Tracker lets you locate your router by tracking Wi-Fi signal strength in real time. It features an animated radar that reacts to signal changes, an estimated distance to the router, and a signal strength progress bar. Walk around your home and watch the signal update live — the closer you get to the router, the stronger the signal. The signal history graph (premium) shows how the signal varies over time.",
          },
        ],
        tip: "Use the Signal Tracker to find the best spot for your devices. Walk around and watch the radar — when the signal is strongest, you're closest to your router. For the best experience, connect to a 5 GHz network when nearby.",
      },

      // 10. Interference
      interference: {
        title: "What Causes Interference",
        description:
          "Learn about factors that affect signal and magnetic field measurements.",
        sections: [
          {
            title: "Radio signal interference",
            content:
              "• Walls (especially concrete and metal)\n• Water (including the human body)\n• Other devices on the same frequency\n• Microwaves and industrial equipment\n• Congested Wi-Fi networks",
          },
          {
            title: "Magnetic interference",
            content:
              "• Metal structures (beams, gates)\n• Appliances (refrigerator, washing machine)\n• Electronics (computers, TVs)\n• Nearby vehicles\n• Electrical cables in walls",
          },
          {
            title: "How to minimize interference",
            content:
              "• Move away from large metal structures\n• Avoid measuring near powered appliances\n• Keep your phone away from other devices\n• Test in different positions and orientations",
          },
        ],
      },

      // 9. Limitations
      limitations: {
        title: "App Limitations",
        description: "It's important to understand what SignalSense CANNOT do.",
        sections: [
          {
            title: "It's not a GPS",
            content:
              "The app doesn't use GPS for device location. Distance estimation is based only on radio signal strength, which is much less accurate.",
          },
          {
            title: "Can't see through walls",
            content:
              "Although radio signals pass through walls, attenuation causes significant inaccuracies. You cannot determine with certainty if a device is in the next room.",
          },
          {
            title: "Doesn't identify people or objects",
            content:
              "The app detects device signals, not people. A Bluetooth signal could be from forgotten headphones, not necessarily from a person.",
          },
          {
            title: "Not professional equipment",
            content:
              "SignalSense uses your smartphone's sensors, which are designed for general use. Professional security or measurement equipment is much more accurate and reliable.",
          },
          {
            title: "Doesn't detect turned-off devices",
            content:
              "If a device is turned off, in airplane mode, or not actively emitting signals, it will be invisible to Scan. The app detects Bluetooth Low Energy (BLE) only, not Classic Bluetooth.",
          },
        ],
        tip: "Use SignalSense to learn and gain awareness, not as a definitive security tool.",
      },

      // 10. Best Practices
      bestPractices: {
        title: "Best Practices",
        description: "Tips for getting the best results with SignalSense.",
        sections: [
          {
            title: "Phone positioning",
            content:
              "• Hold the phone with the screen facing up\n• Avoid covering the edges with your hands\n• Keep the phone relatively still during measurements\n• The antenna is usually at the bottom or top",
          },
          {
            title: "Test environment",
            content:
              "• First test in a known, quiet location\n• Compare results in different environments\n• Remember that each location has its characteristics\n• Take multiple measurements to confirm patterns",
          },
          {
            title: "Data interpretation",
            content:
              "• Don't draw conclusions from a single measurement\n• Observe trends and patterns over time\n• Consider the environmental context\n• Remember the technical limitations",
          },
          {
            title: "Responsible use",
            content:
              "• Use the app for educational and awareness purposes\n• Respect other people's privacy\n• Don't use for illegal or unethical activities\n• Share knowledge responsibly",
          },
        ],
        tip: "Practice and experimentation are the best ways to understand how signals behave in your environment.",
      },
    },
  },

  // History
  history: {
    title: "History",
    device: "device",
    devices: "devices",
    session: "total session",
    sessions: "total sessions",
    showingLast: "showing last",
    empty: "No sessions recorded yet. Run a scan to get started.",
    premiumHint: "Unlock Premium to access your full history.",
    today: "Today",
    yesterday: "Yesterday",
    duration: {
      seconds: "s",
      minutes: "min",
      hours: "h",
    },
    filterAll: "All",
    filterScan: "Scan",
    filterProximity: "Proximity",
    filterEnvironment: "Environment",
    filterWifi: "Wi-Fi",
    sessionTypes: {
      scan: "BLE Scan",
      proximity: "Proximity",
      environment: "Environment",
      wifi: "Wi-Fi",
    },
  },

  // Device Profile
  deviceProfile: {
    notFound: "Device not found.",
    bleId: "Bluetooth ID",
    firstSeen: "First seen",
    lastSeen: "Last seen",
    appearances: "Appearances",
    sessionHistory: "Session History",
    noSessions: "No sessions recorded for this device.",
    signal: "Signal",
    resolveName: "Discover name",
    resolveNameHint:
      "Briefly connects to the device to get its name. Uses more energy.",
    resolveNameError:
      "Could not connect to the device. Make sure it's on and nearby.",
    resolveNameTimeout:
      "Could not connect. The device may use Classic Bluetooth (e.g. headphones) which doesn't support BLE name reading. Try naming it manually.",
    resolveNameGattFailed:
      "Connected to the device, but it didn't allow data reading. It may require pairing.",
    resolveNameNotFound:
      "Connected to the device, but it doesn't share its name through any known BLE method.",
    editName: "Edit name",
    editNamePlaceholder: "Device name",
    editNameSave: "Save",
    editNameClear: "Remove name",
    editNameLimitReached: "Character limit reached.",
    editNameNoMultipleSpaces: "Consecutive spaces not allowed.",
    editNameNoLeadingSpace: "Name cannot start with a space.",
    deleteNameTitle: "Remove custom name",
    deleteNameMessage:
      "Are you sure you want to remove the custom name for this device?",
    trustDevice: "Trust this device",
    trustedDevice: "Trusted device",
  },

  // Tracker Detection
  tracker: {
    detected: "Tracker Detected",
    subtitle: "This device appears to be a tracker",
    brand: "Brand",
    type: "Type",
    confidence: "Confidence",
    confidenceHigh: "High",
    confidenceMedium: "Medium",
    safetyTip:
      "If you found an unknown tracker near you, consider checking your belongings. Trackers can be used for unauthorized monitoring.",
  },

  // RSSI Graph
  rssiGraph: {
    title: "Signal Graph",
    waiting: "Waiting for signal data...",
    weaker: "Weaker",
    stronger: "Stronger",
    min: "Min",
    max: "Max",
  },

  // Export
  export: {
    sessions: "Export Sessions",
    sessionsDesc: "Export scan history as CSV",
    devices: "Export Devices",
    devicesDesc: "Export known device list as CSV",
    csv: {
      id: "ID",
      startedAt: "Started At",
      finishedAt: "Finished At",
      durationMs: "Duration (ms)",
      deviceCount: "Device Count",
      bleId: "BLE ID",
      name: "Name",
      customName: "Custom Name",
      firstSeen: "First Seen",
      lastSeen: "Last Seen",
      appearances: "Appearances",
      isTracker: "Is Tracker",
      trackerType: "Tracker Type",
      yes: "Yes",
      no: "No",
    },
  },

  // Filters
  filters: {
    search: "Search device...",
    signalStrength: "Signal",
    trackersOnly: "Trackers only",
    namedOnly: "Named only",
    sortBy: "Sort by",
    sortRssi: "Signal",
    sortName: "Name",
    sortLastSeen: "Last seen",
    clear: "Clear filters",
  },

  // Premium
  premium: {
    gate: {
      message: "This feature is exclusive to Premium.",
      deviceProfile:
        "Unlock session history and track when this device was detected.",
      button: "See Premium",
    },
  },

  // Paywall
  paywall: {
    title: "Premium",
    headline: "Unlock Everything",
    subheadline:
      "Full access to all SignalSense features with a single purchase.",
    buyButton: "Buy for {price}",
    buyButtonLoading: "Loading price...",
    oneTimePurchase: "One-time purchase — no subscription",
    restore: "Restore previous purchase",
    alreadyPremium: "You're already Premium!",
    regionalPricing: {
      title: "Regional pricing applied",
      message: "The price is already adjusted for your region.",
    },
    features: {
      history: {
        title: "Unlimited History",
        desc: "Access all your previous scan sessions",
      },
      deviceProfiles: {
        title: "Device Profiles",
        desc: "View full details and history for each device",
      },
      tracker: {
        title: "Tracker Detection",
        desc: "Identify AirTags, Tiles, and other trackers",
      },
      rssiGraph: {
        title: "Real-Time RSSI Graph",
        desc: "Visualize signal variation over time",
      },
      export: {
        title: "Export Data",
        desc: "Export sessions and devices as CSV",
      },
      filters: {
        title: "Advanced Filters",
        desc: "Filter by signal, name, type, and more",
      },
      antiStalking: {
        title: "Advanced Anti-Stalking",
        desc: "Configure trusted devices and custom detection settings",
      },
      wifiInfo: {
        title: "Wi-Fi Network Analysis",
        desc: "Scan nearby networks, channel analysis, and detailed info",
      },
    },
  },

  // Anti-Stalking
  antiStalking: {
    toggle: {
      label: "Anti-Stalking",
      monitoring: "Monitoring active",
      off: "Monitoring disabled",
    },
    alert: {
      title: "Possible Tracker Detected",
      following: "Following you for {duration} min",
      avgSignal: "Avg signal: {rssi} dBm",
      dismiss: "Dismiss",
      trustDevice: "Trust",
    },
    banner: {
      monitoring: "Anti-stalking active",
      alertCount: "{count} alert(s)",
    },
    alertSheet: {
      title: "Tracking Alerts",
      noAlerts: "No active alerts. You're safe!",
    },
    notification: {
      title: "Tracking Alert",
      body: "A {type} ({brand}) has been near you for {duration} {unit}.",
      bodyUnknown: "An unknown device has been near you for {duration} {unit}.",
      minute: "minute",
      minutes: "minutes",
    },
    errors: {
      startFailed: "Failed to start anti-stalking monitoring",
      notificationPermission:
        "Notification permission is required for tracker alerts",
      backgroundPermission: "Background location permission is required",
    },
  },

  // Wi-Fi
  wifi: {
    idle: {
      tapToStart: "Tap to analyze Wi-Fi",
      description:
        "Monitor your Wi-Fi connection in real time with signal strength, frequency, and network details.",
      hint: "The app will display your current connection info. Premium users can also scan nearby networks and analyze channels.",
    },
    scanning: "Analyzing network...",
    stopMonitoring: "Stop monitoring",
    connection: {
      title: "Current connection",
      signal: "Signal quality",
      frequency: "Frequency",
      band: "Band",
      ip: "IP Address",
      subnet: "Subnet",
      ssid: "Network name",
      connected: "Connected",
      disconnected: "Not connected to Wi-Fi",
      hidden: "Hidden network",
      cellular: "Connected via cellular data",
      otherNetwork: "Connected to a non-Wi-Fi network",
    },
    signal: {
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      weak: "Weak",
      poor: "Poor",
    },
    networks: {
      title: "Nearby networks",
      empty: "No networks found",
      scanning: "Scanning nearby networks...",
      iosNote:
        "Nearby network scanning requires location permission to detect Wi-Fi networks.",
    },
    channels: {
      title: "Channel analysis",
      low: "Low",
      medium: "Medium",
      high: "High",
    },
    unavailable: {
      title: "No Connection",
      message:
        "You're not connected to any network. Please connect to Wi-Fi and try again.",
    },
    error: {
      title: "Error",
    },
    tip: "5 GHz networks offer faster speeds with less interference. If your signal is weak, try moving closer to the router or switching bands.",
    tracker: {
      title: "Signal Tracker",
      trackSignal: "Track Signal",
      estimatedDistance: "Estimated distance",
      approximation: "Approximate estimate",
      graphTitle: "Signal history",
      graphWaiting: "Collecting signal data...",
      min: "Min",
      max: "Max",
    },
  },

  // Camera Detector
  cameraDetector: {
    title: "Camera Detector",
    subtitle: "Find hidden Wi-Fi cameras",
    entryTitle: "Camera Detector",
    entrySubtitle: "Sweep for hidden Wi-Fi cameras around you",
    scanButton: "Start sweep",
    rescanButton: "Scan again",
    scanning: "Looking for devices around you...",
    hiddenSsid: "Hidden network",
    footer:
      "This tool reduces risk, it does not guarantee safety. No app catches every camera — pair it with a physical search (lens glare, suspicious holes, out-of-place objects).",
    intro: {
      title: "Sweep for hidden cameras",
      body: "Spy cameras in hotel rooms and Airbnbs almost always use Wi-Fi. This sweep helps you locate them using your phone's sensors.",
      disclaimer:
        "Honest result: we flag suspicious devices, we never claim 'you are safe'. An ordinary router can show up too — use your judgment.",
      tips: {
        wifi: {
          title: "Cameras with their own Wi-Fi",
          body: "We detect and locate by proximity any camera that broadcasts its own network.",
        },
        network: {
          title: "Cameras on the venue network",
          body: "We look for cameras already joined to the Wi-Fi (RTSP/ONVIF ports). Detects presence, not location.",
        },
        physical: {
          title: "Physical search",
          body: "Check for lens reflections, outlets, smoke detectors and objects pointed at the bed.",
        },
      },
    },
    suspicion: {
      high: "High suspicion",
      medium: "Medium suspicion",
      low: "Low suspicion",
      none: "Ordinary",
    },
    reasons: {
      knownVendor: "Camera vendor",
      ssidPattern: "Suspicious name",
      hiddenSsid: "Hidden network",
      openNetwork: "Open network",
      strongSignalClose: "Very strong signal (close)",
    },
    results: {
      suspectsTitle: "Suspicious nearby APs",
      suspectsSubtitle:
        "Sorted by suspicion and signal. Tap one to hunt it by proximity.",
      noSuspects:
        "No nearby networks found. Turn on Wi-Fi and location, then try again.",
      networkTitle: "Cameras on the network",
      networkSubtitle:
        "Looks for cameras joined to your current Wi-Fi (you must be on the same network).",
      networkScanButton: "Scan the network",
      networkRescan: "Scan again",
      networkScanning: "Sweeping the network...",
      networkNone: "No camera-like devices found on the network.",
      networkUnavailable:
        "Unavailable right now. Connect to Wi-Fi — and this feature turns on after you update the app.",
      networkError: "Could not sweep the network. Try again.",
    },
    hostKind: {
      camera: "Possible camera",
      nvr: "Possible recorder (NVR/DVR)",
      generic: "Device with a camera port",
    },
    host: {
      ports: "Ports",
    },
    hunt: {
      estimatedDistance: "Estimated distance",
      approximation: "Approximate estimate by RSSI",
      rssiTitle: "Live signal",
      back: "Back to list",
      throttleNote:
        "Android limits how often Wi-Fi can be scanned, so the distance updates every few seconds. Move slowly to feel the signal get warmer or colder.",
      guidance: {
        near: "🔥 Very close — search here!",
        medium: "Getting warmer — keep moving.",
        far: "Cold — move away in that direction.",
        unknown: "Searching for the signal...",
      },
    },
    errors: {
      locationOff: {
        title: "Turn on location",
        message:
          "Android requires location to be on in order to scan nearby Wi-Fi networks.",
      },
      notAndroid: {
        title: "Android only",
        message:
          "Wi-Fi scanning is only available on Android. iOS does not allow this access.",
      },
      scanFailed: {
        title: "Sweep failed",
        message: "Could not scan the networks. Try again.",
      },
      openSettings: "Open settings",
      retry: "Try again",
    },
  },

  // Common
  common: {
    close: "Close",
    cancel: "Cancel",
    loading: "Loading...",
    retry: "Try again",
    unknownDevice: "Unknown Device",
    unknown: "Unknown",
  },
  splash: {
    tagline: "detect · analyze · protect",
  },
};
