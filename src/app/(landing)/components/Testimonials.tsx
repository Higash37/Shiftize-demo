import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "個別指導塾A 塾長",
      role: "教育業界",
      avatar: "A",
      content: "導入前は毎週3時間かけてExcelでシフトを作っていましたが、今では30分で完了。急な講師の欠勤にも、募集機能で素早く対応できるようになりました。",
      stats: "月10時間削減",
      period: "導入1ヶ月"
    },
    {
      name: "カフェB オーナー",
      role: "飲食業界",
      avatar: "B",
      content: "スタッフからの「シフトがわからない」という問い合わせが0になりました。みんなスマホで確認できるので、連絡の手間が劇的に減りました。",
      stats: "問い合わせ100%削減",
      period: "導入予定"
    },
    {
      name: "講師C",
      role: "塾講師",
      avatar: "C",
      content: "以前は紙でシフト希望を出していて、結果もよくわからない状態でした。今はスマホで申請して、承認状況もすぐ確認できて安心です。",
      stats: "満足度大幅向上",
      period: "利用1ヶ月"
    }
  ];

  const metrics = [
    {
      number: "10時間",
      label: "月間削減時間",
      description: "シフト作成・管理時間",
      icon: "⏰"
    },
    {
      number: "100%",
      label: "ミス防止率",
      description: "ダブルブッキング・連絡漏れ",
      icon: "✅"
    },
    {
      number: "80%",
      label: "作業効率化",
      description: "従来比での時間短縮",
      icon: "🚀"
    },
    {
      number: "5+",
      label: "導入店舗数",
      description: "継続利用中",
      icon: "🏢"
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-blue-50 to-white">
      <div className="container-responsive">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            お客様の<span className="gradient-text">成功事例</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            実際にご利用いただいているお客様の声
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card p-8 hover:scale-105 transition-transform">
              {/* Quote Icon */}
              <div className="text-4xl text-blue-600 mb-4">"</div>
              
              {/* Content */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed italic">
                {testimonial.content}
              </blockquote>

              {/* Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold gradient-text">{testimonial.stats}</div>
                  <div className="text-gray-600 text-sm">{testimonial.period}</div>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics Section */}
        <div className="card p-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            数字で見る導入効果
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {metric.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {metric.number}
                </div>
                <div className="text-lg font-semibold mb-1 text-blue-100">
                  {metric.label}
                </div>
                <div className="text-sm text-blue-200">
                  {metric.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Before/After Comparison */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          {/* Before */}
          <div className="card p-8 border-red-200">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">😓</div>
              <h4 className="text-xl font-bold text-red-600">導入前の課題</h4>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-gray-700">週3時間のシフト作成作業</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-gray-700">Excelの複雑な管理</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-gray-700">急な欠勤への対応に苦労</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-gray-700">スタッフからの問い合わせ多数</span>
              </li>
            </ul>
          </div>

          {/* After */}
          <div className="card p-8 border-green-200">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">😊</div>
              <h4 className="text-xl font-bold text-green-600">導入後の改善</h4>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">30分でシフト作成完了</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">直感的なドラッグ&ドロップ</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">募集機能で即座に穴埋め</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">問い合わせゼロを実現</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;