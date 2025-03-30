import { ScrollView, StyleSheet } from 'react-native';
import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function FirstAid() {
  const firstAidItems = [
    {
      title: "Basic First Aid Steps",
      content: "1. Check the scene for safety\n2. Check the person's response\n3. Call emergency services if needed\n4. Check breathing and circulation\n5. Treat severe bleeding"
    },
    {
      title: "Cuts and Scrapes",
      content: "1. Clean the wound with soap and water\n2. Apply antibiotic ointment\n3. Cover with sterile bandage\n4. Change dressing daily"
    },
    {
      title: "Burns",
      content: "1. Cool the burn under running water\n2. Cover with sterile gauze\n3. Don't break blisters\n4. Seek medical help for severe burns"
    },
    {
      title: "Sprains",
      content: "Remember RICE:\n• Rest the injury\n• Ice the area\n• Compress with bandage\n• Elevate above heart"
    }
  ];

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedText type="title">First Aid Guide</ThemedText>
        <ThemedText style={styles.subtitle}>
          Basic first aid information for common injuries
        </ThemedText>
        
        {firstAidItems.map((item, index) => (
          <Collapsible key={index} title={item.title}>
            <ThemedText style={styles.content}>
              {item.content}
            </ThemedText>
          </Collapsible>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16
  },
  subtitle: {
    marginBottom: 16,
    fontSize: 16,
    color: '#666'
  },
  content: {
    lineHeight: 24
  }
});