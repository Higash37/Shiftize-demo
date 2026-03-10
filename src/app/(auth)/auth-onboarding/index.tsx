/**
 * @file auth-onboarding/index.tsx
 * @description オンボーディング画面のルートファイル。
 *
 * 実際のコンポーネントは modules/onboarding-module/OnboardingScreen.tsx に実装。
 * re-export パターンでルーティングとロジックを分離している。
 */

export { OnboardingScreen as default } from "@/modules/onboarding-module/OnboardingScreen";
