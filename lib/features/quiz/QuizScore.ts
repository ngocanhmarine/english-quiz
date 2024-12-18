export type QuizScore = {
    quiz_session_id: number;
    user_name: string;
    score: number;
}

export type QuizScores = {
    quiz_id: number,
    scores: QuizScore[]
}