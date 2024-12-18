export type QuizItem = {
    quiz_id: number;
    question: string;
    answer_a: string;
    answer_b: string;
    answer_c: string;
    answer_d: string;
    item_order: number;
    time_limit_by_second: number;
}

export type QuizItems = {
    quiz_id: number;
    items: QuizItem[],
}