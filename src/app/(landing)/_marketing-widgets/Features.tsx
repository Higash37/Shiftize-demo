import React, { Fragment, useMemo, useState } from "react";
import {
  managerFeatures,
  staffFeatures,
  statusFlow,
} from "./Features.data";
import type { FeatureAudience, FeatureCard, StatusFlowColor } from "./Features.types";

const tabConfig: Array<{
  id: FeatureAudience;
  label: string;
  description: string;
}> = [
  {
    id: "manager",
    label: "For Managers",
    description: "Optimise schedules, payroll, and communication across locations.",
  },
  {
    id: "staff",
    label: "For Staff",
    description: "Empower tutors with self-serve scheduling and real-time updates.",
  },
];

const statusColorClasses: Record<StatusFlowColor, string> = {
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  red: "bg-red-100 text-red-700 border-red-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  green: "bg-green-100 text-green-700 border-green-200",
};

const Features: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeatureAudience>("manager");

  const allFeatures = useMemo<Record<FeatureAudience, FeatureCard[]>>(
    () => ({
      manager: managerFeatures,
      staff: staffFeatures,
    }),
    []
  );

  const currentFeatures = allFeatures[activeTab];

  return (
    <section
      id="features"
      className="section-padding bg-gradient-to-b from-white to-white"
    >
      <div className="container-responsive">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Shiftize</span> powers every role on campus
          </h2>
          <p className="text-xl text-black/80 max-w-3xl mx-auto">
            Managers, tutors, and support teams operate from the same real-time schedule with zero spreadsheets.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            {tabConfig.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-black/80 hover:text-blue-600"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-black/70 max-w-2xl mx-auto mb-10">
          {tabConfig.find((tab) => tab.id === activeTab)?.description}
        </p>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {currentFeatures.map((feature) => (
            <div key={feature.id} className="card p-8 group hover:scale-105">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-bold text-black">{feature.title}</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
                      {feature.highlight}
                    </span>
                  </div>
                  <p className="text-black/80 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status Flow */}
        <div className="card p-8 mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 gradient-text">
            Shift lifecycle at a glance
          </h3>
          <p className="text-center text-black/80 mb-8">
            Every request, approval, and update is signed, stored, and traceable across the entire organisation.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4">
            {statusFlow.map((item, index) => (
              <Fragment key={`${item.status}-${index}`}>
                <div className="text-center group">
                  <div
                    className={`px-4 py-2 rounded-xl border-2 font-semibold text-sm mb-2 group-hover:scale-105 transition-transform ${statusColorClasses[item.color]}`}
                  >
                    {item.status}
                  </div>
                  <p className="text-xs text-black/70 max-w-20">{item.description}</p>
                </div>
                {index < statusFlow.length - 1 && (
                  <div className="text-black/60 text-xl hidden sm:block">→</div>
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="card p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-2xl font-bold mb-4 gradient-text">
              Experience the complete toolkit
            </h3>
            <p className="text-black/80 mb-6">
              Book a live walkthrough and see how Shiftize adapts to your academy in just a few minutes.
            </p>
            <button className="btn-primary">
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16h1m4 0h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Schedule a demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
