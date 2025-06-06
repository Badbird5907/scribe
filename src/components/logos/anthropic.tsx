import * as React from "react"
const AnthropicLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} {...props}>
    <path
      fill="#d19b75"
      d="M40 6H8a2 2 0 0 0-2 2v32a2 2 0 0 0 2 2h32a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"
    />
    <path
      fill="#252525"
      d="M22.197 14.234h-4.404L10.037 33.67c0-.096 4.452 0 4.452 0l1.484-4.069h8.234l1.58 4.069h4.261l-7.851-19.436zm-4.835 11.825 2.729-6.894 2.633 6.894h-5.362zM25.963 14.234 33.59 33.67h4.356l-7.803-19.436c.001 0-4.18-.048-4.18 0z"
    />
  </svg>
)
export default AnthropicLogo;
