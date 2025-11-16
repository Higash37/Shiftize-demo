import React from "react";
import { View, Text, StyleSheet } from "react-native";

type StepItemProps = {
  number: number;
  label: string;
  completed: boolean;
  isActive: boolean;
};

const StepItem: React.FC<StepItemProps> = ({
  number,
  label,
  completed,
  isActive,
}) => {
  return (
    <View style={styles.stepContainer}>
      <View
        style={[
          styles.circle,
          completed && styles.completedCircle,
          isActive && styles.currentCircle,
        ]}
      >
        <Text
          style={[
            styles.stepNumber,
            (completed || isActive) && styles.activeStepNumber,
          ]}
        >
          {number}
        </Text>
      </View>
      <Text
        style={[
          styles.stepLabel,
          (completed || isActive) && styles.activeStepLabel,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

type StepConnectorProps = {
  completed: boolean;
};

const StepConnector: React.FC<StepConnectorProps> = ({ completed }) => {
  return <View style={[styles.line, completed && styles.completedLine]} />;
};

type StepperProps = {
  currentStep: number;
  steps: {
    label: string;
    completed: boolean;
  }[];
};

export const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const stepKey = `step-${step.label}-${index}`;
        return (
          <React.Fragment key={stepKey}>
            <StepItem
              number={index + 1}
              label={step.label}
              completed={step.completed}
              isActive={currentStep === index}
            />
            {index < steps.length - 1 && (
              <StepConnector completed={step.completed} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 4,
  },
  stepContainer: {
    alignItems: "center",
    gap: 4,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F4F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E4E8",
  },
  completedCircle: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  currentCircle: {
    borderColor: "#4A90E2",
    backgroundColor: "white",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A0A4A8",
  },
  activeStepNumber: {
    color: "#4A90E2",
  },
  stepLabel: {
    fontSize: 12,
    color: "#A0A4A8",
    fontWeight: "500",
  },
  activeStepLabel: {
    color: "#4A90E2",
  },
  line: {
    width: 40,
    height: 2,
    backgroundColor: "#E0E4E8",
    marginTop: -24,
  },
  completedLine: {
    backgroundColor: "#4A90E2",
  },
});
