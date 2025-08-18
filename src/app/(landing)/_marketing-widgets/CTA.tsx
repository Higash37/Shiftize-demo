import React from "react";
import { Link } from "expo-router";

const CTA = () => {
  return (
    <section className="section-padding bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-bounce"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full animate-bounce [animation-delay:0.5s]"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 bg-white rounded-full animate-bounce [animation-delay:1s]"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-white rounded-full animate-bounce [animation-delay:1.5s]"></div>
      </div>

      <div className="container-responsive relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            今すぐシフト管理を{" "}
            <span className="block text-yellow-300">劇的に改善</span>
          </h2>

          <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
            月間10時間の削減効果を{" "}
            <span className="font-bold text-yellow-300">無料</span>{" "}
            で体験してみませんか？
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300">
                5+
              </div>
              <div className="text-blue-100 text-sm">導入店舗</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300">
                80%
              </div>
              <div className="text-blue-100 text-sm">時間削減</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300">
                100%
              </div>
              <div className="text-blue-100 text-sm">ミス防止</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300">
                0
              </div>
              <div className="text-blue-100 text-sm">初期費用</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link
              href="/demo"
              className="bg-white text-blue-600 hover:text-blue-700 font-bold py-4 px-10 rounded-2xl text-lg transition-all duration-200 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center space-x-3 w-full sm:w-auto"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16h1m4 0h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>無料デモを今すぐ試す</span>
            </Link>

            <Link
              href="#pricing"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-10 rounded-2xl text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-3 w-full sm:w-auto"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span>料金プランを見る</span>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-2xl mb-2">🔒</div>
              <div className="text-blue-100 text-sm">AES-256暗号化</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="text-blue-100 text-sm">GDPR準拠</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📱</div>
              <div className="text-blue-100 text-sm">完全モバイル対応</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-blue-100 text-sm">リアルタイム同期</div>
            </div>
          </div>

          {/* Urgency */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-3 text-yellow-300">
              🎉 期間限定キャンペーン
            </h3>
            <p className="text-blue-100">
              今なら初月無料 + セットアップサポート付き
              <br />
              <span className="text-sm opacity-75">
                ※ ベーシックプラン以上が対象
              </span>
            </p>
          </div>

          {/* Social Proof */}
          <div className="text-center">
            <p className="text-blue-200 text-sm mb-4">
              すでに多くの店舗でご利用いただいています
            </p>
            <div className="flex justify-center items-center space-x-2 mb-6">
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={`star-${i + 1}`}
                  className="w-5 h-5 text-yellow-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-yellow-300 font-semibold ml-2">5.0</span>
              <span className="text-blue-200 text-sm">/ 5.0 (利用者評価)</span>
            </div>
          </div>

          {/* Final Push */}
          <div className="text-center">
            <p className="text-lg text-blue-100 mb-2">
              クレジットカード不要・いつでも解約可能
            </p>
            <p className="text-sm text-blue-200 opacity-75">
              個人開発者による直接サポートで安心
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
