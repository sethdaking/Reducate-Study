import { BookOpen, Cards, BrainCircuit, MessagesSquare } from 'lucide-react'

export const materials = [
    {
        type: 'notes',
        name: 'Study Notes',
        description: 'Comprehensive notes from your course content',
        icon: <BookOpen className="w-10 h-10 text-primary" />
    },
    {
        type: 'flashcards',
        name: 'Flashcards',
        description: 'Interactive flashcards for quick revision',
        icon: <Cards className="w-10 h-10 text-primary" />
    },
    {
        type: 'quiz',
        name: 'Quiz',
        description: 'Test your knowledge with practice questions',
        icon: <BrainCircuit className="w-10 h-10 text-primary" />
    },
    {
        type: 'qna',
        name: 'Q&A',
        description: 'Ask questions about the course content',
        icon: <MessagesSquare className="w-10 h-10 text-primary" />
    }
]