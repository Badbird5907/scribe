import * as React from "react"
const HackclubLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <mask
        id="b"
        width={256}
        height={256}
        x={0}
        y={0}
        mask-type="alpha"
        maskUnits="userSpaceOnUse"
      >
        <path
          fill="#000"
          fillRule="evenodd"
          d="M128 256c102.4 0 128-25.6 128-128S230.4 0 128 0 0 25.6 0 128s25.6 128 128 128Z"
          clipRule="evenodd"
        />
      </mask>
      <g mask="url(#b)">
        <g filter="url(#c)">
          <path
            fill="url(#d)"
            fillRule="evenodd"
            d="M128 256c102.4 0 128-25.6 128-128S230.4 0 128 0 0 25.6 0 128s25.6 128 128 128Z"
            clipRule="evenodd"
          />
        </g>
        <g filter="url(#e)">
          <path
            fill="#fff"
            d="M115.103 48.368a2 2 0 0 0-2.334-1.971l-31.104 5.28A2 2 0 0 0 80 53.65v151.436a2 2 0 0 0 2 2h31.103a2 2 0 0 0 2-2v-56.688c0-17.27 9.158-27.968 16.789-27.968 6.868 0 8.852 6.878 8.852 17.27v67.386a2 2 0 0 0 2 2H174a2 2 0 0 0 2-2v-72.429c0-23.536-8.852-38.667-31.898-38.667-9.25 0-18.277 2.227-25.469 7.157-1.428.979-3.53.015-3.53-1.718v-51.06Z"
          />
        </g>
      </g>
    </g>
    <defs>
      <filter
        id="c"
        width={268}
        height={268}
        x={-6}
        y={-6}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dx={6} dy={6} />
        <feGaussianBlur stdDeviation={4} />
        <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
        <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0" />
        <feBlend in2="shape" result="effect1_innerShadow" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dx={-6} dy={-6} />
        <feGaussianBlur stdDeviation={4} />
        <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
        <feBlend in2="effect1_innerShadow" result="effect2_innerShadow" />
      </filter>
      <filter
        id="e"
        width={128}
        height={192.717}
        x={64}
        y={42.368}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={12} />
        <feGaussianBlur stdDeviation={8} />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={4} />
        <feGaussianBlur stdDeviation={4} />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.125 0" />
        <feBlend in2="effect1_dropShadow" result="effect2_dropShadow" />
        <feBlend in="SourceGraphic" in2="effect2_dropShadow" result="shape" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={-2} />
        <feGaussianBlur stdDeviation={3} />
        <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.125 0" />
        <feBlend in2="shape" result="effect3_innerShadow" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={-2} />
        <feGaussianBlur stdDeviation={3} />
        <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
        <feColorMatrix values="0 0 0 0 0.92549 0 0 0 0 0.215686 0 0 0 0 0.313726 0 0 0 0.5 0" />
        <feBlend in2="effect3_innerShadow" result="effect4_innerShadow" />
      </filter>
      <radialGradient
        id="d"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="rotate(58.637) scale(245.935)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FF8C37" />
        <stop offset={1} stopColor="#EC3750" />
      </radialGradient>
      <clipPath id="a">
        <path fill="#fff" d="M256 0v256H0V0z" />
      </clipPath>
    </defs>
  </svg>
)
export default HackclubLogo;
