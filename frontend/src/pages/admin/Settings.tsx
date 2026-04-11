import { useState } from 'react';
import { Save, RotateCcw, MapPin, Film, Route, CheckCircle } from 'lucide-react';
import type { AppSettings } from '../../types/admin';

const defaultSettings: AppSettings = {
  discoveryRadius: 5,
  crossingDistance: 50,
  locationUpdateInterval: 30,
  reelsEnabled: true,
  crossingsEnabled: true,
};

export function Settings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof AppSettings, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setSaved(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF006E] to-[#833AB4] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF006E]" />
            Location Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Discovery Radius (km)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={settings.discoveryRadius}
                  onChange={(e) => handleChange('discoveryRadius', parseInt(e.target.value))}
                  className="flex-1 accent-[#FF006E]"
                />
                <span className="w-12 text-center font-medium text-gray-900">{settings.discoveryRadius}km</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Crossing Distance (meters)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={settings.crossingDistance}
                  onChange={(e) => handleChange('crossingDistance', parseInt(e.target.value))}
                  className="flex-1 accent-[#FF006E]"
                />
                <span className="w-12 text-center font-medium text-gray-900">{settings.crossingDistance}m</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Location Update Interval (seconds)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={settings.locationUpdateInterval}
                  onChange={(e) => handleChange('locationUpdateInterval', parseInt(e.target.value))}
                  className="flex-1 accent-[#FF006E]"
                />
                <span className="w-12 text-center font-medium text-gray-900">{settings.locationUpdateInterval}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Toggles</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Film className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Reels</p>
                  <p className="text-sm text-gray-500">Enable/disable reels feature</p>
                </div>
              </div>
              <button
                onClick={() => handleChange('reelsEnabled', !settings.reelsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.reelsEnabled ? 'bg-[#FF006E]' : 'bg-gray-300'
                }`}
              >
                <span className={`block w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                  settings.reelsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Route className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Crossings</p>
                  <p className="text-sm text-gray-500">Enable/disable crossing detection</p>
                </div>
              </div>
              <button
                onClick={() => handleChange('crossingsEnabled', !settings.crossingsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.crossingsEnabled ? 'bg-[#FF006E]' : 'bg-gray-300'
                }`}
              >
                <span className={`block w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                  settings.crossingsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">App Information</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Version</span>
              <span className="font-medium text-gray-900">v1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Build</span>
              <span className="font-medium text-gray-900">2024.01.15</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">API Version</span>
              <span className="font-medium text-gray-900">v1</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Environment</span>
              <span className="font-medium text-green-600">Production</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;