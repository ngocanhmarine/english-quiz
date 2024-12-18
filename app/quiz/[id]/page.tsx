"use client"

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react'
import socket from '@/lib/features/quiz/QuizSocket'
import QuizComponent from '@/app/components/quiz/QuizComponent';

const QuizPage: React.FC = () => {
    const pathname = usePathname();
    const id = pathname.split('/').pop();
    const [quizData, setQuizData] = useState<any>(null);

    useEffect(() => {
        if (id) {
            socket.emit('get-quiz', id);
            socket.on('quiz-data', (data) => {
                setQuizData(data)
            })
        }
    }, [id]);

    if (!quizData) {
        return <div>Quiz not exists</div>;
    }
    return (
        <QuizComponent quizId={id} />
    )
}

export default QuizPage;