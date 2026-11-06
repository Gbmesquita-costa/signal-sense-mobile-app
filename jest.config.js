// https://docs.expo.dev/develop/unit-testing/
/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/android/",
    "<rootDir>/ios/",
    "<rootDir>/.expo/",
  ],
  // jest-expo's default list plus ESM-only packages this app imports
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@shopify/.*|@gorhom/.*|lucide-react-native|nativewind|react-native-css-interop)",
  ],
  collectCoverageFrom: [
    "services/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "stores/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!**/index.ts",
    "!**/*.types.ts",
  ],
};
