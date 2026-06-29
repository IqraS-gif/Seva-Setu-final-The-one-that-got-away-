import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Modal, TouchableOpacity, Text, Image } from 'react-native';
import { AppHeader, SectionTitle, ImpactCard } from '../../components';
import { colors, spacing } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { Feather } from '@expo/vector-icons';

const ARTICLES = {
  codeOfConduct: {
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    en: {
      title: 'Code of Conduct',
      category: 'Module 1',
      readTime: '15 mins read',
      sections: [
        { heading: '1. Treat All with Respect', body: 'Every resident you interact with deserves empathy and absolute respect. Listen attentively and validate their community concerns.' },
        { heading: '2. Maintain Ethical Neutrality', body: 'SevaSetu is a non-partisan platform. Keep your personal political or religious beliefs separate from your volunteer service.' },
        { heading: '3. Data & Privacy Integrity', body: 'Any information, photos, or voice notes collected during surveys must remain strictly confidential. Never distribute resident data outside the platform.' },
        { heading: '4. Safety First', body: 'Never put yourself in danger. If a situation or area feels unsafe, withdraw immediately and notify your supervisor.' }
      ]
    },
    hi: {
      title: 'आचार संहिता',
      category: 'मॉड्यूल 1',
      readTime: '15 मिनट का पाठ',
      sections: [
        { heading: '1. सभी के साथ सम्मानपूर्वक व्यवहार करें', body: 'हर नागरिक जिसके साथ आप बातचीत करते हैं वह सहानुभूति और पूर्ण सम्मान का हकदार है। उनकी बात ध्यान से सुनें और उनकी चिंताओं को समझें।' },
        { heading: '2. नैतिक तटस्थता बनाए रखें', body: 'सेवासेतु एक गैर-पक्षपातपूर्ण मंच है। अपने व्यक्तिगत राजनीतिक या धार्मिक विश्वासों को अपनी स्वयंसेवक सेवा से अलग रखें।' },
        { heading: '3. डेटा और गोपनीयता अखंडता', body: 'सर्वेक्षण के दौरान एकत्र की गई कोई भी जानकारी, फोटो या वॉयस नोट पूरी तरह से गोपनीय रहना चाहिए। निवासी डेटा को कभी भी मंच से बाहर साझा न करें।' },
        { heading: '4. सुरक्षा सर्वोपरि', body: 'खुद को कभी भी खतरे में न डालें। यदि कोई स्थिति या क्षेत्र असुरक्षित लगता है, तो तुरंत वापस हटें और अपने पर्यवेक्षक को सूचित करें।' }
      ]
    }
  },
  privacyGuidelines: {
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
    en: {
      title: 'Privacy Guidelines',
      category: 'Module 2',
      readTime: '20 mins read',
      sections: [
        { heading: '1. Protecting Resident Identity', body: 'Only collect mandatory personal details (e.g., citizen name, phone number) when authorized by the resident. Do not share these details with third parties.' },
        { heading: '2. Safe Media Uploads', body: 'Ensure that any photos or documents uploaded as survey evidence do not show private documents, banking details, or faces of children without consent.' },
        { heading: '3. Secure Device Access', body: 'Lock your SevaSetu app session and do not share your credentials with anyone. If you suspect your account is compromised, reset your password.' }
      ]
    },
    hi: {
      title: 'गोपनीयता दिशानिर्देश',
      category: 'मॉड्यूल 2',
      readTime: '20 मिनट का पाठ',
      sections: [
        { heading: '1. नागरिक पहचान की सुरक्षा', body: 'नागरिक की अनुमति मिलने पर ही आवश्यक व्यक्तिगत विवरण (जैसे, नागरिक का नाम, फोन नंबर) एकत्र करें। इन विवरणों को किसी तीसरे पक्ष के साथ साझा न करें।' },
        { heading: '2. सुरक्षित मीडिया अपलोड', body: 'सुनिश्चित करें कि सर्वेक्षण साक्ष्य के रूप में अपलोड की गई कोई भी फोटो या दस्तावेज संवेदनशील निजी जानकारी (जैसे निजी दस्तावेज, बैंकिंग विवरण, या सहमति के बिना बच्चों के चेहरे) न दिखाएं।' },
        { heading: '3. सुरक्षित डिवाइस एक्सेस', body: 'अपने सेवासेतु ऐप सत्र को लॉक रखें और अपने लॉगिन क्रेडेंशियल किसी के साथ साझा न करें। यदि आपको संदेह है कि आपका खाता हैक हो गया है, तो अपना पासवर्ड रीसेट करें।' }
      ]
    }
  },
  disasterMgmt: {
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80',
    en: {
      title: 'Disaster Management Basics',
      category: 'Module 3',
      readTime: '25 mins read',
      sections: [
        { heading: '1. Understand the 4 Phases', body: 'Disaster management consists of: Mitigation (reducing risk), Preparedness (planning), Response (active relief), and Recovery (rebuilding).' },
        { heading: '2. Emergency Coordination', body: 'Always operate under the command of your assigned supervisor. Do not self-deploy to disaster zones without coordination.' },
        { heading: '3. Crowd Control & Calm', body: 'In emergency situations, panic is the enemy. Maintain a calm presence, speak clearly, and guide residents systematically to safety checkpoints.' }
      ]
    },
    hi: {
      title: 'आपदा प्रबंधन की मूल बातें',
      category: 'मॉड्यूल 3',
      readTime: '25 मिनट का पाठ',
      sections: [
        { heading: '1. 4 चरणों को समझें', body: 'आपदा प्रबंधन में शामिल हैं: न्यूनीकरण (जोखिम कम करना), तैयारी (योजना बनाना), प्रतिक्रिया (सक्रिय राहत), और रिकवरी (पुनर्निर्माण)।' },
        { heading: '2. आपातकालीन समन्वय', body: 'हमेशा अपने सौंपे गए पर्यवेक्षक के आदेश के तहत काम करें। बिना समन्वय के आपदा क्षेत्रों में खुद तैनात न हों।' },
        { heading: '3. भीड़ नियंत्रण और शांति', body: 'आपातकालीन स्थितियों में, घबराहट सबसे बड़ी दुश्मन है। शांत रहें, स्पष्ट रूप से बात करें, और निवासियों को व्यवस्थित रूप से सुरक्षा चौकियों की ओर निर्देशित करें।' }
      ]
    }
  },
  handlingEmergency: {
    imageUrl: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=80',
    en: {
      title: 'Handling Emergency Situations',
      category: 'Video Guide',
      readTime: '10 mins read',
      sections: [
        { heading: '1. Scene Assessment', body: 'Before offering aid, ensure the scene is safe for you. Assess potential hazards like live wires, oncoming traffic, or unstable structures.' },
        { heading: '2. Immediate First Aid Steps', body: 'Apply direct pressure to bleeding, maintain clear airways, and perform basic CPR if trained and required.' },
        { heading: '3. Calling for Reinforcements', body: 'Contact local emergency services immediately (Ambulance, Fire, Police) and update your NGO coordinator via the SevaSetu app status.' }
      ]
    },
    hi: {
      title: 'आपातकालीन स्थितियों को संभालना',
      category: 'वीडियो गाइड',
      readTime: '10 मिनट का पाठ',
      sections: [
        { heading: '1. दृश्य का आकलन', body: 'सहायता प्रदान करने से पहले, सुनिश्चित करें कि दृश्य आपके लिए सुरक्षित है। संभावित खतरों जैसे बिजली के तार, आने वाले यातायात, या अस्थिर संरचनाओं का आकलन करें।' },
        { heading: '2. तत्काल प्राथमिक चिकित्सा कदम', body: 'रक्तस्राव पर सीधा दबाव डालें, वायुमार्ग साफ रखें, और प्रशिक्षित होने पर बुनियादी सीपीआर (CPR) करें।' },
        { heading: '3. सुदृढीकरण के लिए कॉल करें', body: 'तुरंत स्थानीय आपातकालीन सेवाओं (एम्बुलेंस, फायर, पुलिस) से संपर्क करें और सेवासेतु ऐप के माध्यम से अपने एनजीओ समन्वयक को अपडेट करें।' }
      ]
    }
  },
  usingApp: {
    imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&auto=format&fit=crop&q=80',
    en: {
      title: 'Using the SevaSetu App',
      category: 'Interactive Tutorial',
      readTime: '5 mins read',
      sections: [
        { heading: '1. Browsing Tasks on the Map', body: 'Navigate to the Tasks Map tab to see geo-tagged community issues. Tap on any pin to view descriptions, category, and urgency.' },
        { heading: '2. Submitting Digital Surveys', body: 'Use the Digital Form tab to log resident complaints. You can record voice notes and attach photos directly from the field.' },
        { heading: '3. Scanning Paper Forms', body: 'Use the Scan Survey tab to take photos of printed civic surveys. The AI engine automatically extracts the text and updates the dashboard.' }
      ]
    },
    hi: {
      title: 'सेवासेतु ऐप का उपयोग करना',
      category: 'इंटरएक्टिव ट्यूटोरियल',
      readTime: '5 मिनट का पाठ',
      sections: [
        { heading: '1. मानचित्र पर कार्य खोजना', body: 'भू-टैग किए गए सामुदायिक मुद्दों को देखने के लिए कार्य मानचित्र टैब पर जाएं। विवरण, श्रेणी और तात्कालिकता देखने के लिए किसी भी पिन पर टैप करें।' },
        { heading: '2. डिजिटल सर्वेक्षण सबमिट करना', body: 'नागरिक शिकायतों को दर्ज करने के लिए डिजिटल फॉर्म टैब का उपयोग करें। आप सीधे फील्ड से वॉयस नोट रिकॉर्ड कर सकते हैं और फोटो संलग्न कर सकते हैं।' },
        { heading: '3. पेपर फॉर्म स्कैन करना', body: 'मुद्रित नागरिक सर्वेक्षणों की तस्वीरें लेने के लिए स्कैन सर्वेक्षण टैब का उपयोग करें। एआई इंजन स्वचालित रूप से पाठ निकालता है और डैशबोर्ड को अपडेट करता है।' }
      ]
    }
  },
  citizenComm: {
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&auto=format&fit=crop&q=80',
    en: {
      title: 'Effective Communication',
      category: 'Soft Skills',
      readTime: '12 mins read',
      sections: [
        { heading: '1. Active Listening', body: 'Let citizens describe their issues fully without interruption. Maintain eye contact, nod, and take notes of key keywords.' },
        { heading: '2. Empathetic Responding', body: 'Acknowledge their distress. Use phrases like "I understand this is difficult, let\'s document this details to resolve it."' },
        { heading: '3. Clarity & Transparency', body: 'Do not make false promises. Explain clearly that SevaSetu logs their reports for the civic supervisor to review and assign volunteer groups.' }
      ]
    },
    hi: {
      title: 'प्रभावी संचार',
      category: 'सॉफ्ट स्किल्स',
      readTime: '12 मिनट का पाठ',
      sections: [
        { heading: '1. सक्रिय रूप से सुनना', body: 'नागरिकों को बिना किसी बाधा के अपनी समस्याओं का पूरा वर्णन करने दें। आंखें मिलाएं, सिर हिलाएं, और मुख्य कीवर्ड लिख लें।' },
        { heading: '2. सहानुभूतिपूर्वक उत्तर देना', body: 'उनकी परेशानी को स्वीकार करें। "मैं समझता हूँ कि यह कठिन है, आइए इसे सुलझाने के लिए इन विवरणों को दर्ज करें" जैसे वाक्यांशों का उपयोग करें।' },
        { heading: '3. स्पष्टता और पारदर्शिता', body: 'झूठे वादे न करें। स्पष्ट रूप से समझाएं कि सेवासेतु उनके रिपोर्टों को नागरिक पर्यवेक्षक की समीक्षा और स्वयंसेवक समूहों को सौंपने के लिए दर्ज करता है।' }
      ]
    }
  }
};

