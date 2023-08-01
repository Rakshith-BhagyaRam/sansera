const HexaStageSingle = (name,color1,color2) => `<svg xmlns="http://www.w3.org/2000/svg" height="100%" width="100%" viewBox="0 0 120 120">
  <defs>
  <linearGradient id="cl2" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="${color1}"/>
    <stop offset="100%" stop-color="${color2}"/>
</linearGradient>
</defs>
  <polygon fill="white"   
  points="60 13, 110 38, 110 85,60 110, 13 85, 13 35" 
  stroke-width="6" stroke="url(#cl2)"/>
      <text x="62" y="65" text-anchor="middle" fill="#10297e" font-size="14">${name}</text>
</svg>`



const HexaStageDouble = (color, name1, name2) => `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="350" >
  <polygon fill="white" stroke=${color}  points="60 13, 110 38, 110 85,60 110, 13 85, 13 35" 
  stroke-width="6"/>
      <text x="52" y="55" text-anchor="middle" fill="#10297e" font-size="16">
        <tspan x="62" y="42" dy="15">${name1}</tspan>
        <tspan x="60" y="50" dy="25">${name2}</tspan></text>
</svg>
`



export {HexaStageSingle, HexaStageDouble }