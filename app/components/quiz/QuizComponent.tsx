"use client";

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socket from '@/lib/features/quiz/QuizSocket';
import { RootState, AppDispatch } from '@/lib/store';
import { QuizItems } from '@/lib/features/quiz/QuizItem';
import { receiveQuizItems, receiveScores, updateUserName } from '@/lib/features/quiz/QuizSlice';
import { QuizScore, QuizScores } from '@/lib/features/quiz/QuizScore';
import { QuizStatus } from '@/lib/features/quiz/QuizStatus';

const QuizComponent: React.FC<any> = ({ quizId }) => {
    const dispatch = useDispatch<AppDispatch>();

    const userName = useSelector((state: RootState) => state.quiz.user_name)
    const status = useSelector((state: RootState) => state.quiz.state)
    const items = useSelector((state: RootState) => state.quiz.items);
    const scores = useSelector((state: RootState) => state.quiz.scores);

    const [answers, setAnswers] = useState<{ [key: number]: number }>({});

    const handleChange = (questionIndex: number, value: number) => {
        setAnswers({
            ...answers,
            [questionIndex]: value,
        })
    }

    const userNameSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const userName = event.currentTarget.userName.value;
        if (userName) {
            dispatch(updateUserName(userName));
        }
    };

    useEffect(() => {
        socket.on('quiz-items', (quiz_items: QuizItems) => {
            if (quizId == quiz_items.quiz_id) {
                dispatch(receiveQuizItems(quiz_items.items));
            }
        })

        socket.on('quiz-scores', (scores: QuizScores) => {
            if (quizId == scores.quiz_id) {
                dispatch(receiveScores(scores.scores));
            }
        })

        socket.emit('get-quiz-scores', quizId);

    }, [dispatch]);

    const startBtnClick = () => {
        socket.emit('start-quiz', quizId)
    }

    const submitAnswers = (e: React.FormEvent) => {
        e.preventDefault();
        socket.emit('submit-answers', { userName, quizId, answers })
    }

    return (
        <div>
            {userName && <span>Hi {userName}</span>}
            <h1>Quiz {quizId}</h1>

            {!userName && <form onSubmit={userNameSubmit}>
                <label> Enter Your Name:
                    <input type="text" name="userName" required />
                </label>
                <button type="submit">Submit Name</button>
            </form>}

            {status == QuizStatus.NotStarted && <button onClick={startBtnClick}>Start the quiz</button>}

            {scores && scores.length > 0 && <div><h2>Scoreboard</h2>
                <table>
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scores.map((score, index) => (
                            <tr key={index}>
                                <td>{score.user_name}</td>
                                <td>{score.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table></div>}

            {items && items.length > 0 &&
                <form onSubmit={submitAnswers}>
                    {items.map((item, index) => (
                        <div key={index}>
                            <h3>{item.question}</h3>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name={`question-${index}`}
                                        value={1}
                                        checked={answers[index] === 1}
                                        onChange={() => handleChange(index, 1)}
                                    />
                                    {item.answer_a}
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name={`question-${index}`}
                                        value={2}
                                        checked={answers[index] === 2}
                                        onChange={() => handleChange(index, 2)}
                                    />
                                    {item.answer_b}
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name={`question-${index}`}
                                        value={3}
                                        checked={answers[index] === 3}
                                        onChange={() => handleChange(index, 3)}
                                    />
                                    {item.answer_c}
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name={`question-${index}`}
                                        value={4}
                                        checked={answers[index] === 4}
                                        onChange={() => handleChange(index, 4)}
                                    />
                                    {item.answer_d}
                                </label>
                            </div>
                        </div>
                    ))}
                    <button type="submit">Submit</button>
                </form>}
        </div>
    )
}

export default QuizComponent;