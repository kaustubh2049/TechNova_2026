import React from "react";
import Svg, { Path, G, Circle } from "react-native-svg";

interface IndiaMapProps {
  width: number;
  height: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export function IndiaMapSVG({
  width,
  height,
  fillColor = "#e2e8f0",
  strokeColor = "#94a3b8",
  strokeWidth = 2,
}: IndiaMapProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 400 500">
      <G>
        {/* Main India landmass - simplified outline */}
        <Path
          d="M80 120 
             C85 110, 95 105, 105 110
             L120 115
             C130 112, 140 115, 145 125
             L150 140
             C155 145, 160 150, 170 145
             L185 140
             C195 135, 205 140, 210 150
             L220 160
             C225 170, 235 175, 245 170
             L260 165
             C270 160, 280 165, 285 175
             L290 190
             C295 200, 305 205, 315 200
             L330 195
             C340 190, 350 195, 355 205
             L365 220
             C370 230, 375 240, 370 250
             L365 270
             C360 280, 365 290, 370 300
             L375 320
             C380 330, 375 340, 370 350
             L360 370
             C355 380, 350 390, 345 400
             L335 420
             C330 430, 325 435, 315 430
             L300 425
             C290 420, 280 425, 270 430
             L250 435
             C240 440, 230 435, 220 430
             L200 425
             C190 420, 180 425, 170 430
             L150 435
             C140 440, 130 435, 120 430
             L100 425
             C90 420, 80 415, 75 405
             L70 385
             C65 375, 70 365, 75 355
             L80 335
             C75 325, 80 315, 85 305
             L90 285
             C85 275, 90 265, 95 255
             L100 235
             C95 225, 90 215, 85 205
             L80 185
             C75 175, 80 165, 85 155
             L90 135
             C85 125, 80 120, 80 120 Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* Gujarat peninsula */}
        <Path
          d="M75 200 
             C70 195, 65 200, 60 205
             L55 215
             C50 225, 55 235, 60 240
             L70 245
             C75 250, 80 245, 85 240
             L90 230
             C95 220, 90 210, 85 205
             L80 200
             C77 198, 75 200, 75 200 Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* Tamil Nadu southern tip */}
        <Path
          d="M300 420
             C295 415, 290 420, 285 425
             L280 435
             C275 445, 280 455, 285 460
             L295 465
             C305 470, 315 465, 320 460
             L325 450
             C330 440, 325 430, 320 425
             L310 420
             C305 418, 300 420, 300 420 Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* Andaman & Nicobar Islands (simplified) */}
        <Path
          d="M380 300 C382 298, 384 300, 385 302 L387 308 C388 312, 386 316, 384 318 L382 322 C380 324, 378 322, 377 320 L375 314 C374 310, 376 306, 378 304 Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* Lakshadweep (tiny islands) */}
        <Circle
          cx="50"
          cy="350"
          r="2"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1"
        />
        <Circle
          cx="45"
          cy="360"
          r="1.5"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1"
        />
      </G>
    </Svg>
  );
}
