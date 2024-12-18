import { createAppSlice } from "@/lib/createAppSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import { QuizScore } from "./QuizScore";
import { QuizItem } from "./QuizItem";
import { QuizStatus } from "./QuizStatus";
import { PAGES_DIR_ALIAS } from "next/dist/lib/constants";

export interface QuizState {
    quiz_id: number | null,
    socket_id: string,
    user_name: string,
    state: QuizStatus, // 0: not started, 1:
    scores: QuizScore[],
    items: QuizItem[],
}

const initialState: QuizState = {
    quiz_id: null,
    socket_id: '',
    user_name: '',
    state: QuizStatus.NotStarted,
    scores: [],
    items: []
};

export const quizSlice = createAppSlice({
    name: "quiz",
    initialState,
    reducers: {
        updateUserName: (state, action: PayloadAction<string>) => {
            state.user_name = action.payload;
        },
        receiveQuizItems: (state, action: PayloadAction<QuizItem[]>) => {
            state.items = action.payload;
        },
        receiveScores: (state, action: PayloadAction<QuizScore[]>) => {
            state.scores = action.payload;
        }
    }
});

export const { receiveQuizItems, receiveScores,updateUserName } = quizSlice.actions;
export default quizSlice.reducer;