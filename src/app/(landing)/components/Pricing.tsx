import React, { useState } from 'react';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "フリー",
      description: "小規模店舗・お試し利用に",
      price: {
        monthly: 0,
        yearly: 0
      },
      originalPrice: null,
      features: [
        "スタッフ5名まで",
        "基本シフト管理",
        "月間シフト作成10回まで",
        "メールサポート",
        "データ保存30日"
      ],
      limitations: [
        "外部連携なし",
        "レポート機能制限",
        "データエクスポート不可"
      ],
      cta: "無料で始める",
      popular: false,
      color: "gray"
    },
    {
      name: "ベーシック",
      description: "中小規模店舗におすすめ",
      price: {
        monthly: 2980,
        yearly: 2380
      },
      originalPrice: {
        monthly: null,
        yearly: 2980
      },
      features: [
        "スタッフ20名まで",
        "全シフト管理機能",
        "Googleカレンダー連携",
        "LINE通知機能",
        "基本レポート",
        "データ保存1年",
        "優先メールサポート"
      ],
      limitations: [],
      cta: "14日間無料体験",
      popular: true,
      color: "blue"
    },
    {
      name: "プロ",
      description: "多店舗・大規模運営に",
      price: {
        monthly: 7980,
        yearly: 6380
      },
      originalPrice: {
        monthly: null,
        yearly: 7980
      },
      features: [
        "スタッフ無制限",
        "全機能利用可能",
        "全外部連携",
        "詳細分析レポート",
        "API連携",
        "データ無制限保存",
        "24時間電話サポート",
        "専用担当者",
        "カスタマイズ対応"
      ],
      limitations: [],
      cta: "お問い合わせ",
      popular: false,
      color: "indigo"
    }
  ];

  const faq = [
    {
      question: "無料プランと有料プランの主な違いは？",
      answer: "無料プランは5名までの小規模利用に限定されており、外部連携やレポート機能に制限があります。有料プランでは人数制限の拡大と全機能をご利用いただけます。"
    },
    {
      question: "支払い方法は何が利用できますか？",
      answer: "クレジットカード（Visa、MasterCard、JCB、American Express）、銀行振込に対応しています。年間プランをお選びいただくと20%の割引が適用されます。"
    },
    {
      question: "途中でプランを変更できますか？",
      answer: "はい、いつでもプランの変更が可能です。アップグレードは即座に反映され、ダウングレードは次回請求日から適用されます。"
    },
    {
      question: "データの移行は大変ですか？",
      answer: "Excelからのデータインポート機能があり、CSVファイルから簡単にシフトデータを移行できます。また、初期設定のサポートも承っております。"
    }
  ];

  return (
    <section id="pricing" className="section-padding bg-white">
      <div className="container-responsive">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">シンプル</span>で分かりやすい料金
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            店舗規模に合わせて選べるプラン。まずは無料でお試しください。
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              月額払い
            </span>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              onClick={() => setIsYearly(!isYearly)}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              年額払い
            </span>
            {isYearly && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                20%お得！
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const colorClasses: Record<string, string> = {
              gray: 'border-gray-200 hover:border-gray-300',
              blue: 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20',
              indigo: 'border-indigo-500 hover:border-indigo-600'
            };

            const buttonClasses: Record<string, string> = {
              gray: 'btn-secondary',
              blue: 'btn-primary',
              indigo: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl'
            };

            const currentPrice = plan.price[isYearly ? 'yearly' : 'monthly'];

            return (
              <div
                key={index}
                className={`card relative ${colorClasses[plan.color]} ${
                  plan.popular ? 'transform scale-105' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                      おすすめ
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    {/* Price */}
                    <div className="mb-4">
                      {currentPrice === 0 ? (
                        <div className="text-4xl font-bold gradient-text">無料</div>
                      ) : (
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold gradient-text">
                            ¥{currentPrice.toLocaleString()}
                          </span>
                          <span className="text-gray-600 ml-2">
                            /{isYearly ? '年' : '月'}
                          </span>
                        </div>
                      )}
                      
                      {isYearly && plan.originalPrice?.yearly && (
                        <div className="text-sm text-gray-500 line-through">
                          通常 ¥{plan.originalPrice.yearly.toLocaleString()}/年
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitIndex) => (
                      <li key={limitIndex} className="flex items-center space-x-3 opacity-50">
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <span className="text-gray-500 text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button className={`w-full ${buttonClasses[plan.color]}`}>
                    {plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise */}
        <div className="card p-8 bg-gradient-to-r from-gray-50 to-gray-100 text-center">
          <h3 className="text-2xl font-bold mb-4">エンタープライズ</h3>
          <p className="text-gray-600 mb-6">
            大規模展開や特別な要件がある場合は、個別にご相談ください
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">多店舗管理</span>
            <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">専用サーバー</span>
            <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">カスタム開発</span>
            <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">SLA保証</span>
          </div>
          <button className="btn-secondary">
            お問い合わせ
          </button>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-12 gradient-text">
            よくあるご質問
          </h3>
          <div className="max-w-3xl mx-auto space-y-6">
            {faq.map((item, index) => (
              <div key={index} className="card p-6">
                <h4 className="font-bold text-gray-800 mb-3">{item.question}</h4>
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-16 text-center">
          <div className="card p-8 bg-gradient-to-r from-green-50 to-emerald-50 max-w-2xl mx-auto">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-4 text-green-800">
              14日間返金保証
            </h3>
            <p className="text-gray-700">
              万が一ご満足いただけない場合は、14日以内であれば全額返金いたします。
              安心してお試しください。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;