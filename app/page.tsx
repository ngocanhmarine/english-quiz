import type { Metadata } from "next";
import QuizComponent from "./components/quiz/QuizComponent";

export default function IndexPage() {
  return <div>
    <QuizComponent />
  </div>;
}

export const metadata: Metadata = {
  title: "Redux Toolkit",
};
