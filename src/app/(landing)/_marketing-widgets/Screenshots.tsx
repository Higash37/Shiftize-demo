import React, { useState } from "react";

const Screenshots = () => {
  const [activeView, setActiveView] = useState("gantt");

  const screenshots: Record<
    string,
    { title: string; description: string; image: string; features: string[] }
  > = {
    gantt: {
      title: "ガントチャート編集",
      description: "ドラッグ&ドロップで直感的にシフトを作成・編集",
      image: "/api/placeholder/800/500",
      features: [
        "ドラッグ&ドロップ操作",
        "リアルタイム更新",
        "色分け表示",
        "一括操作",
      ],
    },
    mobile: {
      title: "モバイル対応",
      description: "スマホからでも快適にシフト管理",
      image: "/api/placeholder/800/500",
      features: [
        "レスポンシブデザイン",
        "タッチ操作最適化",
        "プッシュ通知",
        "オフライン対応",
      ],
    },
    dashboard: {
      title: "分析ダッシュボード",
      description: "人件費やシフト充足率を可視化",
      image: "/api/placeholder/800/500",
      features: [
        "リアルタイム分析",
        "コスト可視化",
        "トレンド表示",
        "レポート出力",
      ],
    },
    staff: {
      title: "スタッフ画面",
      description: "スタッフが使いやすいシンプルなインターフェース",
      image: "/api/placeholder/800/500",
      features: ["シンプルUI", "カレンダー表示", "通知機能", "申請履歴"],
    },
  };

  const viewOptions = [
    { key: "gantt", label: "ガントチャート", icon: "📊" },
    { key: "mobile", label: "モバイル", icon: "📱" },
    { key: "dashboard", label: "ダッシュボード", icon: "📈" },
    { key: "staff", label: "スタッフ画面", icon: "👩‍🎓" },
  ];

  return (
    <section id="screenshots" className="section-padding bg-white">
      <div className="container-responsive">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">実際の画面</span>をご覧ください
          </h2>
          <p className="text-xl text-black/80 max-w-3xl mx-auto">
            直感的なデザインで、誰でも簡単に使えます
          </p>
        </div>

        {/* View Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {viewOptions.map((option) => (
            <button
              type="button"
              key={option.key}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeView === option.key
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105"
                  : "bg-white border-2 border-black/10 text-black/80 hover:border-blue-300 hover:text-blue-600"
              }`}
              onClick={() => setActiveView(option.key)}
            >
              <span className="text-lg">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        {/* Screenshot Display */}
        <div className="max-w-6xl mx-auto">
          <div className="card p-0 overflow-hidden">
            <div className="relative">
              {/* Screenshot Image with lazy loading */}
              <img
                src={screenshots[activeView]?.image || "/api/placeholder/800/500"}
                alt={screenshots[activeView]?.title || "スクリーンショット"}
                loading="lazy"
                decoding="async"
                className="w-full h-auto aspect-video object-cover"
                style={{
                  backgroundColor: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onError={(e) => {
                  // エラー時はプレースホルダーを表示
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const placeholder = target.parentElement?.querySelector(".screenshot-placeholder");
                  if (placeholder) {
                    (placeholder as HTMLElement).style.display = "flex";
                  }
                }}
              />
              {/* Fallback placeholder */}
              <div className="screenshot-placeholder bg-gradient-to-br from-white to-white aspect-video flex items-center justify-center" style={{ display: "none" }}>
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {viewOptions.find((v) => v.key === activeView)?.icon}
                  </div>
                  <div className="text-black/70 text-lg">
                    {screenshots[activeView]?.title || "スクリーンショット"}
                    のスクリーンショット
                  </div>
                  <div className="text-sm text-black/60 mt-2">
                    Playwrightで自動撮影予定
                  </div>
                </div>
              </div>

              {/* Browser Chrome */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-white rounded-t-2xl flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-white text-xs">
                    shift-scheduler-app.com
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4 gradient-text">
                    {screenshots[activeView]?.title || "タイトル"}
                  </h3>
                  <p className="text-black/80 text-lg mb-6">
                    {screenshots[activeView]?.description || "説明"}
                  </p>

                  {/* Feature List */}
                  <div className="grid grid-cols-2 gap-3">
                    {(screenshots[activeView]?.features || []).map(
                      (feature) => (
                        <div
                          key={feature}
                          className="flex items-center space-x-2"
                        >
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span className="text-black text-sm">{feature}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-6">
                  <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="text-2xl font-bold gradient-text mb-2">
                      71,464行
                    </div>
                    <div className="text-black/80 text-sm">
                      のコードで構築された堅牢なシステム
                    </div>
                  </div>
                  <div className="card p-6 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      5+店舗
                    </div>
                    <div className="text-black/80 text-sm">で実際に運用中</div>
                  </div>
                  <div className="card p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      100%
                    </div>
                    <div className="text-black/80 text-sm">
                      モバイル対応済み
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-bold mb-8 text-black">
            最新技術で構築された信頼性の高いシステム
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">⚛️</span>
              </div>
              <span className="text-black/80 font-medium">React Native</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">TS</span>
              </div>
              <span className="text-black/80 font-medium">TypeScript</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">🔥</span>
              </div>
              <span className="text-black/80 font-medium">Firebase</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">📱</span>
              </div>
              <span className="text-black/80 font-medium">PWA</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <button type="button" className="btn-primary text-lg">
            <svg
              className="w-5 h-5 mr-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            実際の画面を体験する
          </button>
        </div>
      </div>
    </section>
  );
};

export default Screenshots;
