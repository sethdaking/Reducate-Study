'use client'
import { Code, Notebook, PersonStanding, PlusIcon, Target } from 'lucide-react'
import React, { useState } from 'react'

function SelectOption({selectedStudyType}) {
    const Options = [
        {
            name: 'Exam',
            icon: <Notebook />,
        },
        {
            name: 'Interview',
            icon: <PersonStanding />,
        },
        {
            name: 'Practice',
            icon: <Target />,
        },
        {
            name: 'Coding',
            icon: <Code />
        },
        {
            name: 'Other',
            icon: <PlusIcon />
        },
    ]
    const [selectedOption, setSelectedOption] = useState();
  return (
    <div>
        <h2 className='text-center mb-2 text-lg'>Create your personal study material</h2>
        <div className='mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5'>
            {Options.map((option, index) => (
                <div key={index} className={`p-4 flex flex-col items-center justify-center
                    border rounded-xl hover:border-primary cursor-pointer
                    ${option?.name === selectedOption && 'border-primary'}`}
                onClick={() =>{setSelectedOption(option.name); selectedStudyType(option.name)}}>
                   {option.icon}
                   <h2 className='text-sm mt-2'>{option.name}</h2>
                </div>
            ))}
        </div>
    </div>
  )
}

export default SelectOption