export const LearningScreen = () => {
  const { t, language } = useLanguage();
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const openArticle = (key: keyof typeof ARTICLES) => {
    const articleData = ARTICLES[key];
    if (articleData) {
      const langVersion = articleData[language as 'en' | 'hi'] || articleData.en;
      setSelectedArticle({
        ...langVersion,
        imageUrl: articleData.imageUrl
      });
    }
  };

  const closeArticle = () => {
    setSelectedArticle(null);
  };

  return (
    <View style={styles.container}>
      <AppHeader title={t('volunteer.learning.title')} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionTitle title={t('volunteer.learning.requiredModules')} />
        <View style={styles.listContainer}>
          <TouchableOpacity onPress={() => openArticle('codeOfConduct')} activeOpacity={0.85}>
            <ImpactCard 
              title={t('volunteer.learning.codeOfConduct')}
              metric={`${t('volunteer.learning.module')} 1`}
              date={`${t('volunteer.learning.estimated')}: 15 ${t('volunteer.learning.minsRead')}`}
              imageUrl={ARTICLES.codeOfConduct.imageUrl}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openArticle('privacyGuidelines')} activeOpacity={0.85}>
            <ImpactCard 
              title={t('volunteer.learning.privacyGuidelines')}
              metric={`${t('volunteer.learning.module')} 2`}
              date={`${t('volunteer.learning.estimated')}: 20 ${t('volunteer.learning.minsRead')}`}
              imageUrl={ARTICLES.privacyGuidelines.imageUrl}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openArticle('disasterMgmt')} activeOpacity={0.85}>
            <ImpactCard 
              title={t('volunteer.learning.disasterMgmt')}
              metric={`${t('volunteer.learning.module')} 3`}
              date={`${t('volunteer.learning.estimated')}: 25 ${t('volunteer.learning.minsRead')}`}
              imageUrl={ARTICLES.disasterMgmt.imageUrl}
            />
          </TouchableOpacity>
        </View>

        <SectionTitle title={t('volunteer.learning.recommendedResources')} />
        <View style={styles.listContainer}>
          <TouchableOpacity onPress={() => openArticle('handlingEmergency')} activeOpacity={0.85}>
            <ImpactCard 
              title={t('volunteer.learning.handlingEmergency')}
              metric={t('volunteer.learning.videoGuide')}
              date={`10 ${t('volunteer.learning.minsRead')}`}
              imageUrl={ARTICLES.handlingEmergency.imageUrl}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openArticle('usingApp')} activeOpacity={0.85}>
            <ImpactCard 
              title={t('volunteer.learning.usingApp')}
              metric={t('volunteer.learning.interactiveTutorial')}
              date={`5 ${t('volunteer.learning.minsRead')}`}
              imageUrl={ARTICLES.usingApp.imageUrl}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openArticle('citizenComm')} activeOpacity={0.85}>
            <ImpactCard 
              title={t('volunteer.learning.citizenComm')}
              metric={t('volunteer.learning.softSkills')}
              date={`12 ${t('volunteer.learning.minsRead')}`}
              imageUrl={ARTICLES.citizenComm.imageUrl}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Article Detail Modal */}
      <Modal
        visible={selectedArticle !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={closeArticle}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedArticle && (
              <>
                {/* Header Image */}
                <Image source={{ uri: selectedArticle.imageUrl }} style={styles.modalImage} />
                
                {/* Floating Close Button */}
                <TouchableOpacity style={styles.closeBtn} onPress={closeArticle} activeOpacity={0.7}>
                  <Feather name="x" size={20} color="#333" />
                </TouchableOpacity>

                <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                  {/* Category and Time badge */}
                  <View style={styles.badgeRow}>
                    <View style={styles.modalCategoryBadge}>
                      <Text style={styles.modalCategoryText}>{selectedArticle.category}</Text>
                    </View>
                    <Text style={styles.modalTimeText}>🕒 {selectedArticle.readTime}</Text>
                  </View>

                  {/* Title */}
                  <Text style={styles.modalTitle}>{selectedArticle.title}</Text>

                  {/* Content Sections */}
                  {selectedArticle.sections.map((sec: any, idx: number) => (
                    <View key={idx} style={styles.sectionContainer}>
                      <Text style={styles.sectionHeading}>{sec.heading}</Text>
                      <Text style={styles.sectionBody}>{sec.body}</Text>
                    </View>
                  ))}
                  
                  {/* Done button inside ScrollView */}
                  <TouchableOpacity style={styles.doneBtn} onPress={closeArticle} activeOpacity={0.8}>
                    <Text style={styles.doneBtnText}>
                      {language === 'hi' ? 'मैंने यह मॉड्यूल पढ़ लिया है' : "I've read this module"}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  listContainer: {
    paddingHorizontal: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '85%',
    overflow: 'hidden',
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  closeBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 10,
  },
  modalScrollView: {
    flex: 1,
    padding: spacing.lg,
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modalCategoryBadge: {
    backgroundColor: '#FF8C42' + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalCategoryText: {
    color: '#FF8C42',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modalTimeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A237E', // navyBlue
    marginBottom: spacing.md,
  },
  sectionContainer: {
    marginBottom: spacing.md,
    backgroundColor: '#F8F9FA',
    padding: spacing.md,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF8C42',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },
  doneBtn: {
    marginTop: spacing.lg,
    backgroundColor: '#2E7D32', // success/green
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
