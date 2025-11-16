import React from "react";

const Benefits = () => {
  const benefits = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "月間10時間削減",
      description: "シフト作成時間を週3時間から30分に短縮",
      stat: "80%削減",
      color: "blue",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "ミス・トラブル0件",
      description: "ダブルブッキングや連絡漏れを完全防止",
      stat: "100%防止",
      color: "green",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      title: "コスト可視化",
      description: "人件費をリアルタイムで把握・最適化",
      stat: "15%削減",
      color: "indigo",
    },
  ];

  const problems = [
    {
      icon: "😵",
      title: "Excelでのシフト管理が大変",
      description: "複雑な表計算、手作業でのコピペ、バージョン管理...",
    },
    {
      icon: "📞",
      title: "急な欠勤対応に時間がかかる",
      description: "代替スタッフ探し、個別連絡、調整作業...",
    },
    {
      icon: "💸",
      title: "人件費の計算が面倒",
      description: "時給計算、勤務時間集計、給与明細作成...",
    },
    {
      icon: "📱",
      title: "スタッフとの連絡が煩雑",
      description: "LINE、メール、電話...バラバラな連絡手段",
    },
  ];

  return (
    <section id="benefits" className="section-padding bg-white">
      <div className="container-responsive">
        {/* Problems Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            こんな<span className="text-red-500">課題</span>ありませんか？
          </h2>
          <p className="text-xl text-black/80 max-w-3xl mx-auto">
            多くの店舗が抱えるシフト管理の悩み
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="card p-6 text-center border-red-100"
            >
              <div className="text-4xl mb-4">{problem.icon}</div>
              <h3 className="font-bold text-black mb-3">{problem.title}</h3>
              <p className="text-black/80 text-sm leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        {/* Arrow */}
        <div className="flex justify-center mb-20">
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-4">⬇️</div>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full font-bold text-lg">
              Shiftizeで解決！
            </div>
          </div>
        </div>

        {/* Solutions Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">劇的な改善</span>を実現
          </h2>
          <p className="text-xl text-black/80 max-w-3xl mx-auto">
            実際の導入店舗で証明された効果
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit) => {
            const colorClasses: Record<string, string> = {
              blue: "from-blue-500 to-blue-600 bg-blue-50 text-blue-600",
              green: "from-green-500 to-green-600 bg-green-50 text-green-600",
              indigo:
                "from-indigo-500 to-indigo-600 bg-indigo-50 text-indigo-600",
            };

            return (
              <div
                key={benefit.title}
                className="card p-8 text-center group hover:scale-105"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${
                    colorClasses[benefit.color]?.split(" ")[0] || "bg-blue-500"
                  } ${
                    colorClasses[benefit.color]?.split(" ")[1] || "bg-blue-600"
                  } rounded-2xl flex items-center justify-center text-white mx-auto mb-6 group-hover:scale-110 transition-transform`}
                >
                  {benefit.icon}
                </div>
                <div
                  className={`inline-block px-4 py-2 ${
                    colorClasses[benefit.color]?.split(" ")[2] ||
                    "bg-blue-50 text-blue-600"
                  } rounded-full text-sm font-bold mb-4`}
                >
                  {benefit.stat}
                </div>
                <h3 className="text-xl font-bold mb-4 text-black">
                  {benefit.title}
                </h3>
                <p className="text-black/80 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Testimonial Quote */}
        <div className="mt-16 text-center">
          <div className="card p-8 max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="text-4xl text-blue-600 mb-4" aria-hidden="true">&ldquo;</div>
            <blockquote className="text-xl text-black italic mb-6">
              導入前は毎週3時間かけてExcelでシフトを作っていましたが、今では30分で完了。
              急な講師の欠勤にも、募集機能で素早く対応できるようになりました。
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <div className="font-bold text-black">個別指導塾A 塾長</div>
                <div className="text-black/80 text-sm">導入から1ヶ月</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
