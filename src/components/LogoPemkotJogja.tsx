import React from 'react';

interface LogoPemkotJogjaProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const LogoPemkotJogja: React.FC<LogoPemkotJogjaProps> = ({
  className = 'w-14 h-14',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 320 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      role="img"
      aria-label="Logo Pemerintah Kota Yogyakarta"
    >
      {/* Outer Glow / Drop Shadow Filter */}
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.25" />
        </filter>
        <path
          id="upperCurve"
          d="M 68 82 Q 160 22 252 82"
          fill="none"
        />
        <path
          id="lowerCurve"
          d="M 52 365 Q 160 415 268 365"
          fill="none"
        />
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="50%" stopColor="#FBC02D" />
          <stop offset="100%" stopColor="#F57F17" />
        </linearGradient>
      </defs>

      {/* 1. Main Black Oval Shield */}
      <ellipse
        cx="160"
        cy="220"
        rx="142"
        ry="205"
        fill="#111111"
        stroke="#E65100"
        strokeWidth="3"
        filter="url(#shadow)"
      />

      {/* Decorative Gold Border Outline */}
      <ellipse
        cx="160"
        cy="220"
        rx="138"
        ry="201"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="4"
      />

      {/* Traditional Ornaments Top & Bottom (Lung-lungan Yogya) */}
      <g fill="#FBC02D">
        {/* Top Left Curves */}
        <circle cx="70" cy="90" r="16" fill="#FBC02D" opacity="0.9" />
        <circle cx="85" cy="70" r="12" fill="#F9A825" />
        {/* Top Right Curves */}
        <circle cx="250" cy="90" r="16" fill="#FBC02D" opacity="0.9" />
        <circle cx="235" cy="70" r="12" fill="#F9A825" />
        {/* Bottom Flourishes */}
        <circle cx="56" cy="360" r="14" fill="#FBC02D" />
        <circle cx="264" cy="360" r="14" fill="#FBC02D" />
      </g>

      {/* Top Banner Ribbon: "MANGAYU HAYUNING BAWANA" */}
      <path
        d="M 65 62 Q 160 16 255 62 L 246 86 Q 160 42 74 86 Z"
        fill="url(#goldGrad)"
        stroke="#E65100"
        strokeWidth="1.5"
      />
      <text
        fill="#D50000"
        fontSize="12"
        fontFamily="sans-serif"
        fontWeight="bold"
        letterSpacing="0.8"
      >
        <textPath href="#upperCurve" startOffset="50%" textAnchor="middle">
          MANGAYU HAYUNING BAWANA
        </textPath>
      </text>

      {/* Golden 5-Pointed Star */}
      <polygon
        points="160,78 167,98 188,98 171,111 177,131 160,119 143,131 149,111 132,98 153,98"
        fill="#FFD600"
        stroke="#E65100"
        strokeWidth="1.5"
      />

      {/* Center Shield Container (Red & Green Layers) */}
      {/* Outer Red Shield */}
      <path
        d="M 94 135 C 130 148 160 135 160 135 C 160 135 190 148 226 135 C 235 190 226 265 160 295 C 94 265 85 190 94 135 Z"
        fill="#C62828"
        stroke="#FBC02D"
        strokeWidth="3"
      />

      {/* Inner Yellow Tracing Line */}
      <path
        d="M 100 142 C 130 153 160 142 160 142 C 160 142 190 153 220 142 C 228 188 220 255 160 286 C 100 255 92 188 100 142 Z"
        fill="none"
        stroke="#FFEB3B"
        strokeWidth="2"
      />

      {/* Inner Green Shield */}
      <path
        d="M 106 148 C 130 158 160 148 160 148 C 160 148 190 158 214 148 C 221 187 214 246 160 278 C 106 246 99 187 106 148 Z"
        fill="#1B5E20"
      />

      {/* White Garuda Wings (Left & Right) */}
      {/* Left Wing */}
      <g fill="#FFFFFF" stroke="#212121" strokeWidth="1.2">
        <path d="M 104 228 C 100 200 114 175 130 162 C 124 175 120 190 120 206 C 120 216 122 225 125 233 Z" />
        <path d="M 112 230 C 110 212 118 190 130 178 C 127 190 125 204 126 218 Z" />
        <path d="M 119 232 C 119 220 124 204 132 194 C 130 206 130 218 132 230 Z" />
      </g>
      {/* Right Wing */}
      <g fill="#FFFFFF" stroke="#212121" strokeWidth="1.2">
        <path d="M 216 228 C 220 200 206 175 190 162 C 196 175 200 190 200 206 C 200 216 198 225 195 233 Z" />
        <path d="M 208 230 C 210 212 202 190 190 178 C 193 190 195 204 194 218 Z" />
        <path d="M 201 232 C 201 220 196 204 188 194 C 190 206 190 218 188 230 Z" />
      </g>

      {/* Beringin Tree (Pohon Beringin) */}
      <g>
        {/* Tree Trunk & Roots */}
        <path
          d="M 154 242 L 157 212 L 163 212 L 166 242 L 172 248 L 148 248 Z"
          fill="#FBC02D"
          stroke="#4E342E"
          strokeWidth="1.5"
        />
        {/* Beringin Foliage (Lush Green Clustered Leaves) */}
        <ellipse cx="160" cy="188" rx="28" ry="24" fill="#2E7D32" stroke="#1B5E20" strokeWidth="1" />
        <ellipse cx="145" cy="184" rx="16" ry="16" fill="#388E3C" />
        <ellipse cx="175" cy="184" rx="16" ry="16" fill="#388E3C" />
        <ellipse cx="160" cy="172" rx="18" ry="16" fill="#43A047" />
        {/* Foliage details */}
        <circle cx="152" cy="192" r="5" fill="#1B5E20" opacity="0.6" />
        <circle cx="168" cy="192" r="5" fill="#1B5E20" opacity="0.6" />
        <circle cx="160" cy="180" r="6" fill="#1B5E20" opacity="0.6" />
      </g>

      {/* Cotton (Kapas) on the Left */}
      <g>
        {/* Stalk */}
        <path
          d="M 58 160 C 44 200 42 260 82 320"
          fill="none"
          stroke="#2E7D32"
          strokeWidth="3.5"
        />
        {/* Cotton pods (white and yellow florets) */}
        <g fill="#FFFFFF" stroke="#1B5E20" strokeWidth="1">
          <circle cx="50" cy="170" r="7" />
          <circle cx="42" cy="192" r="7.5" />
          <circle cx="40" cy="218" r="8" />
          <circle cx="44" cy="246" r="8.5" />
          <circle cx="52" cy="274" r="8.5" />
          <circle cx="66" cy="300" r="8" />
        </g>
        {/* Yellow sepals */}
        <g fill="#FDD835">
          <circle cx="50" cy="170" r="3" />
          <circle cx="42" cy="192" r="3.5" />
          <circle cx="40" cy="218" r="3.5" />
          <circle cx="44" cy="246" r="4" />
          <circle cx="52" cy="274" r="4" />
          <circle cx="66" cy="300" r="3.5" />
        </g>
        {/* Green leaves on stalk */}
        <path d="M 44 178 C 36 176 34 186 42 186 Z" fill="#43A047" />
        <path d="M 38 206 C 28 206 28 216 38 214 Z" fill="#43A047" />
        <path d="M 38 234 C 28 236 30 246 40 242 Z" fill="#43A047" />
        <path d="M 46 262 C 38 266 40 274 50 270 Z" fill="#43A047" />
      </g>

      {/* Rice (Padi) on the Right */}
      <g>
        {/* Stalk */}
        <path
          d="M 262 160 C 276 200 278 260 238 320"
          fill="none"
          stroke="#FBC02D"
          strokeWidth="3.5"
        />
        {/* Golden Grains of Rice */}
        <g fill="#FDD835" stroke="#E65100" strokeWidth="1">
          <ellipse cx="270" cy="170" rx="6" ry="10" transform="rotate(25 270 170)" />
          <ellipse cx="278" cy="192" rx="6" ry="10" transform="rotate(30 278 192)" />
          <ellipse cx="280" cy="218" rx="6.5" ry="11" transform="rotate(25 280 218)" />
          <ellipse cx="276" cy="246" rx="6.5" ry="11" transform="rotate(20 276 246)" />
          <ellipse cx="268" cy="274" rx="6.5" ry="11" transform="rotate(15 268 274)" />
          <ellipse cx="254" cy="300" rx="6" ry="10" transform="rotate(10 254 300)" />
          {/* Inner grains row */}
          <ellipse cx="262" cy="182" rx="5" ry="8" transform="rotate(-15 262 182)" />
          <ellipse cx="268" cy="206" rx="5.5" ry="9" transform="rotate(-20 268 206)" />
          <ellipse cx="268" cy="232" rx="5.5" ry="9" transform="rotate(-20 268 232)" />
          <ellipse cx="262" cy="260" rx="5.5" ry="9" transform="rotate(-20 262 260)" />
          <ellipse cx="248" cy="286" rx="5" ry="8" transform="rotate(-15 248 286)" />
        </g>
      </g>

      {/* Tugu Yogyakarta (White Monument in Center Front) */}
      <g filter="url(#shadow)">
        {/* Base Steps (Umpak) */}
        <rect x="142" y="342" width="36" height="6" fill="#EEEEEE" stroke="#424242" strokeWidth="1" rx="1" />
        <rect x="145" y="334" width="30" height="8" fill="#F5F5F5" stroke="#616161" strokeWidth="1" rx="1" />
        <rect x="149" y="326" width="22" height="8" fill="#FFFFFF" stroke="#757575" strokeWidth="1" rx="1" />

        {/* Monument Body (Tiang Tugu Putih) */}
        <polygon
          points="152,326 154,230 166,230 168,326"
          fill="#FFFFFF"
          stroke="#424242"
          strokeWidth="1.2"
        />
        {/* Subtle shadow on right half of the shaft */}
        <polygon
          points="160,326 160,230 166,230 168,326"
          fill="#E0E0E0"
          opacity="0.5"
        />

        {/* Decorative Gold Rings on Shaft */}
        <line x1="153" y1="298" x2="167" y2="298" stroke="#FBC02D" strokeWidth="2.5" />
        <line x1="154" y1="262" x2="166" y2="262" stroke="#FBC02D" strokeWidth="2" />

        {/* Tugu Capital & Crown */}
        <rect x="153" y="226" width="14" height="4" fill="#FBC02D" stroke="#E65100" strokeWidth="0.8" />

        {/* Tugu Pinnacle (Golong Gilig Tip) */}
        <polygon
          points="160,204 156,226 164,226"
          fill="#F5F5F5"
          stroke="#424242"
          strokeWidth="1"
        />
        {/* Golden Sphere & Spire at Top */}
        <circle cx="160" cy="204" r="3.5" fill="#FFD600" stroke="#E65100" strokeWidth="0.8" />
        <line x1="160" y1="196" x2="160" y2="202" stroke="#FFD600" strokeWidth="1.5" />
      </g>

      {/* Bottom Yellow Ribbon: "KOTA YOGYAKARTA" */}
      <g>
        {/* Ribbon Fold Ends */}
        <path
          d="M 40 376 L 68 358 L 68 388 Z"
          fill="#F57F17"
          stroke="#E65100"
          strokeWidth="1"
        />
        <path
          d="M 280 376 L 252 358 L 252 388 Z"
          fill="#F57F17"
          stroke="#E65100"
          strokeWidth="1"
        />

        {/* Main Lower Ribbon Arc */}
        <path
          d="M 48 352 Q 160 405 272 352 L 264 382 Q 160 435 56 382 Z"
          fill="url(#goldGrad)"
          stroke="#E65100"
          strokeWidth="2"
        />

        {/* Curved Text: "KOTA YOGYAKARTA" */}
        <text
          fill="#D50000"
          fontSize="14.5"
          fontFamily="sans-serif"
          fontWeight="900"
          letterSpacing="1.5"
        >
          <textPath href="#lowerCurve" startOffset="50%" textAnchor="middle">
            KOTA YOGYAKARTA
          </textPath>
        </text>
      </g>
    </svg>
  );
};
