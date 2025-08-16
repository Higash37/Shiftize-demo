import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import SimpleHeader from './_marketing-widgets/SimpleHeader';

// Components
import { PageHeader } from './app-specifications/components/PageHeader';
import { TabNavigation } from './app-specifications/components/TabNavigation';
import { ArchitectureTab } from './app-specifications/components/ArchitectureTab';
import { FeaturesTab } from './app-specifications/components/FeaturesTab';
import { SecurityTab } from './app-specifications/components/SecurityTab';
import { TechnicalTab } from './app-specifications/components/TechnicalTab';

// Styles
import { styles } from './app-specifications/styles/specificationsStyles';

const AppSpecifications = () => {
  const [activeTab, setActiveTab] = useState('architecture');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'architecture':
        return <ArchitectureTab />;
      case 'features':
        return <FeaturesTab />;
      case 'security':
        return <SecurityTab />;
      case 'technical':
        return <TechnicalTab />;
      default:
        return <ArchitectureTab />;
    }
  };

  return (
    <View style={styles.container}>
      <SimpleHeader />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <PageHeader />
        
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <View style={[styles.contentContainer, styles.containerMax]}>
          {renderTabContent()}
        </View>
      </ScrollView>
    </View>
  );
};

export default AppSpecifications;