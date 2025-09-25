import React, { useState } from "react";

const Features = () => {
  const [activeTab, setActiveTab] = useState("manager");

  const managerFeatures = [
    {
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: "直感的なガントチャート",
      description:
        "ドラッグ&ドロップでシフト作成。一目で人員配置を確認でき、Excelより圧倒的に早く作業完了。",
      highlight: "月10時間削減",
    },
    {
      icon: (
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
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "自動計算・分析",
      description:
        "人件費自動計算、シフト充足率の可視化、月次レポート自動生成で経営判断をサポート。",
      highlight: "コスト15%削減",
    },
    {
      icon: (
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
            d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3"
          />
        </svg>
      ),
      title: "募集シフト機能",
      description:
        "急な欠勤時の穴埋め募集。スタッフへの一斉通知、応募状況の管理で緊急対応も安心。",
      highlight: "対応時間90%短縮",
    },
    {
      icon: (
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
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
      title: "外部連携",
      description:
        "Googleカレンダー自動同期、LINE通知、給与計算ソフト連携で業務を一元化。",
      highlight: "連携拡大中",
    },
  ];

  const staffFeatures = [
    {
      icon: (
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      title: "簡単シフト申請",
      description:
        "スマホから希望提出、複数日程を一括申請、過去の申請履歴確認も可能。",
      highlight: "申請時間70%短縮",
    },
    {
      icon: (
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
            d="M15 17h5l-5 5v-5zM4.828 4.828A4 4 0 015.656 4H20a2 2 0 012 2v12a2 2 0 01-2 2h-5L9 14H4a2 2 0 01-2-2V6a2 2 0 012-2h1.172z"
          />
        </svg>
      ),
      title: "リアルタイム確認",
      description:
        "確定シフトの即時確認、カレンダー表示対応、他スタッフのシフトも確認可能。",
      highlight: "即座に同期",
    },
    {
      icon: (
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
            d="M15 17h5l-5 5v-5zM4.828 4.828A4 4 0 015.656 4H20a2 2 0 012 2v12a2 2 0 01-2 2h-5L9 14H4a2 2 0 01-2-2V6a2 2 0 012-2h1.172z"
          />
        </svg>
      ),
      title: "変更通知",
      description:
        "シフト変更の即時通知、募集シフトへの応募、リマインダー機能で見落とし防止。",
      highlight: "通知100%到達",
    },
    {
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      title: "ファイル管理",
      description:
        "マニュアルや書類にいつでもアクセス、必要な情報をスマホで確認。",
      highlight: "24時間アクセス",
    },
  ];

  const statusFlow = [
    {
      status: "申請中",
      color: "yellow",
      description: "スタッフがシフト希望を提出",
    },
    {
      status: "承認済み",
      color: "blue",
      description: "管理者が承認した確定シフト",
    },
    { status: "却下", color: "red", description: "希望が通らなかった場合" },
    { status: "削除申請中", color: "orange", description: "確定後の削除申請" },
    { status: "完了", color: "green", description: "勤務が終了したシフト" },
  ];

  return (
    <section
      id="features"
      className="section-padding bg-gradient-to-b from-white to-white"
    >
      <div className="container-responsive">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">充実の機能</span>で完全サポート
          </h2>
          <p className="text-xl text-black/80 max-w-3xl mx-auto">
            管理者もスタッフも使いやすい、双方向のシフト管理システム
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            <button
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "manager"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-black/80 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab("manager")}
            >
              👨‍💼 管理者向け機能
            </button>
            <button
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "staff"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-black/80 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab("staff")}
            >
              👩‍🎓 スタッフ向け機能
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {(activeTab === "manager" ? managerFeatures : staffFeatures).map(
            (feature) => (
              <div
                key={feature.title}
                className="card p-8 group hover:scale-105"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-black">
                        {feature.title}
                      </h3>
                      <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
                        {feature.highlight}
                      </span>
                    </div>
                    <p className="text-black/80 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Status Flow */}
        <div className="card p-8 mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 gradient-text">
            シフトステータス管理
          </h3>
          <p className="text-center text-black/80 mb-8">
            承認フローが明確で、トラブルを防ぐ仕組み
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4">
            {statusFlow.map((item, index) => {
              const colorClasses: Record<string, string> = {
                yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
                blue: "bg-blue-100 text-blue-700 border-blue-200",
                red: "bg-red-100 text-red-700 border-red-200",
                orange: "bg-orange-100 text-orange-700 border-orange-200",
                green: "bg-green-100 text-green-700 border-green-200",
              };

              return (
                <React.Fragment key={`${item.status}-${index}`}>
                  <div className="text-center group">
                    <div
                      className={`px-4 py-2 rounded-xl border-2 font-semibold text-sm mb-2 group-hover:scale-105 transition-transform ${
                        colorClasses[item.color]
                      }`}
                    >
                      {item.status}
                    </div>
                    <p className="text-xs text-black/70 max-w-20">
                      {item.description}
                    </p>
                  </div>
                  {index < statusFlow.length - 1 && (
                    <div className="text-black/60 text-xl hidden sm:block">
                      →
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="card p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-2xl font-bold mb-4 gradient-text">
              全機能を無料で体験
            </h3>
            <p className="text-black/80 mb-6">
              実際の画面で使い心地を確認してみてください
            </p>
            <button className="btn-primary">
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
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16h1m4 0h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              デモ環境を開く
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
