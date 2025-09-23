import React, { useState } from 'react';
import { Star, Heart, Settings } from 'lucide-react';
import { Toggle } from './Toggle';

export function ToggleExample() {
  const [pressed1, setPressed1] = useState(false);
  const [pressed2, setPressed2] = useState(false);
  const [pressed3, setPressed3] = useState(false);

  return (
    <div className="p-8 space-y-8 bg-background">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Toggle Component Examples</h2>

        {/* Basic Examples */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Basic Toggles</h3>
          <div className="flex gap-4 flex-wrap">
            <Toggle pressed={pressed1} onClick={() => setPressed1(!pressed1)}>
              Default Toggle
            </Toggle>

            <Toggle variant="outline" pressed={pressed2} onClick={() => setPressed2(!pressed2)}>
              Outline Toggle
            </Toggle>
          </div>
        </div>

        {/* Size Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Sizes</h3>
          <div className="flex gap-4 items-center flex-wrap">
            <Toggle size="sm">Small</Toggle>
            <Toggle size="default">Default</Toggle>
            <Toggle size="lg">Large</Toggle>
          </div>
        </div>

        {/* Custom Icons */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Custom Icons</h3>
          <div className="flex gap-4 flex-wrap">
            <Toggle icon={<Star />} pressed={pressed3} onClick={() => setPressed3(!pressed3)}>
              Favorite
            </Toggle>

            <Toggle icon={<Heart />}>Like</Toggle>
            <Toggle icon={<Settings />}>Settings</Toggle>
          </div>
        </div>

        {/* Icon Only */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Icon Only</h3>
          <div className="flex gap-4 flex-wrap">
            <Toggle showText={false} icon={<Star />} />
            <Toggle showText={false} icon={<Heart />} variant="outline" />
            <Toggle showText={false} icon={<Settings />} size="lg" />
          </div>
        </div>

        {/* States */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">States</h3>
          <div className="flex gap-4 flex-wrap">
            <Toggle>Normal</Toggle>
            <Toggle pressed>Pressed</Toggle>
            <Toggle disabled>Disabled</Toggle>
            <Toggle variant="outline" pressed>
              Outline Pressed
            </Toggle>
          </div>
        </div>
      </div>
    </div>
  );
}
