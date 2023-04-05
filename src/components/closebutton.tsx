import React from 'react'

type Props = {
    onClick: () => void
}

export default function CloseButton({onClick}: Props) {
  return (
    <div>
        {/* White circle with emerald shadow */}
        <div className="flex justify-center items-center">
            <div className="w-8 h-8 rounded-full transition-colors bg-emerald-500 hover:bg-emerald-800 justify-center items-center flex"
                onClick={onClick}
            >
                <div className="w-6 h-6 rounded-full transition-all bg-gray-800 flex justify-center items-center text-white hover:text-emerald-500">
                    <svg className="w-4 h-4 mx-auto " fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>

                </div>
            </div>
        </div>
    </div>
  )
}